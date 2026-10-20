import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { PlayHostAction } from '@/types/play';
import { nextPhase } from '@/lib/play/rules';
import { invalidate, isHostOf, loadGame, playError, transition, NO_STORE } from '@/lib/play/server';

export const dynamic = 'force-dynamic';

const PHASE_ACTIONS = ['start', 'reveal', 'board', 'next', 'end'] as const;

function parse(body: unknown): PlayHostAction | null {
  if (typeof body !== 'object' || body === null) return null;
  const b = body as Record<string, unknown>;
  if (b.action === 'kick' && typeof b.playerId === 'string') return { action: 'kick', playerId: b.playerId };
  const a = PHASE_ACTIONS.find(x => x === b.action);
  return a ? { action: a } : null;
}

/** Host controls — authorized by the host's secret key (x-play-host). */
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  let raw: unknown;
  try { raw = await req.json(); } catch { return playError('bad_request', 400); }
  const action = parse(raw);
  if (!action) return playError('bad_request', 400);

  const snap = await loadGame(params.code, true);
  if (!snap) return playError('not_found', 404);
  if (!isHostOf(snap, req)) return playError('unauthorized', 401);

  if (action.action === 'kick') {
    await prisma.gamePlayer.updateMany({ where: { id: action.playerId, sessionId: snap.id }, data: { kicked: true } });
    invalidate(snap.code);
    return NextResponse.json({ ok: true }, { headers: NO_STORE });
  }

  const change = nextPhase(snap.status, snap.current, snap.questions.length, action.action);
  if (!change) return playError('closed', 409);
  const ok = await transition(snap, change);
  return NextResponse.json({ ok }, { headers: NO_STORE });
}
