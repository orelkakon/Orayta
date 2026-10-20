import type { LearnKind } from '@/types/dailyLearning';

/**
 * "Learned today" marks per cycle, stored per device in localStorage
 * (`orayta_daily_learning`) as Israel date keys. Pure helpers + safe IO.
 */
export const LEARN_LOG_KEY = 'orayta_daily_learning';
const MAX_DAYS = 400;

export type LearnLog = Partial<Record<LearnKind, string[]>>;

const toDay = (key: string) => Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / 86400000;

/** Consecutive learned days ending today — or yesterday, so a streak isn't 0 before today's session. */
export function learnStreak(dates: string[], today: string): number {
  const days = new Set(dates.map(toDay));
  let cursor = toDay(today);
  if (!days.has(cursor)) cursor -= 1;
  let n = 0;
  while (days.has(cursor)) { n++; cursor -= 1; }
  return n;
}

/** Adds or removes `date`, newest first, capped. */
export function toggleDate(dates: string[], date: string): string[] {
  if (dates.includes(date)) return dates.filter(d => d !== date);
  return [date, ...dates].sort().reverse().slice(0, MAX_DAYS);
}

export function readLearnLog(): LearnLog {
  try {
    const raw = JSON.parse(localStorage.getItem(LEARN_LOG_KEY) ?? '{}') as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const out: LearnLog = {};
    Object.entries(raw as Record<string, unknown>).forEach(([k, v]) => {
      if (Array.isArray(v)) out[k as LearnKind] = v.filter((d): d is string => typeof d === 'string');
    });
    return out;
  } catch {
    return {};
  }
}

export function writeLearnLog(log: LearnLog): void {
  try { localStorage.setItem(LEARN_LOG_KEY, JSON.stringify(log)); } catch {}
}
