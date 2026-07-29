import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const KEYS = { wa: 'whatsappShares', story: 'storyShares' } as const;
type ShareKind = keyof typeof KEYS;

// Read side lives in the admin-only /api/admin/stats aggregate.
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as { kind?: string } | null;
  const kind: ShareKind = body?.kind === 'story' ? 'story' : 'wa';
  await prisma.globalCounter.upsert({
    where: { key: KEYS[kind] },
    update: { value: { increment: 1 } },
    create: { key: KEYS[kind], value: 1 },
  });
  return NextResponse.json({ ok: true });
}
