import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { cachedHomeConfig, setHomePersonalize } from '@/lib/homeConfig';

export const dynamic = 'force-dynamic';

/** Public: the admin's home settings (served from the data cache, CDN-cached a minute). */
export async function GET() {
  const cfg = await cachedHomeConfig();
  return NextResponse.json(cfg, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } });
}

/** Admin: { personalize: boolean }. */
export async function PUT(req: NextRequest) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  const body = await req.json().catch(() => null) as { personalize?: unknown } | null;
  if (typeof body?.personalize !== 'boolean') return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  await setHomePersonalize(body.personalize);
  return NextResponse.json({ personalize: body.personalize }, { headers: { 'Cache-Control': 'no-store' } });
}
