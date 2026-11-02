/**
 * Geocodes the official mikvaot dataset (addresses only) into
 * src/lib/mikveh/data/mikveh-geo.json — run again when the dataset changes;
 * only addresses not in the table yet are looked up (resumable).
 *
 *   npx tsx scripts/mikveh-geocode.ts [--retry-addresses]
 *
 * Nominatim usage policy: ≤1 request/second, identifying User-Agent, results
 * cached (this file is the cache). Every hit must lie in the dataset's town,
 * otherwise the next, coarser step is tried: address → street → named place
 * (mikveh / neighbourhood name) → town centre.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import {
  MIKVEH_RESOURCE_ID, GovMikvehRow, GeoEntry, GeoPrecision,
  clean, normCity, mikvehGeoKey, cityGeoKey, splitAddress,
} from '../src/lib/mikveh/dataset';

const OUT = join(__dirname, '..', 'src', 'lib', 'mikveh', 'data', 'mikveh-geo.json');
const UA = 'Orayta/1.0 (+https://orayta-eight.vercel.app)';
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

interface NomItem {
  lat: string; lon: string; addresstype?: string;
  address?: Record<string, string>;
}

let last = 0;
async function nominatim(params: Record<string, string>): Promise<NomItem[]> {
  const wait = last + 1100 - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const qs = new URLSearchParams({ format: 'jsonv2', limit: '3', addressdetails: '1', countrycodes: 'il,ps', 'accept-language': 'he', ...params });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?${qs}`, { headers: { 'User-Agent': UA } });
      if (res.ok) return await res.json() as NomItem[];
      if (res.status === 429) await sleep(30_000);
    } catch { await sleep(5000); }
  }
  return [];
}

const flat = (s: string) => s.replace(/[\s\-–"'״׳()]/g, '');
const TOWN_FIELDS = ['city', 'town', 'village', 'municipality', 'suburb', 'hamlet', 'isolated_dwelling', 'neighbourhood', 'quarter', 'county'];

/** The hit lies in the expected town (names compared without spaces/punctuation). */
function inTown(item: NomItem, town: string): boolean {
  const t = flat(town);
  return TOWN_FIELDS.some(f => {
    const v = item.address?.[f];
    return v ? flat(v).includes(t) || t.includes(flat(v)) : false;
  });
}

async function first(params: Record<string, string>, town: string, accept?: (i: NomItem) => boolean): Promise<NomItem | null> {
  const items = await nominatim(params);
  return items.find(i => inTown(i, town) && (!accept || accept(i))) ?? null;
}

const entry = (i: NomItem, p: GeoPrecision): GeoEntry => [Number(Number(i.lat).toFixed(6)), Number(Number(i.lon).toFixed(6)), p];
const isPoint = (i: NomItem) => ['building', 'house', 'place', 'amenity', 'office'].includes(i.addresstype ?? '');

/**
 * Spellings to try for a row's town: as published, without a leading
 * "מושב"/"מקוה"/parenthetical, "תל אביב-יפו" → "תל אביב", and the religious
 * council's name (some rows carry a truncated town, e.g. "זכר").
 */
function townVariants(row: GovMikvehRow): string[] {
  const out: string[] = [];
  for (const raw of [row.mikveCity, row.counciName]) {
    const t = clean(raw);
    if (!t) continue;
    const base = normCity(t.replace(/\([^)]*\)/g, ' ').replace(/^(?:מקו(?:ו)?ה|מושב|קיבוץ|ישוב|יישוב)\s+/, '').trim());
    out.push(normCity(t), base, base.replace(/-יפו$/, ''));
  }
  return Array.from(new Set(out.filter(v => v.length >= 2)));
}

async function geocodeRow(row: GovMikvehRow, town: string): Promise<GeoEntry | null> {
  const { street, number } = splitAddress(clean(row.MikveAddress));
  if (street && number) {
    const hit = await first({ street: `${number} ${street}`, city: town }, town);
    if (hit) return entry(hit, isPoint(hit) ? 'e' : 's');
  }
  if (street) {
    const hit = await first({ street, city: town }, town);
    if (hit) return entry(hit, 's');
  }
  const name = clean(row.mikveName)?.replace(/^מקו(ו)?ה\s*/, '');
  if (name && name !== town && name.length > 2) {
    const hit = await first({ q: `${name}, ${town}` }, town);
    if (hit) return entry(hit, 'a');
  }
  return null;
}

async function main() {
  const res = await fetch(`https://data.gov.il/api/3/action/datastore_search?resource_id=${MIKVEH_RESOURCE_ID}&limit=2000`, { headers: { 'User-Agent': UA } });
  const rows = ((await res.json()) as { result: { records: GovMikvehRow[] } }).result.records;
  const table: Record<string, GeoEntry> = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
  const save = () => writeFileSync(OUT, JSON.stringify(table, Object.keys(table).sort(), 0));
  // Rows already placed by town centre aren't re-tried address by address unless asked.
  const retry = process.argv.includes('--retry-addresses');
  let done = 0;
  for (const row of rows) {
    const key = mikvehGeoKey(row), cKey = cityGeoKey(row);
    if (key in table || (cKey in table && !retry)) { done++; continue; }
    for (const town of townVariants(row)) {
      const hit = await geocodeRow(row, town);
      if (hit) { table[key] = hit; break; }
    }
    if (!(key in table) && !(cKey in table)) {
      for (const town of townVariants(row)) {
        const hit = await first({ city: town }, town) ?? await first({ q: town }, town);
        if (hit) { table[cKey] = entry(hit, 'c'); break; }
      }
    }
    if (++done % 20 === 0) { save(); console.log(`${done}/${rows.length}`); }
  }
  save();
  const placed = rows.filter(r => mikvehGeoKey(r) in table).length;
  const city = rows.filter(r => !(mikvehGeoKey(r) in table) && cityGeoKey(r) in table).length;
  console.log(`done: ${placed} by address, ${city} by town centre, ${rows.length - placed - city} unplaced`);
}

main().catch(err => { console.error(err); process.exit(1); });
