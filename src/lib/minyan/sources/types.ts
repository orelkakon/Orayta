import type { ProviderId } from '@/types/minyan';

/** One provider's record of a synagogue, before cross-source merging. */
export interface PlaceRecord {
  provider: ProviderId;
  key: string;
  name: string | null;
  altName: string | null;
  lat: number;
  lng: number;
  address: string | null;
  nusach: string | null;
  phone: string | null;
  gabbai: { name: string | null; phone: string | null } | null;
  website: string | null;
  /** Last update/verification date published by the source (ISO), if any. */
  updatedAt: string | null;
  url: string | null;
  schedule: { weekday: string | null; shabbat: string | null; general: string | null; updatedAt: string | null } | null;
  /** Set when the record says it was copied from another provider. */
  derivedFrom: ProviderId | null;
}

export const blankRecord = (provider: ProviderId, key: string, lat: number, lng: number): PlaceRecord => ({
  provider, key, lat, lng,
  name: null, altName: null, address: null, nusach: null, phone: null, gabbai: null,
  website: null, updatedAt: null, url: null, schedule: null, derivedFrom: null,
});

export interface SourceResult {
  records: PlaceRecord[];
  state: 'ok' | 'error' | 'out-of-area';
  datasetUpdatedAt: string | null;
  truncated?: boolean;
}

export const USER_AGENT = 'Orayta/1.0 (+https://orayta-eight.vercel.app)';
