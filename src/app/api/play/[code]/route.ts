import { NextRequest, NextResponse } from 'next/server';
import { buildState } from '@/lib/play/state';
import { isHostOf, loadGame, playError, playerAuth, verifyPlayer, NO_STORE } from '@/lib/play/server';

export const dynamic = 'force-dynamic';

/** Polled by every device (~1/s): the game as this viewer may see it. */
export async function GET(req: NextRequest, { params }: { params: { code: string } }) {
  const snap = await loadGame(params.code);
  if (!snap) return playError('not_found', 404);
  const auth = playerAuth(req);
  const playerId = auth && (await verifyPlayer(snap, auth)) ? auth.playerId : undefined;
  return NextResponse.json(buildState(snap, { playerId, isHost: isHostOf(snap, req) }, Date.now()), { headers: NO_STORE });
}
