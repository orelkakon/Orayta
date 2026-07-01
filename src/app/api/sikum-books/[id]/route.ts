import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, author, icon } = (await req.json()) as { name: string; author?: string; icon?: string };
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const book = await prisma.sikumBook.update({
    where: { id: params.id },
    data: { name: name.trim(), author: author?.trim() || null, icon: icon || '📒' },
    include: { _count: { select: { entries: true } } },
  });
  return NextResponse.json({ ...book, entryCount: book._count.entries, _count: undefined });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.sikumBook.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
