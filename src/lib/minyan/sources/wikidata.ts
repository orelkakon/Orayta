/**
 * Wikidata (CC0) via the public SPARQL endpoint — independent coverage of
 * notable synagogues (~170 in Israel with coordinates). Freshness = the
 * item's last-modified date. Wikidata can't import ODbL OSM data, so its
 * coordinates are not OSM copies; the reverse is caught via OSM `source`.
 * Endpoint policy: descriptive User-Agent, modest query volume — we cache
 * each ~1km cell for a day and give up quietly after a short timeout.
 */
import { blankRecord, PlaceRecord, SourceResult, USER_AGENT } from './types';
import { ttlCache, snap, SNAP_SLACK_M } from './cache';

interface Binding { item: { value: string }; itemLabel?: { value: string }; coord: { value: string }; mod?: { value: string } }

export function buildWikidataQuery(lat: number, lng: number, radiusKm: number): string {
  return `SELECT ?item ?itemLabel ?coord ?mod WHERE {
  SERVICE wikibase:around { ?item wdt:P625 ?coord .
    bd:serviceParam wikibase:center "Point(${lng.toFixed(5)} ${lat.toFixed(5)})"^^geo:wktLiteral .
    bd:serviceParam wikibase:radius "${radiusKm.toFixed(2)}" . }
  ?item wdt:P31/wdt:P279* wd:Q34627 .
  OPTIONAL { ?item schema:dateModified ?mod . }
  SERVICE wikibase:label { bd:serviceParam wikibase:language "he,en". }
} LIMIT 200`;
}

const POINT_RE = /^Point\((-?[\d.]+) (-?[\d.]+)\)$/;

export function parseWikidata(bindings: Binding[]): PlaceRecord[] {
  const out = new Map<string, PlaceRecord>();
  for (const b of bindings) {
    const qid = b.item.value.split('/').pop() ?? '';
    const m = POINT_RE.exec(b.coord.value);
    if (!/^Q\d+$/.test(qid) || !m || out.has(qid)) continue;
    const r = blankRecord('wikidata', qid, Number(m[2]), Number(m[1]));
    const label = b.itemLabel?.value ?? null;
    r.name = label && label !== qid ? label : null; // label service falls back to the QID
    r.updatedAt = b.mod?.value ?? null;
    r.url = `https://www.wikidata.org/wiki/${qid}`;
    out.set(qid, r);
  }
  return Array.from(out.values());
}

const cache = ttlCache<PlaceRecord[]>(24 * 60 * 60 * 1000);

export async function wikidataSource(lat: number, lng: number, radiusM: number): Promise<SourceResult> {
  const cLat = snap(lat), cLng = snap(lng);
  try {
    const records = await cache(`${cLat.toFixed(2)},${cLng.toFixed(2)},${radiusM}`, async () => {
      const q = buildWikidataQuery(cLat, cLng, (radiusM + SNAP_SLACK_M) / 1000);
      const res = await fetch(`https://query.wikidata.org/sparql?query=${encodeURIComponent(q)}`, {
        headers: { Accept: 'application/sparql-results+json', 'User-Agent': USER_AGENT },
        cache: 'no-store',
        signal: AbortSignal.timeout(9000),
      });
      if (!res.ok) throw new Error(`wikidata HTTP ${res.status}`);
      const json = await res.json() as { results?: { bindings?: Binding[] } };
      return parseWikidata(json.results?.bindings ?? []);
    });
    return { records, state: 'ok', datasetUpdatedAt: null };
  } catch {
    return { records: [], state: 'error', datasetUpdatedAt: null };
  }
}
