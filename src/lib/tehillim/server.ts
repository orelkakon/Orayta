import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import type { TehillimError, TehillimMode, TehillimPurpose, TehillimState } from '@/types/tehillim';
import { HOLD_MINUTES, unitCount } from './units';
import { cellsOf, completedRounds, openRound, type ClaimRow } from './assign';
import { circleStats } from './stats';
import { isClosed } from './rules';

/**
 * Server side of חלוקת תהילים: secrets, the circle snapshot (cached per
 * instance for a moment — every open page polls it), and the state a viewer
 * may see. Readers and organizers are anonymous: random keys kept on their
 * device, only their sha256 stored.
 */
const CACHE_MS = 1500;

export const newKey = () => randomBytes(24).toString('hex');
export const hashKey = (key: string) => createHash('sha256').update(`orayta_tehillim_v1|${key}`).digest('hex');

export function keyMatches(key: string | null, hash: string): boolean {
  if (!key || key.length > 128) return false;
  const a = Buffer.from(hashKey(key));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** The reader's identity: a device key of 16–128 safe chars, hashed. */
export function readerHashOf(req: NextRequest): string | null {
  const key = req.headers.get('x-tehillim-reader');
  return key && /^[\w-]{16,128}$/.test(key) ? hashKey(key) : null;
}

export function tehillimIpHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(`${ip}|orayta_tehillim_v1`).digest('hex');
}

/** ipHash of readings the admin opened — left out of the admin statistics. */
export const ADMIN_MARK = 'admin';

export const tehillimError = (error: TehillimError, status: number) =>
  NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });

export interface CircleRow {
  id: string; slug: string; manageHash: string; purpose: string; names: string[]; title: string | null; note: string | null;
  mode: string; goal: number; endsAt: Date | null; closed: boolean; books: number; createdAt: Date;
}
export interface Snapshot { circle: CircleRow; claims: ClaimRow[]; at: number }

const cache = new Map<string, Snapshot>();
export const invalidate = (slug: string) => { cache.delete(slug); };
export const holdMs = (mode: string) => HOLD_MINUTES[mode as TehillimMode] * 60_000;

export async function loadCircle(slug: string, fresh = false): Promise<Snapshot | null> {
  const hit = cache.get(slug);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit;
  const circle = await prisma.tehillimCircle.findUnique({ where: { slug } });
  if (!circle) { cache.delete(slug); return null; }
  const rows = await prisma.tehillimClaim.findMany({
    where: { circleId: circle.id },
    select: { id: true, round: true, unit: true, status: true, heldAt: true, doneAt: true, readerHash: true, readerName: true },
  });
  const claims: ClaimRow[] = rows.map(r => ({
    ...r, status: r.status === 'done' ? 'done' : 'held', heldAt: r.heldAt.getTime(), doneAt: r.doneAt?.getTime() ?? null,
  }));
  const snap = { circle, claims, at: Date.now() };
  cache.set(slug, snap);
  if (cache.size > 500) cache.delete(cache.keys().next().value as string);
  return snap;
}

/** The circle as one viewer sees it: their own hold, never anyone's identity. */
export function viewState(snap: Snapshot, readerHash: string | null, manage: boolean): TehillimState {
  const { circle, claims } = snap;
  const now = Date.now();
  const mode = circle.mode as TehillimMode;
  const units = unitCount(mode);
  const hold = holdMs(mode);
  const round = openRound(claims, units);
  const mine = readerHash ? claims.filter(c => c.readerHash === readerHash) : [];
  const held = mine.find(c => c.status === 'held' && now - c.heldAt < hold) ?? null;
  return {
    slug: circle.slug, purpose: circle.purpose as TehillimPurpose, names: circle.names, title: circle.title, note: circle.note,
    mode, goal: circle.goal, endsAt: circle.endsAt?.toISOString() ?? null, closed: isClosed(circle, now),
    createdAt: circle.createdAt.toISOString(), books: completedRounds(claims, units), round, units,
    cells: cellsOf(claims, units, round, now, hold),
    stats: circleStats(claims, mode, now, hold),
    me: readerHash ? {
      claim: held && { id: held.id, round: held.round, unit: held.unit, heldUntil: new Date(held.heldAt + hold).toISOString() },
      read: mine.filter(c => c.status === 'done').length,
    } : null,
    manage,
  };
}

export const stateResponse = (state: TehillimState) =>
  NextResponse.json(state, { headers: { 'Cache-Control': 'no-store' } });
