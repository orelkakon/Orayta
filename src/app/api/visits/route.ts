import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { prisma } from '@/lib/db';

// Read side lives in the admin-only /api/admin/stats aggregate.
export async function POST(req: NextRequest) {
  const raw = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('x-real-ip')
    ?? '0.0.0.0';

  const ipHash = createHash('sha256').update(raw + 'orayta_visits_2024').digest('hex');

  const exists = await prisma.pageVisit.findUnique({ where: { ipHash } });
  if (!exists) {
    await prisma.pageVisit.create({ data: { ipHash } });
  }

  return NextResponse.json({ ok: true });
}
