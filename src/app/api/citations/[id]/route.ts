import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMasechetSeder } from '@/lib/hebrewData';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as {
    content: string;
    locations: Array<{ masechet: string; daf: string; amud?: string | null }>;
  };

  if (!body.content?.trim() || !body.locations?.length) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  await prisma.citationLocation.deleteMany({ where: { citationId: params.id } });

  const citation = await prisma.citation.update({
    where: { id: params.id },
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

  return NextResponse.json(citation);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await prisma.citation.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
