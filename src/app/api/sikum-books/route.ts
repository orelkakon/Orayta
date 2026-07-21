import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  const books = await prisma.sikumBook.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { entries: true } } },
  });
  return NextResponse.json(
    books.map(b => ({ ...b, entryCount: b._count.entries, _count: undefined }))
  );
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { name, author, icon } = (await req.json()) as { name: string; author?: string; icon?: string };
  if (!name?.trim()) return NextResponse.json({ error: 'name required' }, { status: 400 });
  const book = await prisma.sikumBook.create({
    data: { name: name.trim(), author: author?.trim() || null, icon: icon || '📒' },
    include: { _count: { select: { entries: true } } },
  });
  return NextResponse.json({ ...book, entryCount: book._count.entries, _count: undefined }, { status: 201 });
}
