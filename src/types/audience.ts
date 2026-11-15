import type { TrafficSource } from '@/lib/audience/source';

/** One row per source: arrivals (first page of a browser session). */
export interface SourceRow {
  source: TrafficSource;
  today: number;
  week: number;
  month: number;
}

export interface CampaignRow {
  utmSource: string;   // '' = none
  utmCampaign: string;
  week: number;
  month: number;
}

export interface SourcesStats {
  available: boolean;  // false until the table exists
  since: string | null; // first day with data
  rows: SourceRow[];
  campaigns: CampaignRow[];
}

export interface DeviceDayPoint {
  day: string;
  fresh: number;     // first seen that day
  returning: number;
}

export interface ReturnRate {
  cohort: number;    // devices first seen in the window
  returned: number;
  pct: number | null; // null when the cohort is empty
}

export interface DeviceStats {
  today: { fresh: number; returning: number };
  uniques7: number;
  uniques30: number;
  d1: ReturnRate;    // came back the next day
  d7: ReturnRate;    // came back within 7 days
  daily: DeviceDayPoint[];
  since: string | null;
}

export interface DevicesStats extends DeviceStats {
  available: boolean;  // false until the table exists
  configured: boolean; // STATS_SALT is set
}

export interface AudienceStats {
  sources: SourcesStats;
  devices: DevicesStats;
}

/** Row shape the device computation reads. */
export interface DeviceRow {
  day: string;
  idHash: string;
  firstDay: string | null;
}
