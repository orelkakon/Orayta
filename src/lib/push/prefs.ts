import { isValidTimeZone, normalizeMinutes } from './schedule';
import type { PushPrefs } from '@/types/push';

/** Keeps only well-formed preference fields (anything else is ignored, not rejected). */
export function parsePrefs(raw: unknown, timeZone?: unknown): Partial<PushPrefs> & { timeZone?: string } {
  const out: Partial<PushPrefs> & { timeZone?: string } = {};
  if (isValidTimeZone(timeZone)) out.timeZone = timeZone;
  if (typeof raw !== 'object' || raw === null) return out;
  const r = raw as Record<string, unknown>;
  const minutes = normalizeMinutes(r.dailyMinutes);
  if (minutes !== null) out.dailyMinutes = minutes;
  for (const key of ['daily', 'hilula', 'omer'] as const) {
    if (typeof r[key] === 'boolean') out[key] = r[key] as boolean;
  }
  return out;
}
