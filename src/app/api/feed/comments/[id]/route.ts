import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isAdmin } from '@/lib/auth';
import { verifyCommentToken } from '@/lib/feedCommentsServer';

/** Delete a comment: the admin, or its author holding the signed x-comment-token. */
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const allowed = isAdmin(req) || verifyCommentToken(params.id, req.headers.get('x-comment-token'));
  if (!allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { count } = await prisma.feedComment.deleteMany({ where: { id: params.id } });
  return NextResponse.json({ ok: true, deleted: count });
}
