import { NextRequest, NextResponse } from 'next/server';
import { fetchLearnToday, fetchLearnText } from '@/lib/dailyLearning/sefaria';
import { israelDateKey, isDateKey, isLearnKind } from '@/lib/dailyLearning/kinds';

/** Public: the text of today's portion of one cycle (?date=, ?explain=1 for Steinsaltz). */
export async function GET(req: NextRequest, { params }: { params: { kind: string } }) {
  if (!isLearnKind(params.kind)) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  const sp = req.nextUrl.searchParams;
  const param = sp.get('date');
  const date = isDateKey(param) ? param : israelDateKey(new Date());

  const today = await fetchLearnToday(date);
  const item = today?.items.find(i => i.kind === params.kind);
  if (!today) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  if (!item) return NextResponse.json({ error: 'not_today' }, { status: 404, headers: { 'Cache-Control': 'public, s-maxage=3600' } });

  const text = await fetchLearnText(item, sp.get('explain') === '1');
  if (!text) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  const cache = isDateKey(param) ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=600';
  return NextResponse.json(text, { headers: { 'Cache-Control': cache } });
}
