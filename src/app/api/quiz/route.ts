import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const count = await prisma.citation.count();
  if (count === 0) {
    return NextResponse.json({ error: 'no citations' }, { status: 404 });
  }

  const skip = Math.floor(Math.random() * count);
  const citation = await prisma.citation.findFirst({
    skip,
    include: { locations: true },
  });

  return NextResponse.json(citation);
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    citationId: string;
    masechet: string;
    daf: string;
    amud: string | null;
  };

  const citation = await prisma.citation.findUnique({
    where: { id: body.citationId },
    include: { locations: true },
  });

  if (!citation) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const isCorrect = citation.locations.some((loc) => {
    const masechetMatch = loc.masechet === body.masechet;
    const dafMatch = loc.daf === body.daf.trim();
    const amudMatch = loc.amud === (body.amud ?? null);
    return masechetMatch && dafMatch && amudMatch;
  });

  await prisma.quizResult.create({
    data: { citationId: body.citationId, isCorrect },
  });

  return NextResponse.json({ isCorrect, correctLocations: citation.locations });
}
