import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const KEYS = { wa: 'whatsappShares', story: 'storyShares' } as const;
type ShareKind = keyof typeof KEYS;

export async function GET() {
  const rows = await prisma.globalCounter.findMany({
    where: { key: { in: [KEYS.wa, KEYS.story] } },
  });
  const wa = rows.find(r => r.key === KEYS.wa)?.value ?? 0;
  const story = rows.find(r => r.key === KEYS.story)?.value ?? 0;
  return NextResponse.json({ wa, story, count: wa + story });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { kind?: string } | null;
  const kind: ShareKind = body?.kind === 'story' ? 'story' : 'wa';
  const row = await prisma.globalCounter.upsert({
    where: { key: KEYS[kind] },
    update: { value: { increment: 1 } },
    create: { key: KEYS[kind], value: 1 },
  });
  return NextResponse.json({ count: row.value });
}
