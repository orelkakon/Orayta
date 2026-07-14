import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import type { FeedReactions, FeedItemType } from '@/types';

export const dynamic = 'force-dynamic';

const BASE_N: Record<FeedItemType, number> = { citation: 5, chidush: 5, sikum: 4, rabbi: 4, book: 1, gematria: 1 };
const PAGE_SIZE = 20;
const ALL_TYPES = Object.keys(BASE_N) as FeedItemType[];

function parseTypes(param: string | null): FeedItemType[] {
  const requested = (param ?? '')
    .split(',')
    .filter((t): t is FeedItemType => ALL_TYPES.includes(t as FeedItemType));
  return requested.length > 0 ? requested : ALL_TYPES;
}

// Scale per-type counts so a filtered feed still fills a full page
function computeTakes(enabled: FeedItemType[]): Record<FeedItemType, number> {
  const baseSum = enabled.reduce((sum, t) => sum + BASE_N[t], 0);
  const takes: Record<FeedItemType, number> = { citation: 0, chidush: 0, sikum: 0, rabbi: 0, book: 0, gematria: 0 };
  enabled.forEach(t => { takes[t] = Math.max(1, Math.round(BASE_N[t] * PAGE_SIZE / baseSum)); });
  return takes;
}

function randOffset(total: number, take: number) {
  return total <= take ? 0 : Math.floor(Math.random() * (total - take));
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const GEMATRIA_HE = ['','א','ב','ג','ד','ה','ו','ז','ח','ט','י','י״א','י״ב','י״ג','י״ד','ט״ו','ט״ז','י״ז','י״ח','י״ט','כ','כ״א','כ״ב','כ״ג','כ״ד','כ״ה','כ״ו','כ״ז','כ״ח','כ״ט','ל'];
const MONTHS_HE: Record<string, string> = { 'Nisan':'ניסן','Iyyar':'אייר','Sivan':'סיון','Tamuz':'תמוז','Av':'אב','Elul':'אלול','Tishrei':'תשרי','Cheshvan':'חשוון','Kislev':'כסלו','Tevet':'טבת','Shvat':'שבט','Adar':'אדר','Adar I':'אדר א׳','Adar II':'אדר ב׳' };
function normalizeHeb(s: string) { return s.replace(/[״׳"']/g, '').replace(/\s+/g, ' ').trim(); }

async function getYahrzeitRabbiIds(): Promise<Set<string>> {
  try {
    const dateStr = new Date().toISOString().split('T')[0];
    const hd = await fetch(`https://www.hebcal.com/converter?cfg=json&date=${dateStr}&g2h=1&strict=1`, { next: { revalidate: 3600 } })
      .then(r => r.json()) as { hd: number; hm: string };
    const todayKey = normalizeHeb(`${GEMATRIA_HE[hd.hd] ?? ''} ${MONTHS_HE[hd.hm] ?? hd.hm}`);
    const all = await prisma.rabbi.findMany({ where: { deathDate: { not: null } }, select: { id: true, deathDate: true } });
    const ids = new Set<string>();
    all.forEach(r => { if (r.deathDate && normalizeHeb(r.deathDate) === todayKey) ids.add(r.id); });
    return ids;
  } catch { return new Set(); }
}

export async function GET(req: NextRequest) {
  const N = computeTakes(parseTypes(req.nextUrl.searchParams.get('types')));

  const [cC, rC, bC, gC, chC, sC] = await Promise.all([
    N.citation ? prisma.citation.count() : 0,
    N.rabbi ? prisma.rabbi.count() : 0,
    N.book ? prisma.book.count() : 0,
    N.gematria ? prisma.gematria.count() : 0,
    N.chidush ? prisma.chidush.count() : 0,
    N.sikum ? prisma.sikumEntry.count() : 0,
  ]);

  const [citations, rabbis, books, gematrias, chidushim, sikumEntries, yahrzeitIds] = await Promise.all([
    N.citation ? prisma.citation.findMany({ skip: randOffset(cC, N.citation), take: N.citation, include: { locations: true } }) : [],
    N.rabbi ? prisma.rabbi.findMany({ skip: randOffset(rC, N.rabbi), take: N.rabbi }) : [],
    N.book ? prisma.book.findMany({ skip: randOffset(bC, N.book), take: N.book }) : [],
    N.gematria ? prisma.gematria.findMany({ skip: randOffset(gC, N.gematria), take: N.gematria }) : [],
    N.chidush ? prisma.chidush.findMany({ skip: randOffset(chC, N.chidush), take: N.chidush }) : [],
    N.sikum ? prisma.sikumEntry.findMany({ skip: randOffset(sC, N.sikum), take: N.sikum, include: { book: { select: { name: true, icon: true } } } }) : [],
    N.rabbi ? getYahrzeitRabbiIds() : new Set<string>(),
  ]);

  // Yahrzeit rabbis fetched separately (may not be in the random slice)
  const yahrzeitIdArr = Array.from(yahrzeitIds);
  const extraYahrzeitRabbis = yahrzeitIdArr.length > 0
    ? await prisma.rabbi.findMany({ where: { id: { in: yahrzeitIdArr } } })
    : [];

  const gValues = gematrias.map(g => g.value);
  const gematriaPeers = gValues.length > 0
    ? await prisma.gematria.findMany({ where: { value: { in: gValues } }, select: { word: true, value: true, id: true } })
    : [];
  const peersMap = new Map<number, string[]>();
  gematriaPeers.forEach(p => { const l = peersMap.get(p.value) ?? []; l.push(p.word); peersMap.set(p.value, l); });

  const refs = [
    ...citations.map(c => ({ itemType: 'citation', itemId: c.id })),
    ...rabbis.map(r => ({ itemType: 'rabbi', itemId: r.id })),
    ...extraYahrzeitRabbis.map(r => ({ itemType: 'rabbi', itemId: r.id })),
    ...books.map(b => ({ itemType: 'book', itemId: b.id })),
    ...gematrias.map(g => ({ itemType: 'gematria', itemId: g.id })),
    ...chidushim.map(c => ({ itemType: 'chidush', itemId: c.id })),
    ...sikumEntries.map(s => ({ itemType: 'sikum', itemId: s.id })),
  ];

  const likeRecords = refs.length > 0 ? await prisma.feedLike.findMany({ where: { OR: refs } }) : [];
  const reactMap = new Map<string, FeedReactions>();
  likeRecords.forEach(l => {
    const key = `${l.itemType}:${l.itemId}`;
    const curr = reactMap.get(key) ?? { heart: 0, fire: 0, spark: 0 };
    if (l.reaction === 'heart') curr.heart += l.likes;
    else if (l.reaction === 'fire') curr.fire += l.likes;
    else if (l.reaction === 'spark') curr.spark += l.likes;
    reactMap.set(key, curr);
  });
  const getReactions = (type: string, id: string): FeedReactions =>
    reactMap.get(`${type}:${id}`) ?? { heart: 0, fire: 0, spark: 0 };

  const allRabbisInSlice = new Set(rabbis.map(r => r.id));
  const yahrzeitItems = extraYahrzeitRabbis.map(r => ({
    type: 'rabbi' as const, id: r.id, isYahrzeit: true,
    reactions: getReactions('rabbi', r.id), data: { ...r },
  }));

  const regularItems = shuffle([
    ...citations.map(c => ({ type: 'citation' as const, id: c.id, reactions: getReactions('citation', c.id), data: { ...c } })),
    ...rabbis.filter(r => !yahrzeitIds.has(r.id)).map(r => ({ type: 'rabbi' as const, id: r.id, reactions: getReactions('rabbi', r.id), data: { ...r } })),
    ...rabbis.filter(r => yahrzeitIds.has(r.id) && !allRabbisInSlice.has(r.id)).map(r => ({ type: 'rabbi' as const, id: r.id, isYahrzeit: true, reactions: getReactions('rabbi', r.id), data: { ...r } })),
    ...books.map(b => ({ type: 'book' as const, id: b.id, reactions: getReactions('book', b.id), data: { ...b } })),
    ...gematrias.map(g => ({ type: 'gematria' as const, id: g.id, reactions: getReactions('gematria', g.id), data: { ...g, matches: (peersMap.get(g.value) ?? []).filter(w => w !== g.word).slice(0, 5) } })),
    ...chidushim.map(c => ({ type: 'chidush' as const, id: c.id, reactions: getReactions('chidush', c.id), data: { ...c } })),
    ...sikumEntries.map(s => ({ type: 'sikum' as const, id: s.id, reactions: getReactions('sikum', s.id), data: { id: s.id, title: s.title, text: s.text, bookName: s.book.name, bookIcon: s.book.icon, location: s.location, date: s.date } })),
  ]);

  return NextResponse.json([...yahrzeitItems, ...regularItems]);
}
