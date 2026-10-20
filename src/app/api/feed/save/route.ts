import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';

const KEY = 'feedSaves';

// Read side lives in the admin-only /api/admin/stats aggregate.
export async function POST(req: NextRequest) {
  // The admin's own browsing never counts toward the stats.
  if (isAdmin(req)) return NextResponse.json({ ok: true });
  await prisma.globalCounter.upsert({
    where: { key: KEY },
    update: { value: { increment: 1 } },
    create: { key: KEY, value: 1 },
  });
  return NextResponse.json({ ok: true });
}
