import { haversineM } from '@/lib/minyan/geo';
import TOWNS from './data/towns.json';

/** Beyond this from every city/town the search is stored without an area. */
const MAX_AREA_M = 20_000;

type Town = [name: string, lat: number, lng: number];
const LIST = TOWNS as Town[];

/**
 * The nearest city or town (OSM place=city|town, scripts/osm-towns.py) — the
 * only trace of a search's location that is ever stored.
 */
export function nearestArea(lat: number, lng: number, towns: Town[] = LIST): string | null {
  let best: string | null = null;
  let bestM = MAX_AREA_M;
  for (const [name, tLat, tLng] of towns) {
    // Cheap box test first: 0.2° is more than 20 km in Israel.
    if (Math.abs(tLat - lat) > 0.2 || Math.abs(tLng - lng) > 0.25) continue;
    const d = haversineM(lat, lng, tLat, tLng);
    if (d < bestM) { bestM = d; best = name.replace(/[‎‏]/g, ''); }
  }
  return best;
}
