import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseEntryInput } from '@/lib/sikum/entryInput';

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
  const body = await req.json().catch(() => null) as { bookId?: unknown } | null;
  const input = parseEntryInput(body);
  if (!input) return NextResponse.json({ error: 'text required' }, { status: 400 });
  if (typeof body?.bookId !== 'string' || !body.bookId) return NextResponse.json({ error: 'bookId required' }, { status: 400 });
  const entry = await prisma.sikumEntry.create({ data: { bookId: body.bookId, ...input } });
  return NextResponse.json(entry, { status: 201 });
}
