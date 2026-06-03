import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const exclude = searchParams.get('exclude') ?? '';
  const seder = searchParams.get('seder');
  const masechet = searchParams.get('masechet');

  const where: Prisma.CitationWhereInput = {};
  if (exclude) where.NOT = { id: exclude };
  if (masechet || seder) {
    where.locations = {
      some: {
        ...(masechet ? { masechet } : {}),
        ...(seder ? { seder } : {}),
      },
    };
  }

  const allIds = await prisma.citation.findMany({ where, select: { id: true } });
  if (allIds.length < 3) {
    return NextResponse.json({ error: 'not enough citations' }, { status: 404 });
  }

  const picked = [...allIds].sort(() => Math.random() - 0.5).slice(0, 3);

  const citations = await prisma.citation.findMany({
    where: { id: { in: picked.map((c) => c.id) } },
    include: { locations: true },
  });

  return NextResponse.json(citations.map((c) => c.locations[0]).filter(Boolean));
}
