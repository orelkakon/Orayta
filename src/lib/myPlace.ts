import { haversineM } from '@/lib/minyan/geo';
import TOWNS from '@/lib/nearbyStats/data/towns.json';

/**
 * "המקום שלי": one place per device that the whole site computes local times
 * for — the home hero's sun and Shabbat times, the zmanim on "יומי". Chosen
 * from the list of cities and towns or taken once from GPS; kept in
 * localStorage only, never sent to our server.
 *
 * The pure helpers here are tested (tests/myPlace.test.ts).
 */
export type PlaceVia = 'gps' | 'city';

export interface MyPlace {
  lat: number;
  lng: number;
  /** City / town name; null for a GPS fix outside Israel. */
  name: string | null;
  via: PlaceVia;
  /** IANA zone the times are shown in. */
  tz: string;
}

export type Town = [name: string, lat: number, lng: number];

const ISRAEL_TZ = 'Asia/Jerusalem';
/** A GPS fix farther than this from every town is "abroad" (no name). */
const MAX_TOWN_M = 20_000;

const clean = (s: string) => s.replace(/[‎‏]/g, '');

/** All cities and towns, sorted for the picker. */
export const TOWN_LIST: Town[] = (TOWNS as Town[])
  .map(([n, a, b]) => [clean(n), a, b] as Town)
  .sort((a, b) => a[0].localeCompare(b[0], 'he'));

export function nearestTown(lat: number, lng: number, towns: Town[] = TOWN_LIST): Town | null {
  let best: Town | null = null;
  let bestM = MAX_TOWN_M;
  for (const t of towns) {
    if (Math.abs(t[1] - lat) > 0.2 || Math.abs(t[2] - lng) > 0.25) continue;
    const d = haversineM(lat, lng, t[1], t[2]);
    if (d < bestM) { bestM = d; best = t; }
  }
  return best;
}

/** A place from a GPS fix: named after the nearest town, or unnamed abroad. */
export function placeFromGps(lat: number, lng: number, deviceTz: string): MyPlace {
  const town = nearestTown(lat, lng);
  return { lat, lng, name: town ? town[0] : null, via: 'gps', tz: town ? ISRAEL_TZ : deviceTz };
}

export const placeFromTown = ([name, lat, lng]: Town): MyPlace => ({ lat, lng, name, via: 'city', tz: ISRAEL_TZ });

/** Inside Israel the site's own sun/Shabbat math applies (it works in Israel time). */
export const inIsrael = (p: MyPlace | null): p is MyPlace & { name: string } => !!p && !!p.name && p.tz === ISRAEL_TZ;

/**
 * Minutes before sunset that the place lights Shabbat candles — the customs
 * Hebcal uses for Israel: Jerusalem 40, Haifa and Zikhron Ya'akov 30,
 * everywhere else 20.
 */
export function candlesMinutes(name: string | null): number {
  if (!name) return 20;
  if (name === 'ירושלים') return 40;
  if (name === 'חיפה' || name === 'זכרון יעקב') return 30;
  return 20;
}

/** Search the town list: prefix matches first, then anywhere in the name. */
export function searchTowns(q: string, towns: Town[] = TOWN_LIST, limit = 30): Town[] {
  const norm = (s: string) => s.replace(/[-–־'"׳״\s]+/g, ' ').trim();
  const query = norm(q);
  if (!query) return towns.slice(0, limit);
  const starts: Town[] = [];
  const within: Town[] = [];
  for (const t of towns) {
    const n = norm(t[0]);
    if (n.startsWith(query)) starts.push(t);
    else if (n.includes(query)) within.push(t);
  }
  return [...starts, ...within].slice(0, limit);
}

/** Parses a stored value; anything malformed reads as no place. */
export function parsePlace(raw: string | null): MyPlace | null {
  try {
    const v = JSON.parse(raw ?? 'null') as Partial<MyPlace> | null;
    if (!v || typeof v.lat !== 'number' || typeof v.lng !== 'number') return null;
    if (!Number.isFinite(v.lat) || !Number.isFinite(v.lng)) return null;
    const via: PlaceVia = v.via === 'gps' ? 'gps' : 'city';
    const tz = typeof v.tz === 'string' && v.tz ? v.tz : ISRAEL_TZ;
    return { lat: v.lat, lng: v.lng, name: typeof v.name === 'string' ? v.name : null, via, tz };
  } catch { return null; }
}

/* ---------- device storage (browser only) ---------- */

const KEY = 'orayta_place';
const CHANGE = 'orayta:place';
const OPEN = 'orayta:place-open';

export function readPlace(): MyPlace | null {
  try { return parsePlace(localStorage.getItem(KEY)); } catch { return null; }
}

export function savePlace(p: MyPlace | null): void {
  try {
    if (p) localStorage.setItem(KEY, JSON.stringify(p));
    else localStorage.removeItem(KEY);
  } catch { /* storage blocked: the choice lasts for this page only */ }
  window.dispatchEvent(new CustomEvent<MyPlace | null>(CHANGE, { detail: p }));
}

export function onPlaceChange(cb: (p: MyPlace | null) => void): () => void {
  const onCustom = (e: Event) => cb((e as CustomEvent<MyPlace | null>).detail);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) cb(parsePlace(e.newValue)); };
  window.addEventListener(CHANGE, onCustom);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(CHANGE, onCustom); window.removeEventListener('storage', onStorage); };
}

/** Opens the place picker from anywhere (PlaceHost listens). */
export function openPlacePicker(): void {
  window.dispatchEvent(new Event(OPEN));
}

export function onOpenPlacePicker(cb: () => void): () => void {
  window.addEventListener(OPEN, cb);
  return () => window.removeEventListener(OPEN, cb);
}
