import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { getRabbiBotStats } from '@/lib/rabbiBot/adminStats';
import { purgeOld } from '@/lib/rabbiBot/store';

export const dynamic = 'force-dynamic';

/** Admin: רבי־בוט usage, ratings, quality and quota. */
export async function GET(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  await purgeOld();
  return NextResponse.json(await getRabbiBotStats());
}
