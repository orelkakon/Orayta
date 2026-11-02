/**
 * The official mikvaot dataset of the Ministry of Religious Services
 * (המשרד לשירותי דת) on data.gov.il — "מקוואות טהרה", ~650 mikvaot with
 * type (women / men / vessels), opening hours, phone and accessibility.
 * License "Other (Open)"; data.gov.il terms require naming the site, the
 * dataset and its update date — the UI shows exactly that.
 *
 * The dataset has addresses but no coordinates. They come from a committed
 * geocode table (`data/mikveh-geo.json`, built by scripts/mikveh-geocode.ts),
 * keyed by `mikvehGeoKey`. Pure — shared by the API and the script.
 */
export const MIKVEH_PACKAGE_ID = 'mikve';
export const MIKVEH_RESOURCE_ID = 'e80a5e59-3b0f-4be9-983a-dc0971907626';
export const MIKVEH_DATASET_URL = `https://data.gov.il/dataset/${MIKVEH_PACKAGE_ID}`;

export interface GovMikvehRow {
  _id?: number;
  counciName?: string | null;
  mikveName?: string | null;
  mikveCity?: string | null;
  MikveAddress?: string | null;
  activityHoursSummer?: string | null;
  activityHoursWinter?: string | null;
  activityHoursShabat?: string | null;
  accessability?: string | null;
  armorYesNo?: string | null;
  onDutyYesNo?: string | null;
  mikvePhone?: string | null;
  brideRoomYesNo?: string | null;
  mikveForWomenYesNo?: string | null;
  mikveForMenYesNo?: string | null;
  mikveForDishesYesNo?: string | null;
}

/** e = exact address, s = street, a = neighbourhood / named place, c = town centre. */
export type GeoPrecision = 'e' | 's' | 'a' | 'c';
export type GeoEntry = [lat: number, lng: number, precision: GeoPrecision];

export const clean = (v: string | null | undefined): string | null => {
  const s = v?.replace(/\s+/g, ' ').trim();
  return s ? s : null;
};

/** "תל אביב - יפו" → "תל אביב-יפו" (the spelling OSM uses). */
export const normCity = (city: string): string => city.replace(/\s*-\s*/g, '-').trim();

/** Stable key for the geocode table: town + address as published. */
export function mikvehGeoKey(row: GovMikvehRow): string {
  const city = normCity(clean(row.mikveCity) ?? clean(row.counciName) ?? '');
  return `${city}|${clean(row.MikveAddress) ?? ''}`;
}

/** Key of the town-centre fallback entry for a row. */
export const cityGeoKey = (row: GovMikvehRow): string =>
  `${normCity(clean(row.mikveCity) ?? clean(row.counciName) ?? '')}|`;

/* "רחוב" isn't part of OSM street names; "שדרות" is (abbreviated "שד'"). */
const STREET_WORDS = /(^|\s)(?:רחוב|רח['׳".]?)(?=\s)/g;
const BOULEVARD = /(^|\s)שד['׳](?=\s)/g;

/** Splits "רח' הבנים 43" into street "הבנים" and house number "43". */
export function splitAddress(address: string | null): { street: string | null; number: string | null } {
  const a = clean(address?.replace(STREET_WORDS, ' ').replace(BOULEVARD, '$1שדרות') ?? null);
  if (!a) return { street: null, number: null };
  const m = /^(.*?\D)\s*(\d+[א-ת]?)\s*$/.exec(a);
  return m ? { street: clean(m[1].replace(/[,]+$/, '')), number: m[2] } : { street: a, number: null };
}
