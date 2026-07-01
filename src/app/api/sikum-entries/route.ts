import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function GET(req: NextRequest) {
  const bookId = req.nextUrl.searchParams.get('bookId');
  if (!bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  const entries = await prisma.sikumEntry.findMany({
    where: { bookId },
    orderBy: { date: 'desc' },
  });
  return NextResponse.json(entries);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const body = (await req.json()) as {
    bookId: string;
    title?: string;
    text: string;
    date: string;
    dateEnd?: string;
    location?: string;
  };
  if (!body.text?.trim()) return NextResponse.json({ error: 'text required' }, { status: 400 });
  if (!body.bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  const entry = await prisma.sikumEntry.create({
    data: {
      bookId: body.bookId,
      title: body.title?.trim() || null,
      text: body.text.trim(),
      date: new Date(body.date),
      dateEnd: body.dateEnd ? new Date(body.dateEnd) : null,
      location: body.location?.trim() || null,
    },
  });
  return NextResponse.json(entry, { status: 201 });
}
