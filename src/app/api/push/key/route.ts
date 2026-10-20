import { NextResponse } from 'next/server';
import { vapidPublicKey } from '@/lib/push/server';

export const dynamic = 'force-dynamic';

/** The VAPID application-server key the browser subscribes with (public by design). */
export async function GET() {
  const key = vapidPublicKey();
  if (!key) return NextResponse.json({ error: 'push not configured' }, { status: 503 });
  return NextResponse.json({ key }, { headers: { 'Cache-Control': 'public, max-age=3600' } });
}
