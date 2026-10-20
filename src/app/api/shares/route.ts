import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

const KEYS = { wa: 'whatsappShares', story: 'storyShares', tg: 'telegramShares' } as const;
type ShareKind = keyof typeof KEYS;

// Read side lives in the admin-only /api/admin/stats aggregate.
export async function POST(req: NextRequest) {
  // The admin's own browsing never counts toward the stats.
  if (isAdmin(req)) return NextResponse.json({ ok: true });
  const body = (await req.json().catch(() => null)) as { kind?: string } | null;
  const kind: ShareKind = body?.kind === 'story' || body?.kind === 'tg' ? body.kind : 'wa';
  await prisma.globalCounter.upsert({
    where: { key: KEYS[kind] },
    update: { value: { increment: 1 } },
    create: { key: KEYS[kind], value: 1 },
  });
  return NextResponse.json({ ok: true });
}
