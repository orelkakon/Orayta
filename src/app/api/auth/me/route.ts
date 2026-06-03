import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export type Role = 'admin' | 'reader';

export async function GET() {
  const auth = cookies().get('auth')?.value;
  const role: Role = auth === 'reader' ? 'reader' : 'admin';
  return NextResponse.json({ role });
}
