/* Nearby minyanim (מניין קרוב) — shared client/server types. */

export type PrayerService = 'shacharit' | 'mincha' | 'maariv';
export type DayType = 'weekday' | 'shabbat';
export type ReportKind = 'confirm' | 'dispute';

/**
 * verified  — entered by the site admin
 * high/medium/low — community reports, graded by corroboration + freshness
 * disputed  — recent reports say the time is wrong / no minyan
 */
export type ConfidenceLevel = 'verified' | 'high' | 'medium' | 'low' | 'disputed';

/** Per-synagogue headline: never claims a minyan without supporting reports. */
export type ScheduleStatus = 'verified' | 'reported' | 'unknown';

export interface MinyanTime {
  service: PrayerService;
  dayType: DayType;
  time: string;              // "HH:MM"
  level: ConfidenceLevel;
  verified: boolean;
  reporters: number;         // distinct people who confirmed this time
  disputes: number;          // distinct people who disputed it since the last confirmation
  lastConfirmedAt: string;   // ISO
}

export interface GabbaiContact {
  name: string | null;
  phone: string | null;
  updatedAt: string;
}

export interface Synagogue {
  id: string;                // OSM element, e.g. "node/123"
  name: string | null;
  lat: number;
  lng: number;
  distanceM: number;
  address: string | null;
  phone: string | null;      // public phone from OpenStreetMap
  website: string | null;
  osmServiceTimes: string | null; // free-text OSM tag, unverified
  gabbai: GabbaiContact | null;   // admin-verified
  times: MinyanTime[];
  status: ScheduleStatus;
}

export interface NearbyResponse {
  center: { lat: number; lng: number };
  radiusM: number;
  synagogues: Synagogue[];
  truncated: boolean;
  fetchedAt: string;
}

export interface GeocodeResult { label: string; lat: number; lng: number; }

export interface MinyanReportInput {
  placeId: string;
  service: PrayerService;
  dayType: DayType;
  time: string;
  kind: ReportKind;
}
