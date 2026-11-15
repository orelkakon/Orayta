import { NextRequest, NextResponse } from 'next/server';
import { dayParam, israelDayKey } from '@/lib/daily/day';
import { dailySikum } from '@/lib/daily/server';

export const dynamic = 'force-dynamic';

/** The summary of the day (Israel date, or `?date=YYYY-MM-DD`). */
export async function GET(req: NextRequest) {
  const key = dayParam(req.nextUrl.searchParams) ?? israelDayKey();
  return NextResponse.json(await dailySikum(key));
}
