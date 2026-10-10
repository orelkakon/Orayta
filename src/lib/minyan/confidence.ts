/**
 * Turns raw community reports into graded minyan times.
 *
 * The grade is transparent by construction — every level is derived from
 * three visible facts that the UI shows next to the badge:
 *   1. corroboration — how many distinct people confirmed this exact time
 *   2. freshness     — how long ago it was last confirmed
 *   3. disputes      — distinct people who said it's wrong since then
 * plus whether the site admin entered it (verified). No opaque percentages.
 */
import type {
  ConfidenceLevel, DayType, MinyanTime, PrayerService, ReportKind, ScheduleStatus,
} from '@/types/minyan';

export interface RawReport {
  service: PrayerService;
  dayType: DayType;
  time: string;
  kind: ReportKind;
  verified: boolean;
  reporter: string;
  createdAt: Date;
}

/** Reports older than this are ignored entirely — schedules change seasonally. */
export const REPORT_MAX_AGE_DAYS = 365;
const DAY_MS = 86_400_000;

export const SERVICE_ORDER: PrayerService[] = ['shacharit', 'mincha', 'maariv'];
const DAY_ORDER: DayType[] = ['weekday', 'shabbat'];

export function freshnessPoints(ageDays: number): number {
  if (ageDays <= 30) return 2;
  if (ageDays <= 90) return 1;
  if (ageDays <= 180) return 0;
  return -1;
}

export function gradeTime(reporters: number, ageDays: number, disputes: number, verified: boolean): ConfidenceLevel {
  if (verified && disputes < 2) return 'verified';
  const score = Math.min(reporters, 3) + freshnessPoints(ageDays) - 2 * disputes;
  if (disputes > 0 && score <= 1) return 'disputed';
  if (score >= 4) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

export function summarizeTimes(reports: RawReport[], now: Date): MinyanTime[] {
  const cutoff = now.getTime() - REPORT_MAX_AGE_DAYS * DAY_MS;
  const groups = new Map<string, RawReport[]>();
  for (const r of reports) {
    if (r.createdAt.getTime() < cutoff) continue;
    const key = `${r.service}|${r.dayType}|${r.time}`;
    const list = groups.get(key);
    if (list) list.push(r); else groups.set(key, [r]);
  }

  const out: MinyanTime[] = [];
  groups.forEach(list => {
    const confirms = list.filter(r => r.kind === 'confirm');
    if (confirms.length === 0) return; // a dispute alone never creates a time
    const lastConfirm = Math.max(...confirms.map(r => r.createdAt.getTime()));
    const reporters = new Set(confirms.map(r => r.reporter)).size;
    const disputes = new Set(
      list.filter(r => r.kind === 'dispute' && r.createdAt.getTime() > lastConfirm).map(r => r.reporter),
    ).size;
    const verified = confirms.some(r => r.verified);
    const ageDays = (now.getTime() - lastConfirm) / DAY_MS;
    const { service, dayType, time } = list[0];
    out.push({
      service, dayType, time, verified, reporters, disputes,
      level: gradeTime(reporters, ageDays, disputes, verified),
      lastConfirmedAt: new Date(lastConfirm).toISOString(),
    });
  });

  return out.sort((a, b) =>
    SERVICE_ORDER.indexOf(a.service) - SERVICE_ORDER.indexOf(b.service)
    || DAY_ORDER.indexOf(a.dayType) - DAY_ORDER.indexOf(b.dayType)
    || a.time.localeCompare(b.time));
}

export function scheduleStatus(times: MinyanTime[]): ScheduleStatus {
  if (times.some(t => t.level === 'verified')) return 'verified';
  if (times.some(t => t.level !== 'disputed')) return 'reported';
  return 'unknown';
}

/* ── Input validation ────────────────────────────────────────────────── */

export const PLACE_ID_RE = /^(node|way|relation)\/\d{1,15}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Loose per-service windows (minutes from midnight) to reject obvious junk. */
const WINDOWS: Record<PrayerService, [number, number][]> = {
  shacharit: [[3 * 60, 13 * 60]],
  mincha:    [[11 * 60, 21 * 60]],
  maariv:    [[16 * 60, 24 * 60], [0, 2 * 60 + 30]],
};

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function isPlausibleTime(service: PrayerService, time: string): boolean {
  if (!TIME_RE.test(time)) return false;
  const t = toMinutes(time);
  return WINDOWS[service].some(([a, b]) => t >= a && t < b);
}
