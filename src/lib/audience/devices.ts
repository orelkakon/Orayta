import type { DeviceRow, DeviceStats, ReturnRate } from '@/types/audience';

/**
 * New vs returning devices from DeviceDay rows — pure, unit-tested.
 * "New" = the device's first-seen day is that day. Devices that existed
 * before the anonymous id (firstDay null) always count as returning and
 * are left out of the D1/D7 cohorts.
 */

/** Rows older than this many days are deleted. */
export const DEVICE_RETENTION_DAYS = 90;
/** Days of rows the dashboard reads (30-day chart + the D7 cohorts before it). */
export const DEVICE_READ_DAYS = 38;

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

export const isUuid = (v: unknown): v is string => typeof v === 'string' && UUID_RE.test(v.toLowerCase());

/** 'YYYY-MM-DD' shifted by n days (calendar arithmetic, no time zone). */
export function addDays(day: string, n: number): string {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** A client-claimed first-seen day: a real date, not in the future, not before launch. */
export function validFirstDay(v: unknown, today: string): string | null {
  if (typeof v !== 'string' || !DAY_RE.test(v)) return null;
  if (v > today || v < '2024-01-01') return null;
  return addDays(v, 0) === v ? v : null;
}

function rate(cohort: Set<string>, returned: Set<string>): ReturnRate {
  const n = cohort.size;
  return { cohort: n, returned: returned.size, pct: n ? Math.round((returned.size / n) * 100) : null };
}

/** `days` = the chart's day keys, oldest first; the last one is today. */
export function computeDeviceStats(rows: DeviceRow[], days: string[]): DeviceStats {
  const today = days[days.length - 1];
  const byDay = new Map<string, DeviceRow[]>();
  const seen = new Map<string, Set<string>>(); // idHash → days active
  const first = new Map<string, string>();     // idHash → firstDay (known only)
  for (const r of rows) {
    const list = byDay.get(r.day);
    if (list) list.push(r); else byDay.set(r.day, [r]);
    seen.set(r.idHash, (seen.get(r.idHash) ?? new Set()).add(r.day));
    if (r.firstDay) first.set(r.idHash, r.firstDay);
  }

  const daily = days.map(day => {
    const list = byDay.get(day) ?? [];
    const fresh = list.filter(r => r.firstDay === day).length;
    return { day, fresh, returning: list.length - fresh };
  });

  const uniques = (n: number) => {
    const from = addDays(today, -(n - 1));
    return new Set(rows.filter(r => r.day >= from && r.day <= today).map(r => r.idHash)).size;
  };

  // D1: first seen in the 30 days before today, active the next day.
  // D7: first seen 7–37 days ago (a full week has passed), active on any of the next 7 days.
  const d1c = new Set<string>(), d1r = new Set<string>();
  const d7c = new Set<string>(), d7r = new Set<string>();
  first.forEach((fd, id) => {
    const active = seen.get(id) ?? new Set<string>();
    if (!active.has(fd)) return; // its first day fell outside the rows read
    if (fd >= addDays(today, -30) && fd <= addDays(today, -1)) {
      d1c.add(id);
      if (active.has(addDays(fd, 1))) d1r.add(id);
    }
    if (fd >= addDays(today, -37) && fd <= addDays(today, -7)) {
      d7c.add(id);
      for (let k = 1; k <= 7; k++) if (active.has(addDays(fd, k))) { d7r.add(id); break; }
    }
  });

  const t = daily[daily.length - 1] ?? { fresh: 0, returning: 0 };
  const since = rows.reduce<string | null>((m, r) => (m === null || r.day < m ? r.day : m), null);
  return {
    today: { fresh: t.fresh, returning: t.returning },
    uniques7: uniques(7),
    uniques30: uniques(30),
    d1: rate(d1c, d1r),
    d7: rate(d7c, d7r),
    daily,
    since,
  };
}
