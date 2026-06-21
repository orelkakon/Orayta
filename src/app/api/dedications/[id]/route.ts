import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.dedication.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
