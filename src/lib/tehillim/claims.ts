import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import type { TehillimError, TehillimMode } from '@/types/tehillim';
import { unitCount } from './units';
import { completedRounds, pickUnit } from './assign';
import { MIN_READ_MS, isClosed } from './rules';
import { holdMs, invalidate, loadCircle } from './server';

/**
 * Taking, finishing and releasing units. Writes race freely across devices
 * and instances: a new unit is a create guarded by the (circle, round, unit)
 * unique key, a reused expired hold an update guarded by its old heldAt —
 * the loser simply picks again.
 */
type Result<T> = { ok: true; value: T } | { ok: false; error: TehillimError };
const ATTEMPTS = 6;

export async function takeUnit(slug: string, readerHash: string, want: number | null): Promise<Result<{ id: string }>> {
  for (let i = 0; i < ATTEMPTS; i++) {
    const snap = await loadCircle(slug, true);
    if (!snap) return { ok: false, error: 'not_found' };
    const { circle, claims } = snap;
    const now = Date.now();
    if (isClosed(circle, now)) return { ok: false, error: 'closed' };
    const units = unitCount(circle.mode as TehillimMode);
    if (want !== null && (!Number.isInteger(want) || want < 0 || want >= units)) return { ok: false, error: 'bad_request' };
    const hold = holdMs(circle.mode);
    // One unit at a time: asking for another hands back the one held.
    await prisma.tehillimClaim.deleteMany({ where: { circleId: circle.id, readerHash, status: 'held' } });
    const others = claims.filter(c => !(c.readerHash === readerHash && c.status === 'held'));
    const pick = pickUnit(others, units, now, hold, want);
    try {
      if (pick.kind === 'new') {
        const row = await prisma.tehillimClaim.create({
          data: { circleId: circle.id, round: pick.round, unit: pick.unit, status: 'held', readerHash },
          select: { id: true },
        });
        return done(slug, circle.id, row.id);
      }
      const won = await prisma.tehillimClaim.updateMany({
        where: { id: pick.id, status: 'held', heldAt: new Date(pick.heldAt) },
        data: { readerHash, heldAt: new Date(), readerName: null },
      });
      if (won.count === 1) return done(slug, circle.id, pick.id);
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
    }
    invalidate(slug);
  }
  return { ok: false, error: 'taken' };
}

async function done(slug: string, circleId: string, id: string): Promise<Result<{ id: string }>> {
  invalidate(slug);
  await prisma.tehillimCircle.update({ where: { id: circleId }, data: { activeAt: new Date() } });
  return { ok: true, value: { id } };
}

/** Marks the reader's unit read (even after its hold expired, unless someone else took it meanwhile). */
export async function finishUnit(slug: string, readerHash: string, id: string, name: string | null): Promise<Result<null>> {
  const snap = await loadCircle(slug, true);
  if (!snap) return { ok: false, error: 'not_found' };
  const claim = snap.claims.find(c => c.id === id);
  if (!claim || claim.readerHash !== readerHash) return { ok: false, error: 'forbidden' };
  if (claim.status === 'done') return { ok: true, value: null };
  if (Date.now() - claim.heldAt < MIN_READ_MS) return { ok: false, error: 'too_soon' };
  const res = await prisma.tehillimClaim.updateMany({
    where: { id, readerHash, status: 'held' },
    data: { status: 'done', doneAt: new Date(), readerName: name },
  });
  if (res.count === 0) return { ok: false, error: 'forbidden' };
  // Completed books are recounted, not incremented: two last readers finishing together can't count it twice.
  const fresh = await loadCircle(slug, true);
  if (fresh) {
    const books = completedRounds(fresh.claims, unitCount(fresh.circle.mode as TehillimMode));
    await prisma.tehillimCircle.update({ where: { id: fresh.circle.id }, data: { books, activeAt: new Date() } });
  }
  invalidate(slug);
  return { ok: true, value: null };
}

export async function releaseUnit(slug: string, readerHash: string, id: string): Promise<void> {
  await prisma.tehillimClaim.deleteMany({ where: { id, readerHash, status: 'held' } });
  invalidate(slug);
}
