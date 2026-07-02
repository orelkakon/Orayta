import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const entries = await prisma.sikumEntry.findMany({
    include: { book: { select: { name: true, author: true } } },
  });
  if (entries.length === 0) return NextResponse.json(null);
  const DAY = Math.floor(Date.now() / 86400000);
  return NextResponse.json(entries[DAY % entries.length]);
}
