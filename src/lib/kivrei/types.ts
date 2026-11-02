/* קברי צדיקים באזור — shared types (build script, API, UI). */

/** One grave in the committed dataset (scripts/kivrei-build.ts). */
export interface KeverEntry {
  /** "wp:<pageid>" (Hebrew Wikipedia grave page) or "osm:<type>/<id>". */
  id: string;
  /** Name of the site as published, e.g. "קבר רבי שמעון בר יוחאי". */
  name: string;
  /** The buried person / people, derived from the site name. */
  person: string | null;
  lat: number;
  lng: number;
  /** Short text: who the person was (or about the site, see aboutFrom). */
  about: string | null;
  aboutFrom: 'person' | 'site' | null;
  personUrl: string | null;
  siteUrl: string | null;
  siteAbout: string | null;
  /** Wikimedia thumbnail URL. */
  image: string | null;
  wikidata: string | null;
  /** Visiting hours as published in OSM (opening_hours). */
  hours: string | null;
  /** OSM description (often directions). */
  note: string | null;
  wheelchair: string | null;
  osmUrl: string | null;
}

/** A rabbi from the site's own directory that the grave belongs to. */
export interface KeverRabbi {
  name: string;
  /** Hebrew yahrzeit as stored (e.g. "ל״ג בעומר"), if known. */
  deathDate: string | null;
  datePeriod: string | null;
}

export interface Kever extends Omit<KeverEntry, 'siteAbout' | 'wikidata' | 'aboutFrom'> {
  /** 'directory' = the bio from the site's own rabbi directory. */
  aboutFrom: 'person' | 'site' | 'directory' | null;
  distanceM: number;
  rabbi: KeverRabbi | null;
}

export interface KivreiNearbyResponse {
  center: { lat: number; lng: number };
  radiusM: number;
  kivrei: Kever[];
  /** Date the dataset was built (ISO). */
  datasetDate: string;
  fetchedAt: string;
}
