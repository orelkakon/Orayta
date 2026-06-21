import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

async function resolveRabbiId(author: string): Promise<string | null> {
  const rabbi = await prisma.rabbi.findFirst({
    where: { OR: [{ fullName: author }, { name: author }] },
    select: { id: true },
  });
  return rabbi?.id ?? null;
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as { title: string; author: string };
  const title = body.title?.trim() ?? '';
  const author = body.author?.trim() ?? '';
  if (!title || !author) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const rabbiId = await resolveRabbiId(author);
  const book = await prisma.book.update({
    where: { id: params.id },
    data: { title, author, rabbiId },
  });

  return NextResponse.json(book);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await prisma.book.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
