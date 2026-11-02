/**
 * Merges the official list with OSM mikvaot and sorts by distance (pure).
 *
 * A pair is the same mikveh when it is very close, or near with a shared
 * distinguishing name word. The official record wins for type, hours, phone
 * and accessibility; OSM adds an exact pin (official pins are geocoded
 * addresses), fees and a website. Town-centre pins never merge — in a city
 * with many mikvaot that would be a guess.
 */
import type { Mikveh } from '@/types/mikveh';
import { haversineM } from '@/lib/minyan/geo';
import type { MikvehRecord } from './parse';

export const SAME_NEAR_M = 60;
export const SAME_NAMED_M = 400;

const GENERIC = new Set(['מקווה', 'מקוה', 'טהרה', 'נשים', 'גברים', 'כלים', 'עירוני', 'המקווה', 'לנשים', 'לגברים']);

export function nameWords(name: string | null): Set<string> {
  if (!name) return new Set();
  const plain = name.replace(/[֑-ׇ]/g, '').replace(/["'״׳`.,()\-–—_/\\]/g, ' ');
  return new Set(plain.split(/\s+/).filter(w => w.length >= 2 && !GENERIC.has(w)));
}

function shareWord(a: string | null, b: string | null): boolean {
  const wa = nameWords(a), wb = nameWords(b);
  return Array.from(wa).some(w => wb.has(w));
}

/** Explicitly opposite audiences (women-only vs men-only) can't be one place. */
function conflicts(a: MikvehRecord, b: MikvehRecord): boolean {
  return (a.women === true && b.women === false && a.men === false) || (a.men === true && b.men === false && a.women === false);
}

export function isSameMikveh(gov: MikvehRecord, osm: MikvehRecord): boolean {
  if (gov.precision === 'city' || conflicts(gov, osm) || conflicts(osm, gov)) return false;
  const d = haversineM(gov.lat, gov.lng, osm.lat, osm.lng);
  return d <= SAME_NEAR_M || (d <= SAME_NAMED_M && shareWord(gov.name, osm.name));
}

function combine(gov: MikvehRecord, osm: MikvehRecord): MikvehRecord {
  return {
    ...gov,
    lat: osm.lat, lng: osm.lng, precision: 'exact',
    name: gov.name ?? osm.name,
    address: gov.address ?? osm.address,
    women: gov.women ?? osm.women,
    men: gov.men ?? osm.men,
    hours: gov.hours ?? osm.hours,
    phone: gov.phone ?? osm.phone,
    accessibility: gov.accessibility ?? osm.accessibility,
    fee: osm.fee,
    website: osm.website,
    sources: [...gov.sources, ...osm.sources],
  };
}

export function mergeMikvaot(gov: MikvehRecord[], osm: MikvehRecord[], center: { lat: number; lng: number }, radiusM: number): Mikveh[] {
  const used = new Set<string>();
  const out: MikvehRecord[] = gov.map(g => {
    let best: MikvehRecord | null = null, bestD = Infinity;
    for (const o of osm) {
      if (used.has(o.id) || !isSameMikveh(g, o)) continue;
      const d = haversineM(g.lat, g.lng, o.lat, o.lng);
      if (d < bestD) { best = o; bestD = d; }
    }
    if (!best) return g;
    used.add(best.id);
    return combine(g, best);
  });
  osm.forEach(o => { if (!used.has(o.id)) out.push(o); });
  return out
    .map(m => ({ ...m, distanceM: Math.round(haversineM(center.lat, center.lng, m.lat, m.lng)) }))
    .filter(m => m.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}

/** Israel is on summer time (IDT, UTC+3) → the dataset's "summer" hours apply. */
export function isIsraelSummer(now = new Date()): boolean {
  const name = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Jerusalem', timeZoneName: 'shortOffset' })
    .formatToParts(now).find(p => p.type === 'timeZoneName')?.value ?? '';
  return name.includes('+3');
}
