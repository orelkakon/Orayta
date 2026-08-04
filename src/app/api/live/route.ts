import { NextResponse } from 'next/server';
import { getLiveSnapshot } from '@/lib/youtubeLive';

export const dynamic = 'force-dynamic';

/** Public: currently-active livestreams (cached sweep, ~60s freshness). */
export async function GET() {
  try {
    const snapshot = await getLiveSnapshot();
    return NextResponse.json(snapshot);
  } catch {
    // A failed sweep must not break the page — degrade to "nothing live".
    return NextResponse.json({ checkedAt: Date.now(), streams: [] });
  }
}
