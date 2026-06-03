import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  if (request.cookies.get('auth')?.value !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  await prisma.quizResult.deleteMany({});
  return NextResponse.json({ ok: true });
}
