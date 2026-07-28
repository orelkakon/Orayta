import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { parseReelCode, canonicalReelUrl } from '@/lib/instagram';

export const dynamic = 'force-dynamic';

/** Public: active reels for the feed. Admin (?all=1): full list. */
export async function GET(req: NextRequest) {
  const wantAll = req.nextUrl.searchParams.get('all') === '1' && isAdmin(req);

  const reels = await prisma.instagramReel.findMany({
    where: wantAll ? undefined : { active: true, OR: [{ pageId: null }, { page: { active: true } }] },
    include: { page: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(reels.map(r => ({
    id: r.id,
    pageId: r.pageId,
    code: r.code,
    url: r.url,
    active: r.active,
    createdAt: r.createdAt,
    username: r.page?.username ?? null,
  })));
}

/** Admin: add reels. Body: { urls: string[], pageId?: string } */
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const body = await req.json() as { urls?: string[]; pageId?: string };
  const urls = Array.isArray(body.urls) ? body.urls.slice(0, 200) : [];
  const codes = Array.from(new Set(
    urls.map(parseReelCode).filter((c): c is string => c !== null)
  ));

  if (codes.length === 0) {
    return NextResponse.json({ error: 'no valid reel links' }, { status: 400 });
  }

  if (body.pageId) {
    const page = await prisma.instagramPage.findUnique({ where: { id: body.pageId } });
    if (!page) return NextResponse.json({ error: 'page not found' }, { status: 400 });
  }

  const result = await prisma.instagramReel.createMany({
    data: codes.map(code => ({ code, url: canonicalReelUrl(code), pageId: body.pageId ?? null })),
    skipDuplicates: true,
  });

  if (result.count === 0) {
    return NextResponse.json({ error: 'duplicate', added: 0, skipped: codes.length }, { status: 409 });
  }

  return NextResponse.json({ added: result.count, skipped: codes.length - result.count }, { status: 201 });
}
