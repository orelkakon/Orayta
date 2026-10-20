import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { clip } from '@/lib/siteUrl';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { omerCount } from '@/lib/omer';
import { hilulaRabbisOn, joinNames } from './hilula';
import type { PushPayload } from '@/types/push';

/** Same index for everyone all day, a different one tomorrow. */
function dayIndex(day: string, n: number): number {
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % n;
}

async function dafYomi(): Promise<string | null> {
  try {
    const res = await fetch('https://www.sefaria.org/api/calendars?diaspora=0', { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json() as { calendar_items?: { title: { en: string }; displayValue: { he: string } }[] };
    return data.calendar_items?.find(c => c.title.en === 'Daf Yomi')?.displayValue.he ?? null;
  } catch {
    return null;
  }
}

async function citationOfTheDay(day: string): Promise<string | null> {
  const ids = await prisma.citation.findMany({ select: { id: true }, orderBy: { id: 'asc' } });
  if (ids.length === 0) return null;
  const c = await prisma.citation.findUnique({ where: { id: ids[dayIndex(day, ids.length)].id }, select: { content: true } });
  return c ? clip(c.content.replace(/\s+/g, ' ').trim(), 90) : null;
}

/** Built once per dispatch run — identical for every subscriber that day. */
export async function dailyPayload(now: Date, israelDay: string): Promise<PushPayload> {
  const [daf, quote] = await Promise.all([dafYomi(), citationOfTheDay(israelDay)]);
  const lines = [daf ? HE.PUSH_DAILY_DAF(daf) : null, quote ? `«${quote}»` : null].filter(Boolean);
  return {
    kind: 'daily',
    title: HE.PUSH_DAILY_TITLE(formatHebrewDate(now)),
    body: lines.length ? lines.join('\n') : HE.PUSH_DAILY_FALLBACK,
    url: '/today?source=push',
    tag: `daily-${israelDay}`,
  };
}

/** One notification for all of today's hilulot — null on days without any. */
export async function hilulaPayload(now: Date, israelDay: string): Promise<PushPayload | null> {
  const rabbis = await prisma.rabbi.findMany({ where: { deathDate: { not: null } }, select: { name: true, deathDate: true, sortYear: true } });
  const today = hilulaRabbisOn(rabbis, now).sort((a, b) => a.sortYear - b.sortYear);
  if (today.length === 0) return null;
  const names = joinNames(today.map(r => r.name), 2, HE.PUSH_MORE);
  return {
    kind: 'hilula',
    title: HE.PUSH_HILULA_TITLE(today.length),
    body: HE.PUSH_HILULA_BODY(names, today.length),
    url: '/hilula?source=push',
    tag: `hilula-${israelDay}`,
  };
}

export function omerPayload(day: number, israelDay: string): PushPayload | null {
  const c = omerCount(day);
  if (!c) return null;
  return {
    kind: 'omer',
    title: HE.PUSH_OMER_TITLE,
    body: HE.PUSH_OMER_BODY(c.text.replace(/:$/, '')),
    url: '/omer?source=push',
    tag: `omer-${israelDay}`,
  };
}
