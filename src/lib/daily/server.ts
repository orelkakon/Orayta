/* Server-only: the day's "היומי" items, read-only. */
import { prisma } from '@/lib/db';
import { sortCitations } from '@/lib/citationsSort';
import { formatHebrewDate } from '@/lib/hebrewDate';
import type { DailySikum } from '@/lib/dailyShare';
import type { Chidush, Citation, Rabbi } from '@/types';
import { dayKeyNoon, pickForDay } from './day';

/**
 * Each list is read exactly as the public API /today fetches it returns it
 * (same filter and order), so `pickForDay` lands on the same item a visitor
 * sees: /api/rabbis (by sortYear), /api/citations (Talmud order),
 * /api/chidushim (newest first), /api/sikum-entries/daily.
 */
export async function dailySikum(key: string): Promise<DailySikum | null> {
  const entries = await prisma.sikumEntry.findMany({
    include: { book: { select: { name: true, author: true } } },
  });
  return pickForDay(entries, key) as unknown as DailySikum | null;
}

export interface DailyItems {
  hebrewDate: string;
  rabbi: Rabbi | null;
  citation: Citation | null;
  sikum: DailySikum | null;
  chidush: Chidush | null;
}

export async function dailyItems(key: string): Promise<DailyItems> {
  const [rabbis, citations, chidushim, sikum] = await Promise.all([
    prisma.rabbi.findMany({ orderBy: { sortYear: 'asc' } }),
    prisma.citation.findMany({ where: { locations: { some: {} } }, include: { locations: true } }),
    prisma.chidush.findMany({ orderBy: { createdAt: 'desc' } }),
    dailySikum(key),
  ]);
  return {
    hebrewDate: formatHebrewDate(dayKeyNoon(key), true),
    rabbi: pickForDay(rabbis, key) as unknown as Rabbi | null,
    citation: pickForDay(sortCitations(citations), key) as unknown as Citation | null,
    sikum,
    chidush: pickForDay(chidushim, key) as unknown as Chidush | null,
  };
}
