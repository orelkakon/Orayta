import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getNearbyStats } from '@/lib/nearbyStats/server';

export const dynamic = 'force-dynamic';

/** Admin: searches in מניין קרוב, מקווה בסביבה and קברי צדיקים — volume, areas, coverage, source health. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  return NextResponse.json(await getNearbyStats());
}
