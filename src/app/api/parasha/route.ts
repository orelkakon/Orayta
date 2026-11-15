import { NextRequest, NextResponse } from 'next/server';
import { fetchParashaWeek } from '@/lib/parasha/server';
import { israelDateKey, isDateKey } from '@/lib/dailyLearning/kinds';

/** Public: this week's parasha (Israel date, or ?date=YYYY-MM-DD). */
export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('date');
  const date = isDateKey(param) ? param : israelDateKey(new Date());
  const week = await fetchParashaWeek(date);
  if (!week) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  const cache = isDateKey(param) ? 'public, s-maxage=21600, stale-while-revalidate=86400' : 'public, s-maxage=600';
  return NextResponse.json(week, { headers: { 'Cache-Control': cache } });
}
