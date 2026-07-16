import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json() as { passcode: string };
  const adminCode = process.env.PASSCODE ?? '1998';

  // The site is public; login grants admin only.
  if (passcode !== adminCode) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }
  const role = 'admin';

  const cookieOpts = {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  };

  // httpOnly — for API security checks
  cookies().set('auth', role, { ...cookieOpts, httpOnly: true });
  // NOT httpOnly — read instantly by JS for UI (no API call needed)
  cookies().set('role', role, { ...cookieOpts, httpOnly: false });

  return NextResponse.json({ ok: true });
}
