import { NextRequest, NextResponse } from 'next/server';
import { addDayKey, dayKeyNoon, dayParam, israelDayKey } from '@/lib/daily/day';
import { allCityTimes } from '@/lib/shabbat';
import { clipData } from '@/lib/shabbatClip/data';
import { fetchLearnToday } from '@/lib/dailyLearning/sefaria';
import { parashaLabel } from '@/components/HomeView/todayInfo';
import { renderShabbatPng } from '@/lib/storyRender/render';
import { israelMidnight, shabbatEnds, shabbatFridayKey, storyCacheControl } from '@/lib/storyRender/schedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The upcoming Shabbat as an Instagram story (1080×1920 PNG): the last frame
 * of the Friday share clip — parasha, Hebrew + civil date, candle lighting
 * and havdalah in the six cities. Public, no DB, no tracking. `?date=` /
 * `?d=` (YYYY-MM-DD) picks the Shabbat of another day.
 */
export async function GET(req: NextRequest) {
  const now = new Date();
  const today = israelDayKey(now);
  const asked = dayParam(req.nextUrl.searchParams);
  const key = asked ?? today;
  // The day itself (or today, by the clock): on Saturday night, next week's.
  const friday = shabbatFridayKey(key, key === today ? now : undefined);
  try {
    // The parasha the home hero shows on that Friday (Sefaria's calendar).
    const learn = await fetchLearnToday(friday);
    const data = clipData(allCityTimes(dayKeyNoon(friday)), parashaLabel(learn?.parasha));
    const png = await renderShabbatPng(data);
    // The bare URL changes at Israel midnight, and when Shabbat goes out.
    const midnight = israelMidnight(addDayKey(today, 1));
    const ends = shabbatEnds(friday);
    const until = ends > now && ends < midnight ? ends : midnight;
    return new NextResponse(png, {
      headers: { 'Content-Type': 'image/png', 'Cache-Control': storyCacheControl(now, asked ? null : until) },
    });
  } catch (e) {
    console.error('[story/shabbat]', e);
    return NextResponse.json({ error: 'render failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
