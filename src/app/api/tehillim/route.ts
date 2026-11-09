import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { newSlug, validateCreate } from '@/lib/tehillim/rules';
import { ADMIN_MARK, hashKey, newKey, tehillimError, tehillimIpHash } from '@/lib/tehillim/server';

export const dynamic = 'force-dynamic';

/**
 * POST /api/tehillim — opens a new reading. Returns its public slug and the
 * organizer's secret key (kept on their device; only its hash is stored).
 * 6 per hour per hashed IP (admin exempt); readings idle for 180 days are
 * deleted on the way.
 */
const PER_HOUR = 6;
const IDLE_DAYS = 180;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || (typeof body.website === 'string' && body.website.trim())) return tehillimError('bad_request', 400);
  const v = validateCreate(body);
  if (!v.ok) return NextResponse.json({ error: 'bad_request', field: v.field }, { status: 400 });

  // The admin's own (test) readings are marked so the site statistics can leave them out.
  const admin = isAdmin(req);
  const ipHash = admin ? ADMIN_MARK : tehillimIpHash(req);
  if (!admin) {
    const recent = await prisma.tehillimCircle.count({ where: { ipHash, createdAt: { gt: new Date(Date.now() - 3600_000) } } });
    if (recent >= PER_HOUR) return tehillimError('rate_limited', 429);
  }
  await prisma.tehillimCircle.deleteMany({ where: { activeAt: { lt: new Date(Date.now() - IDLE_DAYS * 86_400_000) } } });

  const manageKey = newKey();
  const { purpose, names, title, note, mode, goal, endsAt } = v.value;
  for (let i = 0; i < 5; i++) {
    const slug = newSlug();
    try {
      await prisma.tehillimCircle.create({
        data: { slug, manageHash: hashKey(manageKey), purpose, names, title, note, mode, goal, endsAt: endsAt ? new Date(endsAt) : null, ipHash },
      });
      return NextResponse.json({ slug, manageKey }, { status: 201 });
    } catch {
      // Slug collision — try another.
    }
  }
  return tehillimError('unavailable', 503);
}
