import type { AdminDailyRow } from '@/types';

export type DailyMetric = 'users' | 'feed' | 'content' | 'today' | 'pwa';

/** Sum of the last `n` days for a metric, skipping `offset` days from the end. */
export function sumLast(daily: AdminDailyRow[], metric: DailyMetric, n: number, offset = 0): number {
  const end = daily.length - offset;
  return daily.slice(Math.max(0, end - n), end).reduce((s, r) => s + r[metric], 0);
}

export interface Delta {
  text: string;
  dir: 'up' | 'down' | 'flat';
}

export function computeDelta(cur: number, prev: number): Delta {
  if (cur === prev) return { text: '±0', dir: 'flat' };
  const sign = cur > prev ? '+' : '-';
  const diff = Math.abs(cur - prev);
  const pct = prev > 0 ? ` (${sign}${Math.round((diff / prev) * 100)}%)` : '';
  return { text: `${sign}${diff}${pct}`, dir: cur > prev ? 'up' : 'down' };
}

/** Smallest "nice" axis maximum ≥ max (halves stay clean for mid gridline). */
export function niceMax(max: number): number {
  const candidates = [4, 8, 12, 16, 20, 30, 40, 60, 80, 100, 150, 200, 300, 400,
    600, 800, 1000, 1500, 2000, 3000, 4000, 6000, 8000, 10000];
  return candidates.find(c => c >= max) ?? Math.ceil(max / 10000) * 10000;
}

/** 'YYYY-MM-DD' → 'D.M' for compact axis labels. */
export function shortDay(day: string): string {
  const [, m, d] = day.split('-');
  return `${Number(d)}.${Number(m)}`;
}
