/**
 * Merges per-provider records into one entry per real synagogue (pure).
 *
 * Two records are the same place when they are very close and their names
 * don't contradict, or reasonably close with clearly matching names. Each
 * merged entry keeps one record per provider, so a provider can never
 * corroborate itself.
 */
import type { ContactValue, ProviderId, Synagogue, SourceRef, ScheduleText } from '@/types/minyan';
import { haversineM } from './geo';
import { classifyExistence, classifySchedule, familyOf } from './reliability';
import type { PlaceRecord } from './sources/types';

export const MATCH_NEAR_M = 25;
export const MATCH_FAR_M = 75;

/* Words that describe *a* synagogue rather than name one ("מקלט" = a synagogue in a public shelter). */
const GENERIC = new Set(['בית', 'הכנסת', 'כנסת', 'ביכנס', 'ביהכנס', 'בהכנ', 'בכנ', 'מקלט', 'ציבורי', 'synagogue', 'beit', 'knesset', 'the', 'of']);

export function nameTokens(name: string | null): Set<string> {
  if (!name) return new Set();
  const plain = name
    .replace(/[֑-ׇ]/g, '')            // nikud / cantillation
    .replace(/["'״׳`.,()\-–—_/\\]/g, ' ')
    .toLowerCase();
  return new Set(plain.split(/\s+/).filter(t => t.length >= 2 && !GENERIC.has(t)));
}

/** Overlap coefficient of name tokens (handles "עץ חיים" vs "בית כנסת עץ חיים"); null if unnamed. */
export function nameSimilarity(a: PlaceRecord, b: PlaceRecord): number | null {
  const ta = new Set(Array.from(nameTokens(a.name)).concat(Array.from(nameTokens(a.altName))));
  const tb = new Set(Array.from(nameTokens(b.name)).concat(Array.from(nameTokens(b.altName))));
  if (ta.size === 0 || tb.size === 0) return null;
  let shared = 0;
  ta.forEach(t => { if (tb.has(t)) shared++; });
  return shared / Math.min(ta.size, tb.size);
}

export function isSamePlace(a: PlaceRecord, b: PlaceRecord): boolean {
  const d = haversineM(a.lat, a.lng, b.lat, b.lng);
  const sim = nameSimilarity(a, b);
  if (d <= MATCH_NEAR_M) return sim === null || sim >= 0.34;
  return d <= MATCH_FAR_M && sim !== null && sim >= 0.5;
}

/* Field precedence: official municipal data first for address/contacts, OSM for names. */
const POS_ORDER: ProviderId[] = ['muni-telaviv', 'muni-beersheva', 'osm', 'wikidata'];
const NAME_ORDER: ProviderId[] = ['osm', 'muni-telaviv', 'muni-beersheva', 'wikidata'];
const ADDR_ORDER: ProviderId[] = ['muni-telaviv', 'muni-beersheva', 'osm'];
const CONTACT_ORDER: ProviderId[] = ['muni-telaviv', 'osm'];

function pick<T>(recs: PlaceRecord[], order: ProviderId[], get: (r: PlaceRecord) => T | null): { value: T; provider: ProviderId } | null {
  for (const p of order) {
    const r = recs.find(x => x.provider === p);
    const v = r ? get(r) : null;
    if (r && v !== null && v !== undefined && v !== '') return { value: v, provider: p };
  }
  return null;
}

export function buildSynagogue(recs: PlaceRecord[], origin: { lat: number; lng: number }, now: Date): Synagogue {
  const pos = pick(recs, POS_ORDER, r => ({ lat: r.lat, lng: r.lng }))!.value;
  // An OSM record copied from another provider is not independent of it.
  const families = new Map<ProviderId, string>(recs.map(r => [r.provider, r.derivedFrom ? familyOf(r.derivedFrom) : familyOf(r.provider)]));
  const sources: SourceRef[] = recs.map(r => ({ provider: r.provider, updatedAt: r.updatedAt, url: r.url }));
  const schedules: ScheduleText[] = recs.flatMap(r => (r.schedule ? [{ provider: r.provider, ...r.schedule }] : []));
  const phone = pick(recs, CONTACT_ORDER, r => r.phone);
  const gabbaiRec = recs.find(r => r.gabbai);
  return {
    id: `${recs[0].provider}:${recs[0].key}`,
    name: pick(recs, NAME_ORDER, r => r.name)?.value ?? null,
    lat: pos.lat, lng: pos.lng,
    distanceM: Math.round(haversineM(origin.lat, origin.lng, pos.lat, pos.lng)),
    address: pick(recs, ADDR_ORDER, r => r.address)?.value ?? null,
    nusach: pick(recs, CONTACT_ORDER, r => r.nusach)?.value ?? null,
    phone: phone ? ({ value: phone.value, provider: phone.provider } as ContactValue) : null,
    gabbai: gabbaiRec?.gabbai ? { ...gabbaiRec.gabbai, provider: gabbaiRec.provider } : null,
    website: pick(recs, ['osm'], r => r.website)?.value ?? null,
    sources,
    existence: classifyExistence(sources, families, now),
    schedules,
    schedule: classifySchedule(schedules, families, now),
  };
}

/** Clusters all records (OSM first as the base layer), then builds sorted entries. */
export function mergeRecords(
  records: PlaceRecord[], origin: { lat: number; lng: number }, radiusM: number, now: Date,
): Synagogue[] {
  const inRange = records.filter(r => haversineM(origin.lat, origin.lng, r.lat, r.lng) <= radiusM + MATCH_FAR_M);
  const order: ProviderId[] = ['osm', 'muni-telaviv', 'muni-beersheva', 'wikidata'];
  inRange.sort((a, b) => order.indexOf(a.provider) - order.indexOf(b.provider));

  const clusters: PlaceRecord[][] = [];
  for (const rec of inRange) {
    let best: { c: PlaceRecord[]; d: number } | null = null;
    for (const c of clusters) {
      if (c.some(x => x.provider === rec.provider)) continue;
      const anchor = c[0];
      if (!isSamePlace(anchor, rec)) continue;
      const d = haversineM(anchor.lat, anchor.lng, rec.lat, rec.lng);
      if (!best || d < best.d) best = { c, d };
    }
    if (best) best.c.push(rec); else clusters.push([rec]);
  }

  return clusters
    .map(c => buildSynagogue(c, origin, now))
    .filter(s => s.distanceM <= radiusM)
    .sort((a, b) => a.distanceM - b.distanceM);
}
