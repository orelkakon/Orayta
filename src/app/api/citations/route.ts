import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
import { getMasechetSeder } from '@/lib/hebrewData';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const masechet = searchParams.get('masechet');
  const seder = searchParams.get('seder');
  const search = searchParams.get('search');

  const citations = await prisma.citation.findMany({
    where: {
      ...(search ? { content: { contains: search } } : {}),
      locations: {
        some: {
          ...(masechet ? { masechet } : {}),
          ...(seder ? { seder } : {}),
        },
      },
    },
    include: { locations: true },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(citations);
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
