import { NextResponse } from 'next/server';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { bookletVerse } from '@/lib/tehillim/text';

/**
 * GET /api/tehillim/text/<1-150> — one chapter's verses (Hebrew with nikud)
 * from Sefaria, through Next's data cache so readers don't each hit Sefaria
 * and a slow day there doesn't stall a reading. The text is cleaned to
 * booklet form (lib/tehillim/text.ts).
 */
interface SefariaText { he?: string[] }

export async function GET(_req: Request, { params }: { params: { chapter: string } }) {
  const n = Number(params.chapter);
  if (!Number.isInteger(n) || n < 1 || n > 150) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  try {
    const res = await fetch(`https://www.sefaria.org/api/texts/Psalms.${n}?lang=he&context=0`, {
      next: { revalidate: 30 * 86400 }, signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const body = await res.json() as SefariaText;
    const verses = (body.he ?? []).map(v => bookletVerse(sanitizeSiddurHtml(v)));
    if (!verses.length) throw new Error('empty');
    return NextResponse.json({ verses }, { headers: { 'Cache-Control': 'public, max-age=86400, s-maxage=2592000' } });
  } catch {
    return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  }
}
