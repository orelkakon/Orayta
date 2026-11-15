import { NextRequest, NextResponse } from 'next/server';
import { addDayKey, dayParam, israelDayKey } from '@/lib/daily/day';
import { dailyItems } from '@/lib/daily/server';
import { dailyStoryContent } from '@/lib/daily/story';
import { renderDailyPng } from '@/lib/storyRender/render';
import { israelMidnight, storyCacheControl } from '@/lib/storyRender/schedule';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * The day's "אורייתא יומי" Instagram story (1080×1920 PNG), the same card the
 * "שתף בסטורי" button on /today makes, with the same items a visitor sees
 * that Israel day. Public, read-only, no tracking. `?date=` / `?d=`
 * (YYYY-MM-DD) picks another day; any other parameter is ignored.
 */
export async function GET(req: NextRequest) {
  const now = new Date();
  const asked = dayParam(req.nextUrl.searchParams);
  const key = asked ?? israelDayKey(now);
  try {
    const items = await dailyItems(key);
    if (!items.rabbi && !items.citation && !items.sikum && !items.chidush) {
      return NextResponse.json({ error: 'no content' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
    }
    const png = await renderDailyPng(dailyStoryContent(items));
    return new NextResponse(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': storyCacheControl(now, asked ? null : israelMidnight(addDayKey(key, 1))),
      },
    });
  } catch (e) {
    console.error('[story/daily]', e);
    return NextResponse.json({ error: 'render failed' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
  }
}
