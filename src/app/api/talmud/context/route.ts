import { NextRequest, NextResponse } from 'next/server';
import { tractateFor, parseDaf, parseAmud } from '@/lib/talmud/tractates';
import { fetchAmud, sefariaPageUrl } from '@/lib/talmud/sefariaTalmud';
import type { TalmudPage } from '@/types/talmudContext';

/** Public: one amud of the Bavli (Aramaic + aligned Steinsaltz), sanitized, for "הצג בהקשר". */
export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams;
  const masechet = (q.get('masechet') ?? '').trim();
  const tractate = tractateFor(masechet);
  const daf = parseDaf(q.get('daf') ?? '');
  const amud = parseAmud(q.get('amud')) ?? 'a';
  if (!tractate || daf === null) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  const at = { daf, amud };
  const res = await fetchAmud(tractate, at);
  if (!res.ok) {
    const status = res.reason === 'not_found' ? 404 : 502;
    return NextResponse.json({ error: res.reason }, { status, headers: { 'Cache-Control': 'no-store' } });
  }

  const body: TalmudPage = {
    masechet,
    ref: `${tractate} ${daf}${amud}`,
    daf,
    amud,
    sefariaUrl: sefariaPageUrl(tractate, at),
    segments: res.segments,
    prev: res.prev,
    next: res.next,
  };
  // A missing Steinsaltz layer is usually a transient upstream miss — cache it briefly only.
  const complete = res.segments.every(s => s.ex);
  const cache = complete
    ? 'public, s-maxage=604800, stale-while-revalidate=2592000'
    : 'public, s-maxage=3600';
  return NextResponse.json(body, { headers: { 'Cache-Control': cache } });
}
