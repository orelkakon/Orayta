import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** Approve a pending dedication */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const dedication = await prisma.dedication.update({
    where: { id: params.id },
    data: { status: 'approved' },
  });
  return NextResponse.json(dedication);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.dedication.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
