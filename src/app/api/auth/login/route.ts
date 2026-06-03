import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json() as { passcode: string };
  const expected = process.env.PASSCODE ?? '1998';

  if (passcode !== expected) {
    return NextResponse.json({ error: 'invalid' }, { status: 401 });
  }

  cookies().set('auth', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
