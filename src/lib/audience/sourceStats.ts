import { TRAFFIC_SOURCES, TrafficSource } from './source';
import type { CampaignRow, SourceRow } from '@/types/audience';

/** A TrafficSourceDaily row as read by the dashboard. */
export interface SourceDayRow {
  day: string;
  source: string;
  utmSource: string;
  utmCampaign: string;
  count: number;
}

const TOP_CAMPAIGNS = 12;

/**
 * Per-source arrivals for today / 7 / 30 days and the top UTM campaigns —
 * pure. `days` = the last 30 day keys, oldest first (the last is today).
 */
export function computeSourceStats(rows: SourceDayRow[], days: string[]): { rows: SourceRow[]; campaigns: CampaignRow[]; since: string | null } {
  const today = days[days.length - 1];
  const weekFrom = days[Math.max(0, days.length - 7)];
  const monthFrom = days[0];
  const inMonth = rows.filter(r => r.day >= monthFrom && r.day <= today);

  const bySource = new Map<TrafficSource, SourceRow>(
    TRAFFIC_SOURCES.map(s => [s, { source: s, today: 0, week: 0, month: 0 }]),
  );
  const camp = new Map<string, CampaignRow>();
  for (const r of inMonth) {
    const row = bySource.get(r.source as TrafficSource);
    if (row) {
      row.month += r.count;
      if (r.day >= weekFrom) row.week += r.count;
      if (r.day === today) row.today += r.count;
    }
    if (!r.utmCampaign && !r.utmSource) continue;
    const key = `${r.utmSource}\u0000${r.utmCampaign}`;
    const c = camp.get(key) ?? { utmSource: r.utmSource, utmCampaign: r.utmCampaign, week: 0, month: 0 };
    c.month += r.count;
    if (r.day >= weekFrom) c.week += r.count;
    camp.set(key, c);
  }

  const since = rows.reduce<string | null>((m, r) => (m === null || r.day < m ? r.day : m), null);
  return {
    rows: Array.from(bySource.values()).sort((a, b) => b.month - a.month || b.week - a.week),
    campaigns: Array.from(camp.values())
      .sort((a, b) => b.month - a.month || b.week - a.week)
      .slice(0, TOP_CAMPAIGNS),
    since,
  };
}
