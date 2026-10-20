import { NextRequest, NextResponse } from 'next/server';
import { fetchLearnToday } from '@/lib/dailyLearning/sefaria';
import { israelDateKey, isDateKey } from '@/lib/dailyLearning/kinds';

/** Public: today's learning portions (Israel date, or ?date=YYYY-MM-DD). */
export async function GET(req: NextRequest) {
  const param = req.nextUrl.searchParams.get('date');
  const date = isDateKey(param) ? param : israelDateKey(new Date());
  const today = await fetchLearnToday(date);
  if (!today) return NextResponse.json({ error: 'unavailable' }, { status: 502, headers: { 'Cache-Control': 'no-store' } });
  // A dated URL is stable; an undated one changes at midnight.
  const cache = isDateKey(param) ? 'public, s-maxage=21600, stale-while-revalidate=86400' : 'public, s-maxage=600';
  return NextResponse.json(today, { headers: { 'Cache-Control': cache } });
}
