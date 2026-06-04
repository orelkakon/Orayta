import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const rabbis = await prisma.rabbi.findMany({
    where: category && category !== 'all' ? { category } : undefined,
    orderBy: { sortYear: 'asc' },
  });

  return NextResponse.json(rabbis);
}
