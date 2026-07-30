import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { cachedJson } from '@/lib/apiCache';

export async function GET() {
  const items = await prisma.chidush.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return cachedJson(items);
}

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { text, source, author } = (await req.json()) as {
    text: string;
    source?: string;
    author?: string;
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const item = await prisma.chidush.create({
    data: {
      text: text.trim(),
      source: source?.trim() || null,
      author: author?.trim() || null,
    },
  });

  return NextResponse.json(item, { status: 201 });
}
