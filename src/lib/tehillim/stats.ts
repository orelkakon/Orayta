import type { TehillimMode, TehillimStats } from '@/types/tehillim';
import { unitChapters } from './units';
import { isTaken, type ClaimRow } from './assign';

/**
 * A reading's statistics (pure, tested): what was read, by how many, how
 * many are reading right now, and when — per hour today and per day for two
 * weeks, in Israel time. Reader names are only the ones readers chose to give.
 */
const HOUR = 3_600_000;
const DAY = 86_400_000;
const israelDay = (t: number) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date(t));

export function circleStats(claims: ClaimRow[], mode: TehillimMode, now: number, holdMs: number): TehillimStats {
  const done = claims.filter(c => c.status === 'done' && c.doneAt !== null);
  const today = israelDay(now);
  const hourly = new Array<number>(24).fill(0);
  const days = Array.from({ length: 14 }, (_, i) => israelDay(now - (13 - i) * DAY));
  const daily = new Array<number>(14).fill(0);
  const names = new Map<string, number>();
  let chapters = 0;
  let todayCount = 0;

  for (const c of done) {
    const at = c.doneAt as number;
    chapters += unitChapters(mode, c.unit);
    const day = israelDay(at);
    if (day === today) todayCount += 1;
    const h = Math.floor((now - at) / HOUR);
    if (h >= 0 && h < 24) hourly[23 - h] += 1;
    const d = days.indexOf(day);
    if (d >= 0) daily[d] += 1;
    const name = c.readerName?.trim();
    if (name) names.set(name, (names.get(name) ?? 0) + 1);
  }

  return {
    readUnits: done.length,
    chapters,
    readers: new Set(done.map(c => c.readerHash)).size,
    live: claims.filter(c => c.status === 'held' && isTaken(c, now, holdMs)).length,
    today: todayCount,
    hourly,
    daily,
    recent: done.slice().sort((a, b) => (b.doneAt as number) - (a.doneAt as number)).slice(0, 8)
      .map(c => ({ unit: c.unit, round: c.round, at: new Date(c.doneAt as number).toISOString(), name: c.readerName })),
    named: Array.from(names, ([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 12),
  };
}
