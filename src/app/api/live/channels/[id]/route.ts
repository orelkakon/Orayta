import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { invalidateLiveSnapshot } from '@/lib/youtubeLive';

export const dynamic = 'force-dynamic';

/** Admin: toggle a channel's active flag. */
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const channel = await prisma.liveChannel.findUnique({ where: { id: params.id } });
  if (!channel) return NextResponse.json({ error: 'not found' }, { status: 404 });
  const updated = await prisma.liveChannel.update({
    where: { id: params.id },
    data: { active: !channel.active },
  });
  await invalidateLiveSnapshot();
  return NextResponse.json(updated);
}

/** Admin: remove a channel. */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  await prisma.liveChannel.delete({ where: { id: params.id } }).catch(() => null);
  await invalidateLiveSnapshot();
  return NextResponse.json({ ok: true });
}
