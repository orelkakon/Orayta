/* Nearby minyanim (מניין קרוב) — shared client/server types.
   Everything here is derived automatically from external sources; nothing is
   entered by hand. A field is null when no source provides it. */

/** An external data provider. One provider = one independent origin. */
export type ProviderId = 'osm' | 'wikidata' | 'muni-beersheva' | 'muni-telaviv';

export type ReliabilityLevel = 'high' | 'medium' | 'low';

/**
 * Why a level was assigned — rendered as a short explanation.
 *   multi   — several independent, current sources agree
 *   single  — one credible, current source
 *   stale   — sources exist but none is reasonably current
 *   undated — the source gives no usable last-updated date
 *   conflict — independent current sources disagree (schedules only)
 */
export type ReliabilityReason = 'multi' | 'single' | 'stale' | 'undated' | 'conflict';

export interface Reliability {
  level: ReliabilityLevel;
  reason: ReliabilityReason;
  /** Independent, reasonably current providers (copies of one source count once). */
  independent: number;
  /** All independent providers, current or not. */
  total: number;
}

/** One provider's record for a synagogue. */
export interface SourceRef {
  provider: ProviderId;
  /** Last update/verification date published by the source (ISO date), if any. */
  updatedAt: string | null;
  /** Link to the record or dataset at the source, if any. */
  url: string | null;
}

/** A prayer schedule exactly as one source publishes it (free text, not parsed). */
export interface ScheduleText {
  provider: ProviderId;
  weekday: string | null;
  shabbat: string | null;
  /** Source text that doesn't split by day (e.g. OSM service_times). */
  general: string | null;
  updatedAt: string | null;
}

export interface ContactValue { value: string; provider: ProviderId; }

export interface Synagogue {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  distanceM: number;
  address: string | null;
  nusach: string | null;
  phone: ContactValue | null;
  gabbai: { name: string | null; phone: string | null; provider: ProviderId } | null;
  website: string | null;
  sources: SourceRef[];
  existence: Reliability;
  schedules: ScheduleText[];
  /** null when no source publishes a schedule — shown as "unknown". */
  schedule: Reliability | null;
}

export interface ProviderStatus {
  provider: ProviderId;
  /** 'ok' | 'error' (source unavailable now) | 'out-of-area' (not queried). */
  state: 'ok' | 'error' | 'out-of-area';
  datasetUpdatedAt: string | null;
}

export interface NearbyResponse {
  center: { lat: number; lng: number };
  radiusM: number;
  synagogues: Synagogue[];
  providers: ProviderStatus[];
  truncated: boolean;
  fetchedAt: string;
}

export interface GeocodeResult { label: string; lat: number; lng: number; }
