import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { normalizeHebrewWord } from '@/lib/gematria';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const excludeValues = searchParams.getAll('exclude').map(Number).filter(v => !isNaN(v));

  const where = excludeValues.length > 0 ? { NOT: { value: { in: excludeValues } } } : {};

  const count = await prisma.gematria.count({ where });
  if (count === 0) return NextResponse.json({ error: 'no gematria' }, { status: 404 });

  const skip = Math.floor(Math.random() * count);
  const row = await prisma.gematria.findFirst({ where, skip });
  const hint = row ? normalizeHebrewWord(row.word)[0] ?? '' : '';

  return NextResponse.json({ value: row?.value ?? 0, hint });
}

export async function POST(request: NextRequest) {
  const body = await request.json() as { value: number; response: string };

  const matches = await prisma.gematria.findMany({ where: { value: body.value } });
  if (matches.length === 0) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const normalizedResponse = normalizeHebrewWord(body.response ?? '');
  const correct = matches.some(m => normalizeHebrewWord(m.word) === normalizedResponse);

  return NextResponse.json({ correct, answers: matches.map(m => m.word) });
}
