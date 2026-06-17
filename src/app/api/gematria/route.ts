import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { calculateGematria, normalizeHebrewWord } from '@/lib/gematria';

export const dynamic = 'force-dynamic';

export async function GET() {
  const items = await prisma.gematria.findMany({ orderBy: { value: 'asc' } });
  return NextResponse.json(items);
}

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as { word: string };
  const word = body.word?.trim();
  if (!word || !normalizeHebrewWord(word)) {
    return NextResponse.json({ error: 'missing word' }, { status: 400 });
  }

  const existing = await prisma.gematria.findFirst({
    where: { word: { equals: word, mode: 'insensitive' } },
  });
  if (existing) return NextResponse.json({ existing }, { status: 409 });

  const gematria = await prisma.gematria.create({
    data: { word, value: calculateGematria(word) },
  });

  return NextResponse.json(gematria, { status: 201 });
}
