import type { FeedItem, FeedItemType, FeedReactions } from '@/types';
import { prisma } from '@/lib/db';
import { commentCounts } from '@/lib/feedCommentsServer';

/**
 * One feed item by type + id, shaped like the items of /api/feed — what a
 * shared post link (`/feed?i=`) opens on. Null when it no longer exists.
 * Rows go out as JSON (dates → strings), the shape the client types describe.
 */
async function loadData(type: FeedItemType, id: string): Promise<object | null> {
  switch (type) {
    case 'citation': return prisma.citation.findUnique({ where: { id }, include: { locations: true } });
    case 'rabbi': return prisma.rabbi.findUnique({ where: { id } });
    case 'book': return prisma.book.findUnique({ where: { id } });
    case 'chidush': return prisma.chidush.findUnique({ where: { id } });
    case 'gematria': {
      const g = await prisma.gematria.findUnique({ where: { id } });
      if (!g) return null;
      const peers = await prisma.gematria.findMany({ where: { value: g.value, id: { not: g.id } }, select: { word: true }, take: 5 });
      return { ...g, matches: peers.map(p => p.word) };
    }
    case 'sikum': {
      const s = await prisma.sikumEntry.findUnique({ where: { id }, include: { book: { select: { name: true, icon: true } } } });
      return s && { id: s.id, title: s.title, text: s.text, bookName: s.book.name, bookIcon: s.book.icon, location: s.location, date: s.date };
    }
  }
}

export async function loadFeedItem(type: FeedItemType, id: string): Promise<FeedItem | null> {
  const data = await loadData(type, id);
  if (!data) return null;
  const [likes, comments] = await Promise.all([
    prisma.feedLike.findMany({ where: { itemType: type, itemId: id } }),
    commentCounts([{ itemType: type, itemId: id }]),
  ]);
  const reactions: FeedReactions = { heart: 0, fire: 0, spark: 0 };
  likes.forEach(l => { if (l.reaction === 'heart' || l.reaction === 'fire' || l.reaction === 'spark') reactions[l.reaction] += l.likes; });
  return { type, id, reactions, comments: comments.get(`${type}:${id}`) ?? 0, data: data as FeedItem['data'] };
}
