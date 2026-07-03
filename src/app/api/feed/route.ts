import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const PER_TYPE = 4;

function randOffset(total: number) {
  return total <= PER_TYPE ? 0 : Math.floor(Math.random() * (total - PER_TYPE));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export async function GET() {
  const [cC, rC, bC, gC, chC, sC] = await Promise.all([
    prisma.citation.count(),
    prisma.rabbi.count(),
    prisma.book.count(),
    prisma.gematria.count(),
    prisma.chidush.count(),
    prisma.sikumEntry.count(),
  ]);

  const [citations, rabbis, books, gematrias, chidushim, sikumEntries] = await Promise.all([
    prisma.citation.findMany({ skip: randOffset(cC), take: PER_TYPE, include: { locations: true } }),
    prisma.rabbi.findMany({ skip: randOffset(rC), take: PER_TYPE }),
    prisma.book.findMany({ skip: randOffset(bC), take: PER_TYPE }),
    prisma.gematria.findMany({ skip: randOffset(gC), take: PER_TYPE }),
    prisma.chidush.findMany({ skip: randOffset(chC), take: PER_TYPE }),
    prisma.sikumEntry.findMany({
      skip: randOffset(sC), take: PER_TYPE,
      include: { book: { select: { name: true, icon: true } } },
    }),
  ]);

  // Fetch gematria matches in one query
  const gValues = gematrias.map(g => g.value);
  const gematriaPeers = gValues.length > 0
    ? await prisma.gematria.findMany({ where: { value: { in: gValues } }, select: { word: true, value: true, id: true } })
    : [];
  const peersMap = new Map<number, string[]>();
  gematriaPeers.forEach(p => { const l = peersMap.get(p.value) ?? []; l.push(p.word); peersMap.set(p.value, l); });

  const refs = [
    ...citations.map(c => ({ itemType: 'citation', itemId: c.id })),
    ...rabbis.map(r => ({ itemType: 'rabbi', itemId: r.id })),
    ...books.map(b => ({ itemType: 'book', itemId: b.id })),
    ...gematrias.map(g => ({ itemType: 'gematria', itemId: g.id })),
    ...chidushim.map(c => ({ itemType: 'chidush', itemId: c.id })),
    ...sikumEntries.map(s => ({ itemType: 'sikum', itemId: s.id })),
  ];
  const likeRecords = refs.length > 0 ? await prisma.feedLike.findMany({ where: { OR: refs } }) : [];
  const likesMap = new Map(likeRecords.map(l => [`${l.itemType}:${l.itemId}`, l.likes]));
  const getLikes = (type: string, id: string) => likesMap.get(`${type}:${id}`) ?? 0;

  const items: unknown[] = shuffle([
    ...citations.map(c => ({ type: 'citation', id: c.id, likes: getLikes('citation', c.id), data: { ...c } })),
    ...rabbis.map(r => ({ type: 'rabbi', id: r.id, likes: getLikes('rabbi', r.id), data: { ...r } })),
    ...books.map(b => ({ type: 'book', id: b.id, likes: getLikes('book', b.id), data: { ...b } })),
    ...gematrias.map(g => ({
      type: 'gematria', id: g.id, likes: getLikes('gematria', g.id),
      data: { ...g, matches: (peersMap.get(g.value) ?? []).filter(w => w !== g.word).slice(0, 5) },
    })),
    ...chidushim.map(c => ({ type: 'chidush', id: c.id, likes: getLikes('chidush', c.id), data: { ...c } })),
    ...sikumEntries.map(s => ({
      type: 'sikum', id: s.id, likes: getLikes('sikum', s.id),
      data: { id: s.id, title: s.title, text: s.text, bookName: s.book.name, bookIcon: s.book.icon, location: s.location, date: s.date },
    })),
  ]);

  return NextResponse.json(items);
}
