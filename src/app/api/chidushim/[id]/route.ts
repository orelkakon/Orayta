import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

interface Ctx { params: { id: string } }

export async function PUT(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { text, source, author } = (await req.json()) as {
    text: string;
    source?: string;
    author?: string;
  };

  if (!text?.trim()) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const item = await prisma.chidush.update({
    where: { id: params.id },
    data: {
      text: text.trim(),
      source: source?.trim() || null,
      author: author?.trim() || null,
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.chidush.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
