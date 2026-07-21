import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/* ── Brute-force protection: max 5 attempts per IP per 15 minutes ── */
const ipLog = new Map<string, number[]>();
const WINDOW_MS  = 15 * 60 * 1000;
const MAX_IN_WIN = 5;

function isRateLimited(ip: string): boolean {
  const now  = Date.now();
  const hits = (ipLog.get(ip) ?? []).filter(t => now - t < WINDOW_MS);
  if (hits.length >= MAX_IN_WIN) return true;
  ipLog.set(ip, [...hits, now]);
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'too many attempts' }, { status: 429 });
  }

  // In production PASSCODE must be set in env — the repo is public, so a
  // hardcoded fallback would be visible to everyone.
  const adminCode = process.env.PASSCODE
    ?? (process.env.NODE_ENV === 'production' ? null : '1998');
  const token = createAuthToken();
  if (!adminCode || !token) {
    return NextResponse.json({ error: 'auth not configured' }, { status: 503 });
  }

  const { passcode } = await request.json() as { passcode: string };
  if (passcode !== adminCode) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  const cookieOpts = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };

  // httpOnly — signed token verified by API route guards
  cookies().set('auth', token, { ...cookieOpts, httpOnly: true });
  // NOT httpOnly — read instantly by JS for UI (no API call needed)
  cookies().set('role', 'admin', { ...cookieOpts, httpOnly: false });

  return NextResponse.json({ ok: true });
}
