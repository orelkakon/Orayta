/* Nearby mikvaot (מקווה בסביבה) — shared client/server types.
   Everything comes from public sources; a field is null when no source
   publishes it (shown as "not published", never guessed). */

export type MikvehSource = 'gov' | 'osm';

/** How exactly the pin is known: the official dataset has addresses only. */
export type MikvehPrecision = 'exact' | 'street' | 'area' | 'city';

export type Accessibility = 'full' | 'partial' | 'none';

/** Opening hours verbatim as published. */
export interface MikvehHours {
  summer: string | null;
  winter: string | null;
  /** ערבי שבת וחג */
  shabbat: string | null;
  /** Hours that don't split by season (OSM opening_hours). */
  general: string | null;
  source: MikvehSource;
}

export interface MikvehSourceRef {
  source: MikvehSource;
  updatedAt: string | null;
  url: string | null;
}

export interface Mikveh {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  distanceM: number;
  precision: MikvehPrecision;
  address: string | null;
  city: string | null;
  /** null = the source doesn't say. */
  women: boolean | null;
  men: boolean | null;
  vessels: boolean | null;
  hours: MikvehHours | null;
  phone: string | null;
  accessibility: Accessibility | null;
  brideRoom: boolean | null;
  /** מיגון — protected space. */
  shelter: boolean | null;
  /** מקווה תורן — on duty when others are closed. */
  onDuty: boolean | null;
  /** Price / fee as published (OSM `charge`, or paid / free). */
  fee: { paid: boolean | null; text: string | null } | null;
  website: string | null;
  sources: MikvehSourceRef[];
}

export interface MikvehProviderStatus {
  source: MikvehSource;
  state: 'ok' | 'error';
  updatedAt: string | null;
  snapshot?: boolean;
  detail?: string;
}

export interface MikvehNearbyResponse {
  center: { lat: number; lng: number };
  radiusM: number;
  mikvaot: Mikveh[];
  providers: MikvehProviderStatus[];
  fetchedAt: string;
}
