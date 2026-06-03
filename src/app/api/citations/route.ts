import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db';
import { getMasechetSeder, sederIndex, masechetIndex, dafToNumber } from '@/lib/hebrewData';

export const dynamic = 'force-dynamic';

type CitationWithLocations = Prisma.CitationGetPayload<{ include: { locations: true } }>;

function sortCitations(list: CitationWithLocations[]): CitationWithLocations[] {
  return [...list].sort((a, b) => {
    const la = a.locations[0];
    const lb = b.locations[0];
    if (!la || !lb) return 0;
    const sd = sederIndex(la.seder) - sederIndex(lb.seder);
    if (sd !== 0) return sd;
    const md = masechetIndex(la.masechet) - masechetIndex(lb.masechet);
    if (md !== 0) return md;
    return dafToNumber(la.daf) - dafToNumber(lb.daf);
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const masechet = searchParams.get('masechet');
  const seder = searchParams.get('seder');
  const search = searchParams.get('search');
  const random = searchParams.get('random') === 'true';

  const where = {
    ...(search ? { content: { contains: search } } : {}),
    locations: {
      some: {
        ...(masechet ? { masechet } : {}),
        ...(seder ? { seder } : {}),
      },
    },
  };

  if (random) {
    const count = await prisma.citation.count({ where });
    if (count === 0) return NextResponse.json(null);
    const skip = Math.floor(Math.random() * count);
    const citation = await prisma.citation.findFirst({ where, skip, include: { locations: true } });
    return NextResponse.json(citation);
  }

  const citations = await prisma.citation.findMany({ where, include: { locations: true } });
  return NextResponse.json(sortCitations(citations));
}

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    content: string;
    locations: Array<{ masechet: string; daf: string; amud?: string | null }>;
  };

  if (!body.content?.trim() || !body.locations?.length) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const citation = await prisma.citation.create({
    data: {
      content: body.content.trim(),
      locations: {
        create: body.locations.map((loc) => ({
          masechet: loc.masechet,
          seder: getMasechetSeder(loc.masechet),
          daf: loc.daf.trim(),
          amud: loc.amud ?? null,
        })),
      },
    },
    include: { locations: true },
  });

  return NextResponse.json(citation, { status: 201 });
}
