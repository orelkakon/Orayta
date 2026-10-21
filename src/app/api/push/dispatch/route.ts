import { NextRequest, NextResponse } from 'next/server';
import { timingSafeEqual } from 'crypto';
import { pushConfigured } from '@/lib/push/server';
import { runDispatch } from '@/lib/push/dispatch';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get('authorization') ?? '';
  if (!secret) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(`Bearer ${secret}`);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Authenticated trigger (GitHub Actions) — full counts in the response. */
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: 'push not configured' }, { status: 503 });
  return NextResponse.json(await runDispatch());
}
