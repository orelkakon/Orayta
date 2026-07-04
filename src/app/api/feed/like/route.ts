import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const REACTIONS = ['heart', 'fire', 'spark'] as const;
type Reaction = (typeof REACTIONS)[number];

export async function POST(req: NextRequest) {
  const { type, id, reaction = 'heart' } = (await req.json()) as { type: string; id: string; reaction?: string };
  if (!type || !id) return NextResponse.json({ error: 'missing params' }, { status: 400 });
  const r = REACTIONS.includes(reaction as Reaction) ? reaction : 'heart';

  await prisma.feedLike.upsert({
    where: { itemType_itemId_reaction: { itemType: type, itemId: id, reaction: r } },
    create: { itemType: type, itemId: id, reaction: r, likes: 1 },
    update: { likes: { increment: 1 } },
  });

  return NextResponse.json({ ok: true });
}

export async function GET() {
  const rows = await prisma.feedLike.groupBy({
    by: ['reaction'],
    _sum: { likes: true },
  });
  const map: Record<string, number> = {};
  rows.forEach(r => { map[r.reaction] = r._sum.likes ?? 0; });
  const heart = map['heart'] ?? 0;
  const fire  = map['fire']  ?? 0;
  const spark = map['spark'] ?? 0;
  return NextResponse.json({ total: heart + fire + spark, heart, fire, spark });
}
