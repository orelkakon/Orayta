const STREAK_KEY = 'orayta_feed_streak';

interface StreakData {
  last: string;
  days: number;
  best: number;
}

export interface StreakInfo {
  days: number;
  /** All-time longest run on this device. */
  best: number;
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Consecutive-day visit streak for the feed, stored per device.
 * Called once per feed entry: same day keeps the count, a visit on the
 * following day extends it, and a longer gap resets it to 1.
 * The best-ever run is kept so a broken streak still leaves a record
 * to beat rather than an erased history.
 */
export function bumpStreak(): StreakInfo {
  try {
    const today = dateStr(new Date());
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = dateStr(y);

    const raw = localStorage.getItem(STREAK_KEY);
    // `best` is a later addition — older stored records won't have it.
    const parsed: Partial<StreakData> = raw ? (JSON.parse(raw) as Partial<StreakData>) : {};
    const data: StreakData = {
      last: parsed.last ?? '',
      days: parsed.days ?? 0,
      best: parsed.best ?? parsed.days ?? 0,
    };
    if (data.last === today) return { days: data.days, best: Math.max(data.best, data.days) };

    const days = data.last === yesterday ? data.days + 1 : 1;
    const next: StreakData = { last: today, days, best: Math.max(data.best ?? 0, days) };
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return { days: next.days, best: next.best };
  } catch {
    return { days: 1, best: 1 };
  }
}
