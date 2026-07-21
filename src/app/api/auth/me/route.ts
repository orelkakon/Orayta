import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isValidAuthToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export type Role = 'admin' | 'reader';

export async function GET() {
  const auth = cookies().get('auth')?.value;
  const role: Role = isValidAuthToken(auth) ? 'admin' : 'reader';
  return NextResponse.json({ role });
}
