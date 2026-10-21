import { prisma } from '@/lib/db';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { omerCount } from '@/lib/omer';
import { hebrewDayAnchor, hilulaRabbisOn, joinNames } from './hilula';
import type { PushPayload } from '@/types/push';

/** Same index for everyone all day, a different one tomorrow. */
function dayIndex(day: string, n: number): number {
  let h = 2166136261;
  for (const ch of day) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return (h >>> 0) % n;
}

/** Built once per dispatch run — identical for every subscriber that day. */
export async function dailyPayload(now: Date, israelDay: string): Promise<PushPayload> {
  const lines = HE.PUSH_DAILY_LINES;
  return {
    kind: 'daily',
    // An evening reminder already carries the Hebrew date that began at nightfall.
    title: HE.PUSH_DAILY_TITLE(formatHebrewDate(hebrewDayAnchor(now))),
    body: lines[dayIndex(israelDay, lines.length)],
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
