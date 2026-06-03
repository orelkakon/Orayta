import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function POST() {
  cookies().delete('auth');
  cookies().delete('role');
  return NextResponse.json({ ok: true });
}
