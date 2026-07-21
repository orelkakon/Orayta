import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { calculateGematria, normalizeHebrewWord } from '@/lib/gematria';

export const dynamic = 'force-dynamic';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as { word: string };
  const word = body.word?.trim();
  if (!word || !normalizeHebrewWord(word)) {
    return NextResponse.json({ error: 'missing word' }, { status: 400 });
  }

  const gematria = await prisma.gematria.update({
    where: { id: params.id },
    data: { word, value: calculateGematria(word) },
  });

  return NextResponse.json(gematria);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await prisma.gematria.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
