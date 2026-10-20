import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { GRACE_MS, questionPoints, questionWindow } from '@/lib/play/rules';
import { invalidate, loadGame, playError, playerAuth, verifyPlayer, NO_STORE } from '@/lib/play/server';

export const dynamic = 'force-dynamic';

/** One answer per player per question; scored on the server clock. */
export async function POST(req: NextRequest, { params }: { params: { code: string } }) {
  let body: { qIndex?: unknown; choice?: unknown };
  try { body = await req.json(); } catch { return playError('bad_request', 400); }

  const snap = await loadGame(params.code, true);
  if (!snap) return playError('not_found', 404);
  const auth = playerAuth(req);
  if (!auth || !(await verifyPlayer(snap, auth))) return playError('unauthorized', 401);
  const player = snap.players.find(p => p.id === auth.playerId);
  if (!player || player.kicked) return playError('unauthorized', 403);

  const qIndex = Number(body.qIndex);
  const choice = Number(body.choice);
  const q = snap.questions[qIndex];
  if (snap.status !== 'question' || snap.current !== qIndex || !q) return playError('closed', 409);
  if (!Number.isInteger(choice) || choice < 0 || choice >= q.options.length) return playError('bad_request', 400);

  const now = Date.now();
  const { opensAt, endsAt } = questionWindow(snap.phaseAt, q.leadMs, snap.questionMs);
  if (now < opensAt - 300 || now > endsAt + GRACE_MS) return playError('closed', 409);

  const correct = choice === q.correct;
  const prev = qIndex > 0
    ? await prisma.gameAnswer.findUnique({ where: { playerId_qIndex: { playerId: player.id, qIndex: qIndex - 1 } }, select: { correct: true } })
    : null;
  const streak = correct ? (prev?.correct ? player.streak : 0) + 1 : 0;
  const ms = Math.min(snap.questionMs, Math.max(0, now - opensAt));
  const points = questionPoints(correct, ms, snap.questionMs, streak);

  try {
    await prisma.$transaction([
      prisma.gameAnswer.create({ data: { sessionId: snap.id, playerId: player.id, qIndex, choice, correct, points, ms } }),
      prisma.gamePlayer.update({ where: { id: player.id }, data: { score: { increment: points }, streak } }),
    ]);
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') return playError('already', 409);
    throw e;
  }
  invalidate(snap.code);
  // The last answer in flips the question to reveal right away.
  await loadGame(snap.code, true);
  return NextResponse.json({ ok: true }, { headers: NO_STORE });
}
