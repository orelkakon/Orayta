/**
 * Tel Aviv-Yafo municipality "בתי כנסת" open dataset (opendata.tel-aviv.gov.il,
 * dataset 96) through its documented ArcGIS REST API. 484 synagogues with
 * nusach, phones and weekday/Shabbat prayer times (free text).
 *
 * DISABLED BY DEFAULT. The portal's terms of use restrict re-publishing its
 * content on other websites and automated access without the municipality's
 * prior written consent. Enable only after receiving that consent:
 *   TLV_OPENDATA_APPROVED=1
 */
import { haversineM } from '../geo';
import { blankRecord, PlaceRecord, SourceResult, USER_AGENT } from './types';
import { ttlCache, snap, SNAP_SLACK_M } from './cache';

export const TLV_LAYER = 'https://gisn.tel-aviv.gov.il/arcgis/rest/services/IView2/MapServer/568';
export const TLV_DATASET_URL = 'https://opendata.tel-aviv.gov.il/he/dataItem/96/Info';
const TLV_CENTER = { lat: 32.0853, lng: 34.7818 };
const TLV_CITY_RADIUS_M = 9000;

export const tlvEnabled = () => process.env.TLV_OPENDATA_APPROVED === '1';

interface TlvAttrs {
  oid_cneset?: number; name_bet_cneset?: string; ketovet?: string; nosah?: string;
  tel_bet_cneset?: string; name_gabay?: string; tel_gabay?: string;
  daily_shaharit?: string; sat_shaharit?: string; date_import?: string;
}
interface TlvFeature { attributes: TlvAttrs; geometry?: { x: number; y: number } }

const clean = (v: string | undefined) => (v && v.trim() ? v.trim().replace(/\s+/g, ' ') : null);

/** "13/06/2025 01:50:34" → ISO, or null. */
export function parseTlvDate(v: string | undefined): string | null {
  const m = v ? /^(\d{2})\/(\d{2})\/(\d{4})/.exec(v) : null;
  return m ? new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1]))).toISOString() : null;
}

export function parseTelAviv(features: TlvFeature[]): PlaceRecord[] {
  return features.flatMap(f => {
    const a = f.attributes;
    if (!f.geometry || !Number.isFinite(f.geometry.x) || !Number.isFinite(f.geometry.y)) return [];
    const r = blankRecord('muni-telaviv', String(a.oid_cneset ?? `${f.geometry.y},${f.geometry.x}`), f.geometry.y, f.geometry.x);
    r.name = clean(a.name_bet_cneset);
    r.address = clean(a.ketovet) ? `${clean(a.ketovet)}, תל אביב-יפו` : null;
    r.nusach = clean(a.nosah);
    r.phone = clean(a.tel_bet_cneset);
    const gName = clean(a.name_gabay), gPhone = clean(a.tel_gabay);
    r.gabbai = gName || gPhone ? { name: gName, phone: gPhone } : null;
    r.updatedAt = parseTlvDate(a.date_import);
    r.url = TLV_DATASET_URL;
    const weekday = clean(a.daily_shaharit), shabbat = clean(a.sat_shaharit);
    r.schedule = weekday || shabbat ? { weekday, shabbat, general: null, updatedAt: r.updatedAt } : null;
    return [r];
  });
}

const cache = ttlCache<PlaceRecord[]>(24 * 60 * 60 * 1000);

export async function telAvivSource(lat: number, lng: number, radiusM: number): Promise<SourceResult> {
  if (!tlvEnabled() || haversineM(lat, lng, TLV_CENTER.lat, TLV_CENTER.lng) > TLV_CITY_RADIUS_M + radiusM) {
    return { records: [], state: 'out-of-area', datasetUpdatedAt: null };
  }
  const cLat = snap(lat), cLng = snap(lng);
  try {
    const records = await cache(`${cLat.toFixed(2)},${cLng.toFixed(2)},${radiusM}`, async () => {
      const params = new URLSearchParams({
        geometry: `${cLng},${cLat}`, geometryType: 'esriGeometryPoint', inSR: '4326',
        distance: String(radiusM + SNAP_SLACK_M), units: 'esriSRUnit_Meter',
        spatialRel: 'esriSpatialRelIntersects', outFields: '*', returnGeometry: 'true', outSR: '4326', f: 'json',
      });
      const res = await fetch(`${TLV_LAYER}/query?${params}`, {
        headers: { 'User-Agent': USER_AGENT }, cache: 'no-store', signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`tel-aviv gis HTTP ${res.status}`);
      const json = await res.json() as { features?: TlvFeature[]; error?: unknown };
      if (json.error) throw new Error('tel-aviv gis error');
      return parseTelAviv(json.features ?? []);
    });
    return { records, state: 'ok', datasetUpdatedAt: null };
  } catch {
    return { records: [], state: 'error', datasetUpdatedAt: null };
  }
}
