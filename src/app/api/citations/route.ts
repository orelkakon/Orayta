import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMasechetSeder } from '@/lib/hebrewData';
import { sortCitations } from '@/lib/citationsSort';

export const dynamic = 'force-dynamic';

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
  if (!isAdmin(request)) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await request.json() as {
    content: string;
    locations: Array<{ masechet: string; daf: string; amud?: string | null }>;
  };

  if (!body.content?.trim() || !body.locations?.length) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const normalized = body.content.trim().replace(/\s+/g, ' ');
  const existing = await prisma.citation.findFirst({
    where: { content: { equals: normalized, mode: 'insensitive' } },
    include: { locations: true },
  });
  if (existing) return NextResponse.json({ existing }, { status: 409 });

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
