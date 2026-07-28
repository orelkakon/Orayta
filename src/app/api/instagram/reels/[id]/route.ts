import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** Toggle a reel's active state */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const reel = await prisma.instagramReel.findUnique({ where: { id: params.id } });
  if (!reel) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const updated = await prisma.instagramReel.update({
    where: { id: params.id },
    data: { active: !reel.active },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.instagramReel.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
