import { createHash, randomBytes, timingSafeEqual } from 'crypto';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { PlayErrorCode, PlayQuestion, PlaySettings, PlayStatus } from '@/types/play';
import { SESSION_TTL_MS, isCode, type PhaseChange } from './rules';
import { shouldAutoReveal, type Snapshot } from './state';

/**
 * Server side of the group quiz: secrets, rate-limit identity, and the
 * snapshot cache. Every device polls the game about once a second, so the
 * shared part of the state is cached per instance for a fraction of a second
 * and invalidated by any write on that instance.
 */
const CACHE_MS = 600;
const cache = new Map<string, { snap: ServerSnap; at: number }>();

/** A snapshot plus the secrets only the server may see. */
export type ServerSnap = Snapshot & { hostHash: string; keyHashes: Map<string, string> };

export const newKey = () => randomBytes(24).toString('hex');
export const hashKey = (key: string) => createHash('sha256').update(`orayta_play_v1|${key}`).digest('hex');

export function keyMatches(key: string | null, hash: string): boolean {
  if (!key) return false;
  const a = Buffer.from(hashKey(key));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function playIpHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(`${ip}|orayta_play_v1`).digest('hex');
}

export function playError(error: PlayErrorCode, status: number): NextResponse {
  return NextResponse.json({ error }, { status, headers: { 'Cache-Control': 'no-store' } });
}

export function invalidate(code: string): void {
  cache.delete(code);
}

async function readSnapshot(code: string): Promise<ServerSnap | null> {
  const row = await prisma.gameSession.findUnique({
    where: { code },
    include: { players: { orderBy: { joinedAt: 'asc' } } },
  });
  if (!row || Date.now() - row.createdAt.getTime() > SESSION_TTL_MS) return null;
  const answers = row.current >= 0
    ? await prisma.gameAnswer.findMany({
        where: { sessionId: row.id, qIndex: row.current },
        select: { playerId: true, choice: true, correct: true, points: true },
      })
    : [];
  return {
    id: row.id, code: row.code, hostHash: row.hostHash,
    status: row.status as PlayStatus, current: row.current,
    phaseAt: row.phaseAt.getTime(), questionMs: row.questionMs, version: row.version,
    settings: row.settings as unknown as PlaySettings,
    questions: row.questions as unknown as PlayQuestion[],
    players: row.players.map(p => ({ id: p.id, name: p.name, avatar: p.avatar, score: p.score, streak: p.streak, kicked: p.kicked })),
    answers,
    keyHashes: new Map(row.players.map(p => [p.id, p.keyHash])),
  };
}

/** Moves the game to a new phase only if nobody else moved it first. */
export async function transition(snap: Snapshot, change: PhaseChange): Promise<boolean> {
  const res = await prisma.gameSession.updateMany({
    where: { id: snap.id, version: snap.version },
    data: { status: change.status, current: change.current, phaseAt: new Date(), version: { increment: 1 } },
  });
  invalidate(snap.code);
  return res.count === 1;
}

/** Current snapshot (cached briefly); applies an overdue auto-reveal first. */
export async function loadGame(code: string, fresh = false): Promise<ServerSnap | null> {
  if (!isCode(code)) return null;
  const hit = cache.get(code);
  if (!fresh && hit && Date.now() - hit.at < CACHE_MS) return hit.snap;
  let snap = await readSnapshot(code);
  if (snap && shouldAutoReveal(snap, Date.now())) {
    await transition(snap, { status: 'reveal', current: snap.current });
    snap = await readSnapshot(code);
  }
  if (snap) cache.set(code, { snap, at: Date.now() });
  else cache.delete(code);
  return snap;
}

export interface PlayerAuth { playerId: string; key: string | null; }

export function playerAuth(req: NextRequest): PlayerAuth | null {
  const playerId = req.headers.get('x-play-id');
  return playerId ? { playerId, key: req.headers.get('x-play-key') } : null;
}

/** Verifies a player's secret — from the snapshot, or the DB for a player
    who joined after it was cached. */
export async function verifyPlayer(snap: ServerSnap, auth: PlayerAuth | null): Promise<boolean> {
  if (!auth) return false;
  const known = snap.keyHashes.get(auth.playerId);
  if (known) return keyMatches(auth.key, known);
  const p = await prisma.gamePlayer.findFirst({ where: { id: auth.playerId, sessionId: snap.id }, select: { keyHash: true } });
  return !!p && keyMatches(auth.key, p.keyHash);
}

export function isHostOf(snap: ServerSnap, req: NextRequest): boolean {
  return keyMatches(req.headers.get('x-play-host'), snap.hostHash);
}

export const NO_STORE = { 'Cache-Control': 'no-store' };
