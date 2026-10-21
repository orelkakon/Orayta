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

/** Today's daf for the given Israel day — without `date` Sefaria answers for
    its own (US) day, which is still yesterday in the Israeli morning. */
async function dafYomi(israelDay: string): Promise<string | null> {
  try {
    const [y, m, d] = israelDay.split('-');
    const url = `https://www.sefaria.org/api/calendars?diaspora=0&year=${Number(y)}&month=${Number(m)}&day=${Number(d)}`;
    const res = await fetch(url, { next: { revalidate: 3600 } });
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
  const [daf, quote] = await Promise.all([dafYomi(israelDay), citationOfTheDay(israelDay)]);
  const lines = [daf ? HE.PUSH_DAILY_DAF(daf, formatHebrewDate(now)) : null, quote ? `«${quote}»` : null].filter(Boolean);
  return {
    kind: 'daily',
    title: HE.PUSH_DAILY_TITLE,
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
    title: HE.PUSH_HILULA_TITLE(names),
    body: HE.PUSH_HILULA_BODY(today.length),
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
