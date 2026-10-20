import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { signValue, verifySignedValue } from '@/lib/auth';
import type { FeedCommentTarget } from '@/types';

// Rate limits live in the DB (not in-process) so they hold across serverless
// instances: a burst cap plus a daily cap per hashed IP.
const BURST_WINDOW_MS = 10 * 60 * 1000;
const BURST_MAX = 5;
const DAY_MAX = 40;

export function commentIpHash(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  return createHash('sha256').update(`${ip}|orayta_comments_v1`).digest('hex');
}

export async function isCommentRateLimited(ipHash: string): Promise<boolean> {
  const now = Date.now();
  const [burst, day] = await Promise.all([
    prisma.feedComment.count({ where: { ipHash, createdAt: { gte: new Date(now - BURST_WINDOW_MS) } } }),
    prisma.feedComment.count({ where: { ipHash, createdAt: { gte: new Date(now - 86400_000) } } }),
  ]);
  return burst >= BURST_MAX || day >= DAY_MAX;
}

export async function isDuplicateComment(ipHash: string, type: string, id: string, text: string): Promise<boolean> {
  const hit = await prisma.feedComment.findFirst({ where: { ipHash, itemType: type, itemId: id, text }, select: { id: true } });
  return hit !== null;
}

/** Only real, visible posts can be commented on — no orphan threads. */
export async function commentTargetExists(type: FeedCommentTarget, id: string): Promise<boolean> {
  const where = { where: { id }, select: { id: true } };
  switch (type) {
    case 'citation': return (await prisma.citation.findUnique(where)) !== null;
    case 'rabbi':    return (await prisma.rabbi.findUnique(where)) !== null;
    case 'book':     return (await prisma.book.findUnique(where)) !== null;
    case 'chidush':  return (await prisma.chidush.findUnique(where)) !== null;
    case 'gematria': return (await prisma.gematria.findUnique(where)) !== null;
    case 'sikum':    return (await prisma.sikumEntry.findUnique(where)) !== null;
    case 'reel':     return (await prisma.instagramReel.findFirst({ where: { id, active: true }, select: { id: true } })) !== null;
  }
}

/** Comment counts for many posts in one query, keyed "type:id". */
export async function commentCounts(refs: { itemType: string; itemId: string }[]): Promise<Map<string, number>> {
  const map = new Map<string, number>();
  if (refs.length === 0) return map;
  const idsByType = new Map<string, string[]>();
  refs.forEach(r => idsByType.set(r.itemType, [...(idsByType.get(r.itemType) ?? []), r.itemId]));
  const rows = await prisma.feedComment.groupBy({
    by: ['itemType', 'itemId'],
    where: { OR: Array.from(idsByType, ([itemType, ids]) => ({ itemType, itemId: { in: ids } })) },
    _count: { _all: true },
  });
  rows.forEach(r => map.set(`${r.itemType}:${r.itemId}`, r._count._all));
  return map;
}

const tokenValue = (commentId: string) => `feed-comment:${commentId}`;

export function signCommentToken(commentId: string): string | null {
  return signValue(tokenValue(commentId));
}

export function verifyCommentToken(commentId: string, token: string | null): boolean {
  return verifySignedValue(tokenValue(commentId), token);
}
