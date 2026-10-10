import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { PLACE_ID_RE, isPlausibleTime } from '@/lib/minyan/confidence';
import { clientIp, loadPlaceData, makeRateLimiter, reporterId } from '@/lib/minyan/server';
import type { DayType, MinyanReportInput, PrayerService, ReportKind } from '@/types/minyan';

export const dynamic = 'force-dynamic';

const SERVICES: PrayerService[] = ['shacharit', 'mincha', 'maariv'];
const DAY_TYPES: DayType[] = ['weekday', 'shabbat'];
const KINDS: ReportKind[] = ['confirm', 'dispute'];

const limited = makeRateLimiter(15, 60 * 60 * 1000); // 15 reports per IP per hour

function parseInput(body: unknown): MinyanReportInput | null {
  if (!body || typeof body !== 'object') return null;
  const b = body as Record<string, unknown>;
  const placeId = typeof b.placeId === 'string' ? b.placeId : '';
  const service = SERVICES.find(s => s === b.service);
  const dayType = DAY_TYPES.find(d => d === b.dayType);
  const kind = KINDS.find(k => k === b.kind);
  const time = typeof b.time === 'string' ? b.time : '';
  if (!PLACE_ID_RE.test(placeId) || !service || !dayType || !kind) return null;
  if (!isPlausibleTime(service, time)) return null;
  return { placeId, service, dayType, time, kind };
}

/**
 * Public: report a minyan time ("confirm") or say a listed time is wrong
 * ("dispute"). One vote per person per time — repeating it only refreshes
 * its date. Admin submissions are stored as verified.
 * Returns the place's re-graded times.
 */
export async function POST(req: NextRequest) {
  const admin = isAdmin(req);
  if (!admin && limited(clientIp(req))) return NextResponse.json({ error: 'rate limited' }, { status: 429 });

  const input = parseInput(await req.json().catch(() => null));
  if (!input) return NextResponse.json({ error: 'invalid report' }, { status: 400 });

  const reporter = admin ? 'admin' : reporterId(req);
  // A dispute by an admin removes the time outright instead of being a vote.
  if (admin && input.kind === 'dispute') {
    await prisma.minyanReport.deleteMany({
      where: { placeId: input.placeId, service: input.service, dayType: input.dayType, time: input.time },
    });
  } else {
    const where = { placeId_service_dayType_time_kind_reporter: { ...input, reporter } };
    await prisma.minyanReport.upsert({
      where,
      create: { ...input, reporter, verified: admin },
      update: { createdAt: new Date(), verified: admin },
    });
  }

  const { times } = await loadPlaceData([input.placeId]);
  return NextResponse.json({ times: times.get(input.placeId) ?? [] }, { status: 201 });
}
