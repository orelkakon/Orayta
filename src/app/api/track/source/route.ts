import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { clientIp, makeRateLimiter } from '@/lib/minyan/server';
import { classifySource, cleanHost, cleanUtm, storedUtmSource } from '@/lib/audience/source';
import { israelToday, notRecorded, orMissing, recorded } from '@/lib/audience/server';

export const dynamic = 'force-dynamic';

// One call per browser session. A synagogue or school Wi-Fi puts many people
// behind one IP, so the limit only stops scripted inflation.
const limited = makeRateLimiter(150, 10 * 60_000);

/**
 * Where a browser session came from. Stores a daily aggregate only
 * (day × source × utm_source × utm_campaign → count) — no per-visitor row,
 * no IP, no referrer path. Answers `{ recorded }` so the client can retry a
 * ping that wasn't written.
 */
export async function POST(req: NextRequest) {
  if (isAdmin(req)) return notRecorded('admin');
  if (limited(clientIp(req))) return notRecorded('rate_limited');

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return notRecorded('bad_request');

  const utmSource = storedUtmSource(body.utmSource, body.utmMedium);
  const utmCampaign = cleanUtm(body.utmCampaign);
  const source = classifySource({
    host: cleanHost(body.ref),
    ownHost: req.headers.get('host') ?? req.nextUrl.host,
    utmSource,
  });
  const day = israelToday();

  try {
    const row = await orMissing(() => prisma.trafficSourceDaily.upsert({
      where: { day_source_utmSource_utmCampaign: { day, source, utmSource, utmCampaign } },
      update: { count: { increment: 1 } },
      create: { day, source, utmSource, utmCampaign, count: 1 },
    }), null);
    return row ? recorded() : notRecorded('unavailable');
  } catch {
    return notRecorded('error');
  }
}
