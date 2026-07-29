import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REACTIONS = ['heart', 'fire', 'spark'] as const;
type Reaction = (typeof REACTIONS)[number];

const ITEM_TYPES = ['citation', 'rabbi', 'book', 'gematria', 'chidush', 'sikum'];

export async function POST(req: NextRequest) {
  const { type, id, reaction = 'heart' } = (await req.json()) as { type: string; id: string; reaction?: string };
  if (!type || !id || !ITEM_TYPES.includes(type) || id.length > 40) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  }
  const r = REACTIONS.includes(reaction as Reaction) ? reaction : 'heart';

  await prisma.feedLike.upsert({
    where: { itemType_itemId_reaction: { itemType: type, itemId: id, reaction: r } },
    create: { itemType: type, itemId: id, reaction: r, likes: 1 },
    update: { likes: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}
