const STREAK_KEY = 'orayta_feed_streak';

interface StreakData {
  last: string;
  days: number;
}

function dateStr(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/**
 * Consecutive-day visit streak for the feed, stored per device.
 * Called once per feed entry: same day keeps the count, a visit on the
 * following day extends it, and a longer gap resets it to 1.
 */
export function bumpStreak(): number {
  try {
    const today = dateStr(new Date());
    const y = new Date();
    y.setDate(y.getDate() - 1);
    const yesterday = dateStr(y);

    const raw = localStorage.getItem(STREAK_KEY);
    const data: StreakData = raw ? (JSON.parse(raw) as StreakData) : { last: '', days: 0 };
    if (data.last === today) return data.days;

    const next: StreakData = { last: today, days: data.last === yesterday ? data.days + 1 : 1 };
    localStorage.setItem(STREAK_KEY, JSON.stringify(next));
    return next.days;
  } catch {
    return 1;
  }
}
