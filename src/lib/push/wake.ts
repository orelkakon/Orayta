import { localClock } from './schedule';

/**
 * Decides — without touching the database — whether the 5-minute heartbeat
 * needs to run the dispatcher now (pure, tested). Input is the cached list of
 * subscribers' chosen times, so Neon is woken only when someone is actually
 * due: at their chosen minute (+ one backup ping), or at Israel nightfall on
 * nights that have a hilula / omer count for subscribers who want them.
 */
export interface ScheduleEntry {
  timeZone: string;
  dailyMinutes: number;
  daily: boolean;
  hilula: boolean;
  omer: boolean;
}

export interface Tonight { hilula: boolean; omer: boolean; }

/** Two 5-minute pings: the one on the chosen minute and a backup right after. */
export const WAKE_WINDOW_MIN = 6;

export function dailyDueNow(now: Date, entries: ScheduleEntry[]): boolean {
  return entries.some(e => {
    if (!e.daily) return false;
    const late = (localClock(now, e.timeZone).minutes - e.dailyMinutes + 1440) % 1440;
    return late < WAKE_WINDOW_MIN;
  });
}

export function inNightfallWindow(now: Date, nightfallMs: number): boolean {
  const since = now.getTime() - nightfallMs;
  return since >= 0 && since < WAKE_WINDOW_MIN * 60_000;
}

export function needsDispatch(now: Date, entries: ScheduleEntry[], nightfallMs: number, tonight: Tonight): boolean {
  if (dailyDueNow(now, entries)) return true;
  if (!inNightfallWindow(now, nightfallMs)) return false;
  return (tonight.hilula && entries.some(e => e.hilula)) || (tonight.omer && entries.some(e => e.omer));
}
