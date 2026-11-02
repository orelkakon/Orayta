import { dayKeys, jerusalemDay } from '@/lib/adminStatsUtils';
import {
  NEARBY_FEATURES, NearbyFeature, NearbySearchRow, NearbyAdminStats, NearbyFeatureStats, FeatureCounts,
} from '@/types/nearbyStats';

/** The stats window for everything but "total". */
export const STATS_DAYS = 30;

const HOUR = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', hourCycle: 'h23' });
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);
const zeroCounts = (): FeatureCounts => ({ minyan: 0, mikveh: 0, kivrei: 0 });
const isFeature = (f: string): f is NearbyFeature => (NEARBY_FEATURES as string[]).includes(f);
const found = (r: NearbySearchRow) => r.status !== 'error';

function median(values: number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

interface Windows { today: string; yesterday: string; week: Set<string>; prevWeek: Set<string>; month: Set<string>; }

function uniqueSearchers(rows: NearbySearchRow[]): number {
  return new Set(rows.map(r => r.ipHash).filter(Boolean)).size;
}

function featureStats(feature: NearbyFeature, rows: NearbySearchRow[], days: string[], w: Windows): NearbyFeatureStats {
  const count = (pred: (d: string) => boolean) => rows.filter((_, i) => pred(days[i])).length;
  const month = rows.filter((_, i) => w.month.has(days[i]));
  const ok = month.filter(found);
  const radii = new Map<number, number>();
  month.forEach(r => radii.set(r.radiusM, (radii.get(r.radiusM) ?? 0) + 1));
  return {
    feature,
    today: count(d => d === w.today),
    yesterday: count(d => d === w.yesterday),
    week: count(d => w.week.has(d)),
    prevWeek: count(d => w.prevWeek.has(d)),
    month: month.length,
    searchers7d: uniqueSearchers(rows.filter((_, i) => w.week.has(days[i]))),
    zeroPct: pct(ok.filter(r => r.results === 0).length, ok.length),
    avgResults: ok.length ? Math.round((ok.reduce((s, r) => s + r.results, 0) / ok.length) * 10) / 10 : 0,
    medianNearestM: median(ok.flatMap(r => (r.nearestM === null ? [] : [r.nearestM]))),
    avgLatencyMs: month.length ? Math.round(month.reduce((s, r) => s + r.latencyMs, 0) / month.length) : 0,
    gpsPct: pct(month.filter(r => r.via === 'gps').length, month.length),
    degradedPct: pct(month.filter(r => r.status !== 'ok').length, month.length),
    errors: month.filter(r => r.status === 'error').length,
    radii: Array.from(radii, ([radiusM, n]) => ({ radiusM, n })).sort((a, b) => a.radiusM - b.radiusM),
  };
}

/** Pure aggregation of the stored rows (any order) into the admin card's numbers. */
export function computeNearbyStats(all: NearbySearchRow[], total: number, now = Date.now()): NearbyAdminStats {
  const keys = dayKeys(STATS_DAYS, now);
  const w: Windows = {
    today: keys[keys.length - 1], yesterday: keys[keys.length - 2],
    week: new Set(keys.slice(-7)), prevWeek: new Set(keys.slice(-14, -7)), month: new Set(keys),
  };
  const rows = all.filter(r => isFeature(r.feature));
  const days = rows.map(r => jerusalemDay(r.createdAt));
  const inWin = (set: Set<string>) => rows.filter((_, i) => set.has(days[i]));
  const month = inWin(w.month);
  const week = inWin(w.week);

  const byIp = new Map<string, Set<string>>();
  rows.forEach((r, i) => {
    if (!r.ipHash || !w.week.has(days[i])) return;
    byIp.set(r.ipHash, (byIp.get(r.ipHash) ?? new Set()).add(days[i]));
  });

  const daily = keys.slice(-14).map(day => ({ day, ...zeroCounts() }));
  const dayIdx = new Map(daily.map((d, i) => [d.day, i]));
  const hours = Array<number>(24).fill(0);
  const areas = new Map<string, { area: string; total: number } & FeatureCounts>();
  const gaps = new Map<string, { area: string; feature: NearbyFeature; zero: number; searches: number }>();
  const sources = new Map<string, number>();

  rows.forEach((r, i) => {
    const f = r.feature as NearbyFeature;
    const di = dayIdx.get(days[i]);
    if (di !== undefined) daily[di][f]++;
    if (!w.month.has(days[i])) return;
    hours[Number(HOUR.format(r.createdAt)) % 24]++;
    const area = r.area ?? '';
    const a = areas.get(area) ?? { area, total: 0, ...zeroCounts() };
    a.total++; a[f]++;
    areas.set(area, a);
    const gk = `${area}|${f}`;
    const g = gaps.get(gk) ?? { area, feature: f, zero: 0, searches: 0 };
    g.searches++;
    if (found(r) && r.results === 0) g.zero++;
    gaps.set(gk, g);
    r.degraded.forEach(k => sources.set(k, (sources.get(k) ?? 0) + 1));
  });

  const ok = month.filter(found);
  return {
    total,
    today: rows.filter((_, i) => days[i] === w.today).length,
    yesterday: rows.filter((_, i) => days[i] === w.yesterday).length,
    week: week.length,
    prevWeek: inWin(w.prevWeek).length,
    searchers7d: uniqueSearchers(week),
    returning7d: Array.from(byIp.values()).filter(d => d.size >= 2).length,
    gpsPct: pct(month.filter(r => r.via === 'gps').length, month.length),
    zeroPct: pct(ok.filter(r => r.results === 0).length, ok.length),
    features: NEARBY_FEATURES.map(f => featureStats(f, rows.filter(r => r.feature === f), days.filter((_, i) => rows[i].feature === f), w)),
    daily,
    hours,
    areas: Array.from(areas.values()).sort((a, b) => b.total - a.total).slice(0, 10),
    gaps: Array.from(gaps.values()).filter(g => g.zero > 0)
      .sort((a, b) => b.zero - a.zero || b.searches - a.searches).slice(0, 10),
    sources: Array.from(sources, ([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n),
  };
}
