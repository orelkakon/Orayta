import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function calcScore(
  answer: { masechet: string; daf: string; amud: string | null },
  loc: { masechet: string; daf: string; amud: string | null }
): number {
  if (answer.masechet !== loc.masechet) return 0;
  if (answer.daf.trim() !== loc.daf) return 0;
  if (!loc.amud) return 1;           // no amud on this location → full point for daf
  if (answer.amud === loc.amud) return 1;  // daf + amud both correct
  return 0.5;                        // daf correct, amud wrong/missing
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const masechet = searchParams.get('masechet');
  const seder = searchParams.get('seder');

  const where = masechet || seder
    ? { locations: { some: { ...(masechet ? { masechet } : {}), ...(seder ? { seder } : {}) } } }
    : {};

  const count = await prisma.citation.count({ where });
  if (count === 0) return NextResponse.json({ error: 'no citations' }, { status: 404 });

  const skip = Math.floor(Math.random() * count);
  const citation = await prisma.citation.findFirst({ where, skip, include: { locations: true } });

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

  if (!citation) return NextResponse.json({ error: 'not found' }, { status: 404 });
  if (citation.locations.length === 0) return NextResponse.json({ error: 'no locations' }, { status: 404 });

  const score = Math.max(...citation.locations.map((loc) => calcScore(body, loc)));
  return NextResponse.json({ score, correctLocations: citation.locations });
}
