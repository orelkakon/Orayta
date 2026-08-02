const KEY = 'orayta_feed_daily';

/** Slides that make up one "daily moment" before the seal appears. */
export const DAILY_GOAL = 10;

export interface DailyProgress {
  date: string;
  viewed: number;
  sealed: boolean;
}

function today(): string {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Read today's progress; a stored record from another day resets. */
export function getDailyProgress(): DailyProgress {
  const fresh: DailyProgress = { date: today(), viewed: 0, sealed: false };
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return fresh;
    const data = JSON.parse(raw) as DailyProgress;
    return data.date === today() ? data : fresh;
  } catch {
    return fresh;
  }
}

/** Count one newly-seen slide toward today's goal. */
export function bumpViewed(): DailyProgress {
  const data = getDailyProgress();
  const next = { ...data, viewed: data.viewed + 1 };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

/** The user reached today's seal — the day is complete. */
export function markSealed(): void {
  const next = { ...getDailyProgress(), sealed: true };
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
}
