import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const books = await prisma.book.findMany({ orderBy: { title: 'asc' } });
  return NextResponse.json(books);
}

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as { title: string; author: string };
  const title = body.title?.trim() ?? '';
  const author = body.author?.trim() ?? '';
  if (!title || !author) {
    return NextResponse.json({ error: 'missing fields' }, { status: 400 });
  }

  const existing = await prisma.book.findFirst({
    where: { title: { equals: title, mode: 'insensitive' } },
  });
  if (existing) return NextResponse.json({ existing }, { status: 409 });

  const book = await prisma.book.create({ data: { title, author } });
  return NextResponse.json(book, { status: 201 });
}
