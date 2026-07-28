import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Admin: list pages with reel counts */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const pages = await prisma.instagramPage.findMany({
    include: { _count: { select: { reels: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json(pages.map(p => ({
    id: p.id,
    username: p.username,
    url: p.url,
    active: p.active,
    createdAt: p.createdAt,
    reelCount: p._count.reels,
  })));
}
