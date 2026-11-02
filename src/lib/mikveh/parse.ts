/**
 * Source rows → Mikveh records (pure, tested). Values are passed through as
 * published; only yes/no fields are read as booleans, anything else = null.
 */
import type { Accessibility, Mikveh, MikvehPrecision } from '@/types/mikveh';
import type { SnapshotElement } from '@/lib/minyan/sources/osmSnapshot';
import { safeUrl, latestDate } from '@/lib/minyan/sources/osm';
import { GovMikvehRow, GeoEntry, GeoPrecision, MIKVEH_DATASET_URL, clean, cityGeoKey, mikvehGeoKey, normCity } from './dataset';

/** A Mikveh before distance is known. */
export type MikvehRecord = Omit<Mikveh, 'distanceM'>;

const PRECISION: Record<GeoPrecision, MikvehPrecision> = { e: 'exact', s: 'street', a: 'area', c: 'city' };

export function yesNo(v: string | null | undefined): boolean | null {
  const s = clean(v);
  if (!s) return null;
  if (/^(כן|יש|yes|true)$/i.test(s)) return true;
  if (/^(לא|אין|no|false)$/i.test(s)) return false;
  return null;
}

export function govAccessibility(v: string | null | undefined): Accessibility | null {
  const s = clean(v);
  if (s === 'מלאה') return 'full';
  if (s === 'חלקית' || s === 'כן') return 'partial'; // "כן" without a level — don't claim a lift
  if (s === 'ללא' || s === 'לא' || s === 'אין') return 'none';
  return null;
}

/** "אין כרגע" / "None" etc. are kept verbatim; only empty values become null. */
const hoursText = (v: string | null | undefined) => {
  const s = clean(v);
  return s && s !== 'None' ? s : null;
};

export function parseGov(rows: GovMikvehRow[], geo: Record<string, GeoEntry>, updatedAt: string | null): MikvehRecord[] {
  return rows.flatMap(row => {
    const pos = geo[mikvehGeoKey(row)] ?? geo[cityGeoKey(row)];
    if (!pos) return [];
    const city = clean(row.mikveCity) ?? clean(row.counciName);
    const summer = hoursText(row.activityHoursSummer), winter = hoursText(row.activityHoursWinter);
    const shabbat = hoursText(row.activityHoursShabat);
    const address = clean(row.MikveAddress);
    return [{
      id: `gov/${row._id ?? mikvehGeoKey(row)}`,
      name: clean(row.mikveName),
      lat: pos[0], lng: pos[1],
      precision: PRECISION[pos[2]],
      // Some rows repeat the town as the address — nothing to add then.
      address: address && city && normCity(address) === normCity(city) ? null : address,
      city,
      women: yesNo(row.mikveForWomenYesNo),
      men: yesNo(row.mikveForMenYesNo),
      vessels: yesNo(row.mikveForDishesYesNo),
      hours: summer || winter || shabbat ? { summer, winter, shabbat, general: null, source: 'gov' } : null,
      phone: clean(row.mikvePhone),
      accessibility: govAccessibility(row.accessability),
      brideRoom: yesNo(row.brideRoomYesNo),
      shelter: yesNo(row.armorYesNo),
      onDuty: yesNo(row.onDutyYesNo),
      fee: null,
      website: null,
      sources: [{ source: 'gov', updatedAt, url: MIKVEH_DATASET_URL }],
    }];
  });
}

/** OSM gender tags → who the mikveh serves (null when not tagged). */
export function osmAudience(t: Record<string, string>): { women: boolean | null; men: boolean | null } {
  const g = (t.gender ?? t['mikveh:type'] ?? t.mikveh ?? '').toLowerCase();
  if (/^(female|women)/.test(g) || t.female === 'only') return { women: true, men: false };
  if (/^(male|men)/.test(g) || t.male === 'only') return { women: false, men: true };
  const women = t.female === 'yes' ? true : t.female === 'no' ? false : null;
  const men = t.male === 'yes' ? true : t.male === 'no' ? false : null;
  const name = t['name:he'] ?? t.name ?? '';
  return {
    women: women ?? (/נשים/.test(name) ? true : null),
    men: men ?? (/גברים/.test(name) ? true : null),
  };
}

export function osmFee(t: Record<string, string>): MikvehRecord['fee'] {
  const charge = clean(t.charge);
  const paid = t.fee === 'yes' ? true : t.fee === 'no' ? false : null;
  return charge || paid !== null ? { paid: charge ? true : paid, text: charge } : null;
}

const OSM_ACCESS: Record<string, Accessibility> = { yes: 'full', limited: 'partial', no: 'none' };

export function parseOsmMikvaot(elements: SnapshotElement[]): MikvehRecord[] {
  return elements.map(el => {
    const t = el.tags;
    const key = `${el.type}/${el.id}`;
    const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
    const { women, men } = osmAudience(t);
    return {
      id: `osm/${key}`,
      name: clean(t['name:he'] ?? t.name),
      lat: el.lat, lng: el.lon,
      precision: 'exact' as const,
      address: clean(t['addr:full'] ?? street),
      city: clean(t['addr:city']),
      women, men, vessels: null,
      hours: t.opening_hours ? { summer: null, winter: null, shabbat: null, general: t.opening_hours, source: 'osm' as const } : null,
      phone: clean(t.phone ?? t['contact:phone']),
      accessibility: OSM_ACCESS[t.wheelchair] ?? null,
      brideRoom: null, shelter: null, onDuty: null,
      fee: osmFee(t),
      website: safeUrl(t.website ?? t['contact:website']),
      sources: [{ source: 'osm' as const, updatedAt: latestDate(el.timestamp, t.check_date), url: `https://www.openstreetmap.org/${key}` }],
    };
  });
}
