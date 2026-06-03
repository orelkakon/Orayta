import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const { passcode } = await request.json() as { passcode: string };
  const adminCode = process.env.PASSCODE ?? '1998';
  const readerCode = process.env.READER_PASSCODE ?? '1111';

  let role: 'admin' | 'reader' | null = null;
  if (passcode === adminCode) role = 'admin';
  else if (passcode === readerCode) role = 'reader';

  if (!role) return NextResponse.json({ error: 'invalid' }, { status: 401 });

  cookies().set('auth', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  });

  return NextResponse.json({ ok: true });
}
