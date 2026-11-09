import { NextRequest, NextResponse } from 'next/server';
import { parseFeedLink } from '@/lib/feedLink';
import { loadFeedItem } from '@/lib/feedItemServer';

export const dynamic = 'force-dynamic';

/** GET /api/feed/item?i=<type>.<id> — the item a shared post link opens on. */
export async function GET(req: NextRequest) {
  const link = parseFeedLink(req.nextUrl.searchParams.get('i'));
  if (!link) return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  const item = await loadFeedItem(link.type, link.id);
  if (!item) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  return NextResponse.json(item, { headers: { 'Cache-Control': 'no-store' } });
}
