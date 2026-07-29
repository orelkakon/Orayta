import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const KEY = 'questions';

// Read side lives in the admin-only /api/admin/stats aggregate.
export async function POST() {
  await prisma.globalCounter.upsert({
    where: { key: KEY },
    update: { value: { increment: 1 } },
    create: { key: KEY, value: 1 },
  });
  return NextResponse.json({ ok: true });
}
