import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { isCommentTarget, validateComment, COMMENTS_PAGE_SIZE } from '@/lib/feedComments';
import {
  commentIpHash, isCommentRateLimited, isDuplicateComment,
  commentTargetExists, signCommentToken,
} from '@/lib/feedCommentsServer';
import type { FeedCommentsPage, FeedCommentCreated } from '@/types';

export const dynamic = 'force-dynamic';

const PUBLIC_FIELDS = { id: true, name: true, text: true, createdAt: true } as const;

/** Public: newest-first page of comments for one post. ?type=&id=&cursor= */
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const type = sp.get('type');
  const id = sp.get('id') ?? '';
  const cursor = sp.get('cursor');
  if (!isCommentTarget(type) || !id || id.length > 40) {
    return NextResponse.json({ error: 'missing params' }, { status: 400 });
  }

  const where = { itemType: type, itemId: id };
  const [rows, total] = await Promise.all([
    prisma.feedComment.findMany({
      where,
      select: PUBLIC_FIELDS,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: COMMENTS_PAGE_SIZE + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    }),
    prisma.feedComment.count({ where }),
  ]);

  const hasMore = rows.length > COMMENTS_PAGE_SIZE;
  const page = hasMore ? rows.slice(0, COMMENTS_PAGE_SIZE) : rows;
  const body: FeedCommentsPage = {
    comments: page.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })),
    total,
    nextCursor: hasMore ? page[page.length - 1].id : null,
  };
  return NextResponse.json(body);
}

/** Public write: anonymous comment with optional name. Validated + rate-limited. */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as
    { type?: unknown; id?: unknown; name?: unknown; text?: unknown; website?: unknown } | null;
  if (!body) return NextResponse.json({ error: 'bad_request' }, { status: 400 });

  // Honeypot: a hidden field real visitors never fill.
  if (typeof body.website === 'string' && body.website.trim()) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const { type, id } = body;
  if (!isCommentTarget(type) || typeof id !== 'string' || !id || id.length > 40) {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 });
  }

  const v = validateComment(body.name, body.text);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const ipHash = commentIpHash(req);
  if (await isCommentRateLimited(ipHash)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
  }
  if (!(await commentTargetExists(type, id))) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 });
  }
  if (await isDuplicateComment(ipHash, type, id, v.text)) {
    return NextResponse.json({ error: 'duplicate' }, { status: 409 });
  }

  const c = await prisma.feedComment.create({
    data: { itemType: type, itemId: id, name: v.name, text: v.text, ipHash },
    select: PUBLIC_FIELDS,
  });

  const res: FeedCommentCreated = {
    comment: { ...c, createdAt: c.createdAt.toISOString() },
    token: signCommentToken(c.id) ?? '',
  };
  return NextResponse.json(res, { status: 201 });
}
