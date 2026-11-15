import { NextRequest, NextResponse } from 'next/server';
import { fetchParashaText, fetchParashaWeek, partRef } from '@/lib/parasha/server';
import { parsePart } from '@/lib/parasha/refs';
import { israelDateKey, isDateKey } from '@/lib/dailyLearning/kinds';

/**
 * Public: one part of the week's reading — ?part=<aliya index>|h|all.
 * Only refs from that week's calendar are fetched, so this never proxies arbitrary Sefaria refs.
 */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const param = sp.get('date');
  const date = isDateKey(param) ? param : israelDateKey(new Date());
  const week = await fetchParashaWeek(date);
  if (!week) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  const part = parsePart(sp.get('part'), week.aliyot.length);
  const target = part === null ? null : partRef(week, part);
  if (!target) return NextResponse.json({ error: 'bad_part' }, { status: 400 });
  const text = await fetchParashaText(target.ref, target.heRef);
  if (!text) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  // A dated URL names one week's text for good; an undated one moves with the week.
  const cache = isDateKey(param) ? 'public, s-maxage=86400, stale-while-revalidate=604800' : 'public, s-maxage=600';
  return NextResponse.json(text, { headers: { 'Cache-Control': cache } });
}
