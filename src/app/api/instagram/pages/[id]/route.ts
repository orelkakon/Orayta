import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';
import { prisma } from '@/lib/db';

/** Toggle a page's active state (hides all its reels from the feed) */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const page = await prisma.instagramPage.findUnique({ where: { id: params.id } });
  if (!page) return NextResponse.json({ error: 'not found' }, { status: 404 });

  const updated = await prisma.instagramPage.update({
    where: { id: params.id },
    data: { active: !page.active },
  });
  return NextResponse.json(updated);
}

/** Delete a page and all its reels (cascade) */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!isAdmin(req)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.instagramPage.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
