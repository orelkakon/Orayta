import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = (await req.json()) as {
    title?: string;
    text: string;
    date: string;
    dateEnd?: string;
    location?: string;
  };
  if (!body.text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });
  const entry = await prisma.sikumEntry.update({
    where: { id: params.id },
    data: {
      title: body.title?.trim() || null,
      text: body.text.trim(),
      date: new Date(body.date),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
      location: body.location?.trim() || null,
    },
  });
  return NextResponse.json(entry);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.sikumEntry.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
