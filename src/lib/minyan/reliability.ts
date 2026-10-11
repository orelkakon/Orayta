/**
 * Automatic, evidence-based reliability — no manual input anywhere.
 *
 *   high   — ≥2 independent providers, each reasonably current, agree
 *   medium — exactly one credible, reasonably current provider
 *   low    — only stale or undated evidence
 *
 * Independence is per provider *family*: several records from one provider
 * (an OSM node and way for the same building), or an OSM record whose
 * `source` tag says it was copied from another provider, count once.
 */
import type { ProviderId, Reliability, ScheduleText, SourceRef } from '@/types/minyan';

const DAY_MS = 86_400_000;
/** A building's existence/location changes slowly. */
export const EXISTENCE_CURRENT_DAYS = 5 * 365;
/** Prayer times change seasonally and with leadership — much shorter. */
export const SCHEDULE_CURRENT_DAYS = 365;

export interface Evidence {
  provider: ProviderId;
  /** Independence key — equal families are copies of one underlying source. */
  family: string;
  updatedAt: string | null;
}

export const familyOf = (provider: ProviderId): string => provider;

function isCurrent(updatedAt: string | null, now: Date, maxDays: number): boolean | null {
  if (!updatedAt) return null;
  const t = Date.parse(updatedAt);
  if (Number.isNaN(t)) return null;
  return now.getTime() - t <= maxDays * DAY_MS;
}

/** Per family, keep the freshest record so a stale copy can't mask a fresh one. */
function freshestPerFamily(ev: Evidence[]): Evidence[] {
  const best = new Map<string, Evidence>();
  for (const e of ev) {
    const prev = best.get(e.family);
    const newer = !prev || (e.updatedAt && (!prev.updatedAt || e.updatedAt > prev.updatedAt));
    if (newer) best.set(e.family, e);
  }
  return Array.from(best.values());
}

export function classify(ev: Evidence[], now: Date, maxDays: number): Reliability {
  const fams = freshestPerFamily(ev);
  const current = fams.filter(e => isCurrent(e.updatedAt, now, maxDays) === true);
  const total = fams.length;
  if (current.length >= 2) return { level: 'high', reason: 'multi', independent: current.length, total };
  if (current.length === 1) return { level: 'medium', reason: 'single', independent: 1, total };
  const anyDated = fams.some(e => isCurrent(e.updatedAt, now, maxDays) !== null);
  return { level: 'low', reason: anyDated ? 'stale' : 'undated', independent: 0, total };
}

export function classifyExistence(sources: SourceRef[], families: Map<ProviderId, string>, now: Date): Reliability {
  return classify(
    sources.map(s => ({ provider: s.provider, family: families.get(s.provider) ?? familyOf(s.provider), updatedAt: s.updatedAt })),
    now, EXISTENCE_CURRENT_DAYS,
  );
}

/** Canonical form of schedule text for agreement checks: digits/times only, in order. */
export function scheduleFingerprint(s: ScheduleText): string {
  const text = [s.weekday, s.shabbat, s.general].filter(Boolean).join(' ');
  const times = text.match(/\b([01]?\d|2[0-3])[:.][0-5]\d\b/g) ?? [];
  return times.map(t => t.replace('.', ':').padStart(5, '0')).join(',');
}

/**
 * Schedules are only "high" when two independent current sources publish the
 * same times. Disagreeing current sources are reported as a conflict (low).
 */
export function classifySchedule(schedules: ScheduleText[], families: Map<ProviderId, string>, now: Date): Reliability | null {
  if (schedules.length === 0) return null;
  const ev = schedules.map(s => ({ provider: s.provider, family: families.get(s.provider) ?? familyOf(s.provider), updatedAt: s.updatedAt }));
  const base = classify(ev, now, SCHEDULE_CURRENT_DAYS);
  if (base.level !== 'high') return base;
  const prints = schedules
    .filter(s => isCurrent(s.updatedAt, now, SCHEDULE_CURRENT_DAYS))
    .map(scheduleFingerprint);
  // Agreement can only be established between schedules that contain times.
  if (prints.some(p => !p)) return { level: 'medium', reason: 'single', independent: 1, total: base.total };
  return new Set(prints).size === 1 ? base : { ...base, level: 'low', reason: 'conflict' };
}
