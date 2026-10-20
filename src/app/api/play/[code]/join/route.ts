import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { MAX_PLAYERS, validateAvatar, validateName } from '@/lib/play/rules';
import { activePlayers } from '@/lib/play/state';
import { hashKey, invalidate, loadGame, newKey, playError, playIpHash, NO_STORE } from '@/lib/play/server';

export const dynamic = 'force-dynamic';

// A whole beit midrash may share one Wi-Fi IP — generous, but still capped.
const JOINS_PER_10_MIN = 80;

export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  let body: { name?: unknown; avatar?: unknown };
  try { body = await req.json(); } catch { return playError('bad_request', 400); }

  const snap = await loadGame(params.code, true);
  if (!snap) return playError('not_found', 404);
  if (snap.status === 'ended') return playError('ended', 410);

  const name = validateName(body.name);
  if (!name) return playError('name_invalid', 400);
  if (activePlayers(snap).length >= MAX_PLAYERS) return playError('full', 409);
  if (snap.players.some(p => p.name === name)) return playError('name_taken', 409);

  const ipHash = playIpHash(req);
  const recent = await prisma.gamePlayer.count({ where: { ipHash, joinedAt: { gte: new Date(Date.now() - 600_000) } } });
  if (recent >= JOINS_PER_10_MIN) return playError('rate_limited', 429);

  const key = newKey();
  const avatar = validateAvatar(body.avatar);
  try {
    const p = await prisma.gamePlayer.create({
      data: { sessionId: snap.id, name, avatar, keyHash: hashKey(key), ipHash },
      select: { id: true },
    });
    invalidate(snap.code);
    return NextResponse.json({ playerId: p.id, key, name, avatar }, { headers: NO_STORE });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return playError('name_taken', 409);
    throw e;
  }
}
