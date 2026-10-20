import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { generateCode, validateSettings } from '@/lib/play/rules';
import { questionsFor } from '@/lib/play/questionsServer';
import { hashKey, newKey, playError, playIpHash, NO_STORE } from '@/lib/play/server';

export const dynamic = 'force-dynamic';

// Anyone may host a game (a rabbi before a shiur needs no account), so game
// creation is rate-limited per IP; old games are swept on every create.
const CREATE_PER_HOUR = 10;
const KEEP_MS = 3 * 86400_000;

export async function POST(req: NextRequest) {
  let body: unknown;
  try { body = await req.json(); } catch { return playError('bad_request', 400); }
  const settings = validateSettings(body);
  if (!settings) return playError('bad_request', 400);

  const ipHash = playIpHash(req);
  const recent = await prisma.gameSession.count({ where: { ipHash, createdAt: { gte: new Date(Date.now() - 3600_000) } } });
  if (recent >= CREATE_PER_HOUR && !isAdmin(req)) return playError('rate_limited', 429);

  const questions = await questionsFor(settings);
  if (questions.length < 3) return playError('not_enough', 422);

  await prisma.gameSession.deleteMany({ where: { createdAt: { lt: new Date(Date.now() - KEEP_MS) } } });

  const hostKey = newKey();
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = generateCode();
    try {
      await prisma.gameSession.create({
        data: {
          code,
          hostHash: hashKey(hostKey),
          questions: questions as unknown as Prisma.InputJsonValue,
          settings: { ...settings, count: questions.length } as unknown as Prisma.InputJsonValue,
          questionMs: settings.seconds * 1000,
          ipHash,
        },
      });
      return NextResponse.json({ code, hostKey }, { headers: NO_STORE });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') continue;
      throw e;
    }
  }
  return playError('rate_limited', 503);
}
