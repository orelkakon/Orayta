import { ImageResponse, type NextRequest } from 'next/server';
import type { OgSpec } from '@/types/og';
import type { FeedItemType } from '@/types';
import { FEED_TYPES } from '@/lib/feedLink';
import { OgCard, OG_SIZE, cardTexts } from '@/lib/og/card';
import { loadOgFonts } from '@/lib/og/fonts';
import { isOgPageKey, pageSpec } from '@/lib/og/pages';
import { tehillimSpec } from '@/lib/og/tehillim';
import { askSpec, feedSpec, hilulaSpec, learnSpec, playSpec, rabbiSpec, siddurSpec, todaySpec } from '@/lib/og/dynamic';

export const dynamic = 'force-dynamic';

/**
 * Share-preview images (`og:image`) for every page — see `lib/og/meta.ts`
 * for the URLs pages declare. `p` picks the card; content cards take an id.
 * Cached at the CDN: a day for "today" cards, a week for everything else.
 */
const DAILY = new Set(['hilula', 'today', 'tehillim']);
const ID = /^[\w-]{1,40}$/;

async function specFor(q: URLSearchParams): Promise<OgSpec> {
  const p = q.get('p') ?? 'home';
  const id = q.get('id') ?? '';
  try {
    if (p === 'feed' && ID.test(id) && FEED_TYPES.includes(q.get('t') as FeedItemType)) {
      return (await feedSpec(q.get('t') as FeedItemType, id)) ?? pageSpec('feed');
    }
    if (p === 'rabbi' && ID.test(id)) return (await rabbiSpec(id)) ?? pageSpec('rabbis');
    if (p === 'hilula') return await hilulaSpec();
    if (p === 'tehillim' && q.get('s')) return (await tehillimSpec(q.get('s') ?? '')) ?? pageSpec('tehillim');
  } catch {
    // Database unreachable — the page card still makes a good preview.
  }
  if (p === 'ask') {
    const question = (q.get('q') ?? '').slice(0, 300).trim();
    return question.length >= 3 ? askSpec(question) : pageSpec('ask');
  }
  if (p === 'play') {
    const code = q.get('code') ?? '';
    return /^\d{4,8}$/.test(code) ? playSpec(code) : pageSpec('play');
  }
  if (p === 'today') return todaySpec();
  if (p === 'siddur') return siddurSpec(q.get('s') ?? '');
  if (p === 'learn') return learnSpec(q.get('k') ?? '');
  return pageSpec(isOgPageKey(p) ? p : 'home');
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const spec = await specFor(q);
  const t = cardTexts(spec);
  const fonts = await loadOgFonts([
    { family: 'frank', weight: 700, text: t.frank700 },
    { family: 'frank', weight: 500, text: t.frank500 },
    { family: 'heebo', weight: 500, text: t.heebo500 },
    { family: 'heebo', weight: 400, text: t.heebo400 },
  ]);
  const maxAge = DAILY.has(q.get('p') ?? '') ? 3600 : 604800;
  return new ImageResponse(<OgCard spec={spec} />, {
    ...OG_SIZE,
    fonts,
    headers: { 'Cache-Control': `public, max-age=${Math.min(maxAge, 86400)}, s-maxage=${maxAge}, stale-while-revalidate=86400` },
  });
}
