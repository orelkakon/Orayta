import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

export async function GET() {
  const count = await prisma.pageVisit.count();
  return NextResponse.json({ count });
}

export async function POST(req: NextRequest) {
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '0.0.0.0';

  const ipHash = createHash('sha256').update(raw + 'orayta_visits_2024').digest('hex');

  const exists = await prisma.pageVisit.findUnique({ where: { ipHash } });
  if (!exists) {
    await prisma.pageVisit.create({ data: { ipHash } });
  }

  const count = await prisma.pageVisit.count();
  return NextResponse.json({ count });
}
