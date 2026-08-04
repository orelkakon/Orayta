import { NextRequest, NextResponse } from 'next/server';
import { getLiveSnapshot, debugProbe } from '@/lib/youtubeLive';

export const dynamic = 'force-dynamic';

/** Public: currently-active livestreams (cached sweep, ~60s freshness). */
export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get('debug') === '1') {
    return NextResponse.json(await debugProbe());
  }
  try {
    const snapshot = await getLiveSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    // A failed sweep must not break the page — degrade to "nothing live".
    return NextResponse.json({ checkedAt: Date.now(), streams: [] });
  }
}
