/** Admin statistics for the nearby searches (מניין קרוב · מקווה בסביבה · קברי צדיקים). */

export type NearbyFeature = 'minyan' | 'mikveh' | 'kivrei';
export const NEARBY_FEATURES: NearbyFeature[] = ['minyan', 'mikveh', 'kivrei'];

export type NearbyStatus = 'ok' | 'partial' | 'error';

/** What a search route records (the area and IP hash are added server-side). */
export interface NearbySearchInput {
  feature: NearbyFeature;
  lat: number;
  lng: number;
  via: 'gps' | 'place';
  radiusM: number;
  results: number;
  nearestM: number | null;
  status: NearbyStatus;
  degraded: string[];
  latencyMs: number;
}

/** The stored row, as the stats computation reads it. */
export interface NearbySearchRow {
  createdAt: Date;
  feature: string;
  area: string | null;
  via: string;
  radiusM: number;
  results: number;
  nearestM: number | null;
  status: string;
  degraded: string[];
  latencyMs: number;
  ipHash: string | null;
}

export type FeatureCounts = Record<NearbyFeature, number>;

export interface NearbyFeatureStats {
  feature: NearbyFeature;
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  month: number;
  searchers7d: number;
  /** % of successful searches in 30 days that found nothing. */
  zeroPct: number;
  avgResults: number;
  /** Median distance to the nearest result (30 days), null when nothing was found. */
  medianNearestM: number | null;
  avgLatencyMs: number;
  gpsPct: number;
  /** % of searches answered with a source missing (partial) or failed outright. */
  degradedPct: number;
  errors: number;
  radii: { radiusM: number; n: number }[];
}

export interface NearbyAdminStats {
  total: number;
  today: number;
  yesterday: number;
  week: number;
  prevWeek: number;
  searchers7d: number;
  /** Searchers in the last 7 days who searched on 2+ different days. */
  returning7d: number;
  gpsPct: number;
  zeroPct: number;
  features: NearbyFeatureStats[];
  /** Last 14 days, oldest first. */
  daily: ({ day: string } & FeatureCounts)[];
  /** Searches per Israel hour 0–23, last 30 days. */
  hours: number[];
  /** Top areas in 30 days. */
  areas: ({ area: string; total: number } & FeatureCounts)[];
  /** Area + feature pairs with searches that found nothing (30 days) — coverage gaps. */
  gaps: { area: string; feature: NearbyFeature; zero: number; searches: number }[];
  /** Missing/failed sources in 30 days, e.g. 'osm:snapshot'. */
  sources: { key: string; n: number }[];
}
