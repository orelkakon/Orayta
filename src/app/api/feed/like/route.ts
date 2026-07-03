import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { type, id } = (await req.json()) as { type: string; id: string };
  if (!type || !id) return NextResponse.json({ error: 'missing params' }, { status: 400 });

  await prisma.feedLike.upsert({
    where: { itemType_itemId: { itemType: type, itemId: id } },
    create: { itemType: type, itemId: id, likes: 1 },
    update: { likes: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const result = await prisma.feedLike.aggregate({ _sum: { likes: true } });
  return NextResponse.json({ total: result._sum.likes ?? 0 });
}
