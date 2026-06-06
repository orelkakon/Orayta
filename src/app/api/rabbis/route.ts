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

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as {
    name: string; fullName?: string; sortYear: number;
    datePeriod: string; isAlive: boolean; bio: string; category: string;
  };

  const existing = await prisma.rabbi.findFirst({
    where: { name: { equals: body.name.trim(), mode: 'insensitive' } },
  });
  if (existing) return NextResponse.json({ existing }, { status: 409 });

  const rabbi = await prisma.rabbi.create({
    data: {
      name: body.name,
      fullName: body.fullName ?? null,
      sortYear: body.sortYear,
      datePeriod: body.datePeriod,
      isAlive: body.isAlive,
      bio: body.bio,
      category: body.category,
    },
  });

  return NextResponse.json(rabbi, { status: 201 });
}
