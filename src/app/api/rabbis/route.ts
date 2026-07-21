import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  const rabbis = await prisma.rabbi.findMany({
    where: category && category !== 'all' ? { category } : undefined,
    orderBy: { sortYear: 'asc' },
  });

  return NextResponse.json(rabbis);
}

function extractBooksFromBio(bio: string, author: string, rabbiId: string) {
  const books: Array<{ title: string; author: string; rabbiId: string }> = [];
  const regex = /כתב את\s+([^.]+)\.?/g;
  let match;
  while ((match = regex.exec(bio)) !== null) {
    const titles = match[1].split(',').map(t => t.trim()).filter(t => t.length > 0);
    for (const title of titles) {
      books.push({ title, author, rabbiId });
    }
  }
  return books;
}

export async function POST(request: NextRequest) {
  if (!isAdmin(request)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });

  const body = await request.json() as {
    name: string; fullName?: string; sortYear: number;
    datePeriod: string; isAlive: boolean; bio: string; category: string; deathDate?: string; imageUrl?: string;
  };

  const existing = await prisma.rabbi.findFirst({
    where: { name: { equals: body.name.trim(), mode: 'insensitive' } },
  });
  if (existing) return NextResponse.json({ existing }, { status: 409 });

  const rabbi = await prisma.rabbi.create({
    data: {
      name: body.name,
      fullName: body.fullName ?? null,
      sortYear: body.sortYear,
      datePeriod: body.datePeriod,
      isAlive: body.isAlive,
      bio: body.bio,
      category: body.category,
      deathDate: body.deathDate?.trim() || null,
      imageUrl: body.imageUrl?.trim() || null,
    },
  });

  const booksToCreate = extractBooksFromBio(body.bio, rabbi.name, rabbi.id);
  if (booksToCreate.length > 0) {
    await prisma.book.createMany({ data: booksToCreate });
  }

  return NextResponse.json(rabbi, { status: 201 });
}
