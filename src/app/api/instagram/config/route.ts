import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const KEY = 'reel_max_seconds';
const DEFAULT_MAX_SECONDS = 60;

export async function GET() {
  const row = await prisma.appConfig.findUnique({ where: { key: KEY } });
  const maxSeconds = row ? parseInt(row.value, 10) : DEFAULT_MAX_SECONDS;
  return NextResponse.json({ maxSeconds: Number.isFinite(maxSeconds) ? maxSeconds : DEFAULT_MAX_SECONDS });
}

/** Admin: update max reel duration. Body: { maxSeconds: number } */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { maxSeconds?: number };
  const maxSeconds = Math.floor(Number(body.maxSeconds));
  if (!Number.isFinite(maxSeconds) || maxSeconds < 10 || maxSeconds > 600) {
    return NextResponse.json({ error: 'maxSeconds must be 10-600' }, { status: 400 });
  }

  await prisma.appConfig.upsert({
    where: { key: KEY },
    update: { value: String(maxSeconds) },
    create: { key: KEY, value: String(maxSeconds) },
  });
  return NextResponse.json({ maxSeconds });
}
