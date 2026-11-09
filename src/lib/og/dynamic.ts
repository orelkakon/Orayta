import type { OgSpec } from '@/types/og';
import type { FeedItemType, RabbiCategory } from '@/types';
import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { CATEGORY_LABELS } from '@/lib/rabbisData';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { hilulaRabbisOn, israelIso, joinNames } from '@/lib/push/hilula';
import { getService, isServiceId } from '@/lib/siddur';
import { isLearnKind, learnKind } from '@/lib/dailyLearning/kinds';
import { pageSpec } from './pages';
import { cleanText } from './text';

/**
 * Share-preview cards that show real content: a feed item, a rabbi, a
 * question to רבי־בוט, a game invite, today's hilulot. Every loader returns
 * null when the thing doesn't exist — the route then falls back to the page card.
 */
const IMG_TIMEOUT_MS = 3500;
const IMG_MAX_BYTES = 1_500_000;

/** A remote portrait as a data: URL (Satori must not fetch on its own: a dead link would fail the render). */
async function portrait(url: string | null): Promise<string | undefined> {
  if (!url || !/^https:\/\//.test(url)) return undefined;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(IMG_TIMEOUT_MS), headers: { 'User-Agent': 'OraytaOG/1.0 (share previews)' } });
    const type = res.headers.get('content-type') ?? '';
    if (!res.ok || !/^image\/(jpeg|png)/.test(type)) return undefined;
    const buf = await res.arrayBuffer();
    if (buf.byteLength > IMG_MAX_BYTES) return undefined;
    return `data:${type.split(';')[0]};base64,${Buffer.from(buf).toString('base64')}`;
  } catch {
    return undefined;
  }
}

const firstSentence = (s: string) => cleanText(s).split(/(?<=[.!?])\s/)[0] ?? '';

export async function rabbiSpec(id: string, withImage = true): Promise<OgSpec | null> {
  const r = await prisma.rabbi.findUnique({ where: { id } });
  if (!r) return null;
  const category = CATEGORY_LABELS[r.category as RabbiCategory] ?? '';
  return {
    tone: 'night', eyebrow: category ? `${HE.OG_RABBI_EYEBROW} · ${category}` : HE.OG_RABBI_EYEBROW,
    title: r.name, subtitle: [r.datePeriod, firstSentence(r.bio)].filter(Boolean).join(' · '),
    icon: 'users', image: withImage ? await portrait(r.imageUrl) : undefined,
  };
}

export async function feedSpec(type: FeedItemType, id: string, withImage = true): Promise<OgSpec | null> {
  const base = { tone: 'parchment' as const, eyebrow: HE.OG_FEED_EYEBROW };
  switch (type) {
    case 'citation': {
      const c = await prisma.citation.findUnique({ where: { id }, include: { locations: true } });
      const l = c?.locations[0];
      return c ? { ...base, title: l ? HE.HOME_FEED_DAF(l.masechet, l.daf, l.amud ?? null) : HE.OG_PAGES.study.title, quote: `"${cleanText(c.content)}"` } : null;
    }
    case 'chidush': {
      const c = await prisma.chidush.findUnique({ where: { id } });
      return c ? { ...base, title: c.source || c.author || HE.OG_PAGES.chidushim.title, quote: c.text, subtitle: c.source && c.author ? c.author : undefined } : null;
    }
    case 'sikum': {
      const s = await prisma.sikumEntry.findUnique({ where: { id }, include: { book: { select: { name: true } } } });
      return s ? { ...base, title: s.title ? `${s.book.name} — ${s.title}` : s.book.name, quote: s.text } : null;
    }
    case 'rabbi':
      return rabbiSpec(id, withImage);
    case 'book': {
      const b = await prisma.book.findUnique({ where: { id } });
      return b ? { ...pageSpec('rabbis'), eyebrow: HE.OG_FEED_EYEBROW, title: b.title, subtitle: HE.OG_FEED_BOOK_BY(b.author), icon: 'books' } : null;
    }
    case 'gematria': {
      const g = await prisma.gematria.findUnique({ where: { id } });
      return g ? { ...pageSpec('gematria'), eyebrow: HE.OG_FEED_EYEBROW, title: g.word, subtitle: HE.OG_FEED_GEMATRIA(g.value) } : null;
    }
  }
}

export function askSpec(question: string): OgSpec {
  return { tone: 'night', eyebrow: HE.OG_ASK_EYEBROW, title: HE.OG_PAGES.ask.title, quote: question, subtitle: HE.OG_ASK_SUB };
}

export const playSpec = (code: string): OgSpec =>
  pageSpec('play', { title: HE.OG_PLAY_TITLE, subtitle: HE.OG_PLAY_SUB(code), badge: code });

/** Noon in Israel today — a safe instant for "today's" Hebrew date. */
const israelToday = () => new Date(`${israelIso(new Date())}T12:00:00+02:00`);

export async function hilulaSpec(): Promise<OgSpec> {
  const rabbis = await prisma.rabbi.findMany({ where: { deathDate: { not: null } }, select: { name: true, deathDate: true } });
  const today = hilulaRabbisOn(rabbis, israelToday());
  const date = formatHebrewDate(israelToday());
  if (!today.length) return pageSpec('hilula', { subtitle: date ? `${date} · ${HE.OG_PAGES.hilula.subtitle}` : undefined });
  return pageSpec('hilula', {
    title: HE.OG_HILULA_TITLE,
    subtitle: `${date ? `${date} · ` : ''}${joinNames(today.map(r => r.name), 3, HE.PUSH_MORE)}`,
  });
}

export function todaySpec(): OgSpec {
  const date = formatHebrewDate(israelToday(), true);
  return pageSpec('today', date ? { eyebrow: HE.OG_TODAY_EYEBROW, title: date, subtitle: HE.OG_TODAY_SUB } : {});
}

export function siddurSpec(service: string): OgSpec {
  if (!isServiceId(service)) return pageSpec('siddur');
  return pageSpec('siddur', { title: HE.OG_SIDDUR_TITLE(getService(service).title), subtitle: HE.OG_SIDDUR_SUB });
}

export function learnSpec(kind: string): OgSpec {
  if (!isLearnKind(kind)) return pageSpec('learn');
  return pageSpec('learn', { title: learnKind(kind).label });
}

/** Title + description for a content page's own share metadata (no image fetch). */
export function specText(spec: OgSpec): { title: string; description: string } {
  const body = cleanText(spec.quote ?? spec.subtitle ?? '');
  return { title: spec.title, description: body.length > 160 ? `${body.slice(0, 159)}…` : body };
}

export async function rabbiByName(name: string): Promise<string | null> {
  const r = await prisma.rabbi.findFirst({ where: { name: name.trim() }, select: { id: true } });
  return r?.id ?? null;
}
