import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  const [citations, rabbis, books, summaries, gematrias, chidushim] = await Promise.all([
    prisma.citation.count(),
    prisma.rabbi.count(),
    prisma.book.count(),
    prisma.sikumEntry.count(),
    prisma.gematria.count(),
    prisma.chidush.count(),
  ]);
  return NextResponse.json({ citations, rabbis, books, summaries, gematrias, chidushim });
}
