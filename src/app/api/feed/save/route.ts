import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const KEY = 'feedSaves';

export async function GET() {
  const row = await prisma.globalCounter.findUnique({ where: { key: KEY } });
  return NextResponse.json({ count: row?.value ?? 0 });
}

export async function POST() {
  const row = await prisma.globalCounter.upsert({
    where: { key: KEY },
    update: { value: { increment: 1 } },
    create: { key: KEY, value: 1 },
  });
  return NextResponse.json({ count: row.value });
}
