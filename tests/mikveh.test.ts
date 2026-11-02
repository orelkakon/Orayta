import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitAddress, mikvehGeoKey, cityGeoKey, normCity, GeoEntry } from '@/lib/mikveh/dataset';
import { parseGov, yesNo, govAccessibility, osmAudience, osmFee, parseOsmMikvaot, MikvehRecord } from '@/lib/mikveh/parse';
import { mergeMikvaot, isSameMikveh, isIsraelSummer } from '@/lib/mikveh/merge';
import { filterMikvaot, mikvehTone, parseFilter } from '@/lib/mikveh/filter';
import { clampMikvehRadius } from '@/lib/mikveh/radius';

test('splitAddress strips "רח\'" and splits the house number', () => {
  assert.deepEqual(splitAddress("רח' הבנים 43"), { street: 'הבנים', number: '43' });
  assert.deepEqual(splitAddress('משעול הרקפת 8'), { street: 'משעול הרקפת', number: '8' });
  assert.deepEqual(splitAddress("שד' ירושלים 12א"), { street: 'שדרות ירושלים', number: '12א' });
  assert.deepEqual(splitAddress('דרך הארץ '), { street: 'דרך הארץ', number: null });
  assert.deepEqual(splitAddress(null), { street: null, number: null });
});

test('geo keys normalise the town spelling', () => {
  assert.equal(normCity('תל אביב - יפו'), 'תל אביב-יפו');
  assert.equal(mikvehGeoKey({ mikveCity: 'תל אביב - יפו', MikveAddress: ' התחיה 4 ' }), 'תל אביב-יפו|התחיה 4');
  assert.equal(cityGeoKey({ mikveCity: null, counciName: 'שומרון' }), 'שומרון|');
});

test('yes/no and accessibility read only what is published', () => {
  assert.equal(yesNo('כן'), true);
  assert.equal(yesNo('לא'), false);
  assert.equal(yesNo('לפעמים'), null);
  assert.equal(yesNo(null), null);
  assert.equal(govAccessibility('מלאה'), 'full');
  assert.equal(govAccessibility('כן'), 'partial');
  assert.equal(govAccessibility('ללא'), 'none');
  assert.equal(govAccessibility(null), null);
});

const GEO: Record<string, GeoEntry> = {
  'אופקים|משעול הרקפת 8': [31.31, 34.62, 'e'],
  'אבני חפץ|': [32.28, 35.1, 'c'],
};

test('parseGov places rows by address, falls back to the town, skips unplaceable ones', () => {
  const rows = [
    { _id: 1, mikveName: 'מקווה א', mikveCity: 'אופקים', MikveAddress: 'משעול הרקפת 8', mikveForWomenYesNo: 'כן', mikveForMenYesNo: 'לא',
      activityHoursSummer: '21.00-00.00', activityHoursWinter: '20.00-23.00', activityHoursShabat: 'None', accessability: 'חלקית', mikvePhone: '054-1' },
    { _id: 2, mikveName: 'אבני חפץ', mikveCity: 'אבני חפץ', MikveAddress: 'אבני חפץ ' },
    { _id: 3, mikveName: 'לא ידוע', mikveCity: 'עיר אחרת', MikveAddress: 'רחוב 1' },
  ];
  const out = parseGov(rows, GEO, '2026-08-12T09:01:40.000Z');
  assert.equal(out.length, 2);
  assert.equal(out[0].precision, 'exact');
  assert.equal(out[0].women, true);
  assert.equal(out[0].men, false);
  assert.deepEqual(out[0].hours, { summer: '21.00-00.00', winter: '20.00-23.00', shabbat: null, general: null, source: 'gov' });
  assert.equal(out[0].accessibility, 'partial');
  assert.equal(out[1].precision, 'city');
  assert.equal(out[1].address, null, 'an address that only repeats the town is dropped');
  assert.equal(out[1].hours, null);
});

test('OSM audience, fee and records', () => {
  assert.deepEqual(osmAudience({ female: 'only' }), { women: true, men: false });
  assert.deepEqual(osmAudience({ gender: 'male' }), { women: false, men: true });
  assert.deepEqual(osmAudience({ name: 'מקווה נשים' }), { women: true, men: null });
  assert.deepEqual(osmFee({ fee: 'yes', charge: '30 ₪' }), { paid: true, text: '30 ₪' });
  assert.deepEqual(osmFee({ fee: 'no' }), { paid: false, text: null });
  assert.equal(osmFee({}), null);
  const [r] = parseOsmMikvaot([{ type: 'node', id: 5, lat: 31.7, lon: 35.2, timestamp: '2024-01-01T00:00:00Z', tags: { name: 'מקווה', opening_hours: 'Mo-Th 19:00-22:00', wheelchair: 'limited' } }]);
  assert.equal(r.id, 'osm/node/5');
  assert.equal(r.hours?.general, 'Mo-Th 19:00-22:00');
  assert.equal(r.accessibility, 'partial');
});

const rec = (over: Partial<MikvehRecord>): MikvehRecord => ({
  id: 'x', name: null, lat: 31.78, lng: 35.21, precision: 'exact', address: null, city: null,
  women: null, men: null, vessels: null, hours: null, phone: null, accessibility: null,
  brideRoom: null, shelter: null, onDuty: null, fee: null, website: null, sources: [], ...over,
});

test('merge: close pins merge (OSM pin + gov details), town-centre pins never merge', () => {
  const gov = rec({ id: 'gov/1', name: 'מקווה הרב קוק', precision: 'street', women: true, phone: '02-1', sources: [{ source: 'gov', updatedAt: null, url: null }] });
  const osm = rec({ id: 'osm/node/1', name: 'מקווה טהרה הרב קוק', lat: 31.7815, fee: { paid: true, text: null }, sources: [{ source: 'osm', updatedAt: null, url: null }] });
  assert.equal(isSameMikveh(gov, osm), true);
  assert.equal(isSameMikveh({ ...gov, precision: 'city' }, osm), false);
  const out = mergeMikvaot([gov], [osm], { lat: 31.78, lng: 35.21 }, 5000);
  assert.equal(out.length, 1);
  assert.equal(out[0].precision, 'exact');
  assert.equal(out[0].lat, 31.7815);
  assert.equal(out[0].phone, '02-1');
  assert.deepEqual(out[0].fee, { paid: true, text: null });
  assert.equal(out[0].sources.length, 2);
});

test('merge: opposite audiences stay apart; radius + distance order', () => {
  const women = rec({ id: 'gov/1', women: true, men: false });
  const men = rec({ id: 'osm/node/2', women: false, men: true, lat: 31.7801 });
  const far = rec({ id: 'gov/9', lat: 32.5 });
  const out = mergeMikvaot([women, far], [men], { lat: 31.7802, lng: 35.21 }, 5000);
  assert.deepEqual(out.map(m => m.id), ['osm/node/2', 'gov/1']);
});

test('filter + tone + stored filter', () => {
  const list = [rec({ id: 'a', women: true }), rec({ id: 'b', men: true, accessibility: 'full' }), rec({ id: 'c', vessels: true })]
    .map(m => ({ ...m, distanceM: 0 }));
  assert.deepEqual(filterMikvaot(list, { audience: 'men', accessible: false }).map(m => m.id), ['b']);
  assert.deepEqual(filterMikvaot(list, { audience: 'all', accessible: true }).map(m => m.id), ['b']);
  assert.equal(mikvehTone(list[0]), 'women');
  assert.equal(mikvehTone({ ...list[0], men: true }), 'both');
  assert.deepEqual(parseFilter('{"audience":"vessels","accessible":true}'), { audience: 'vessels', accessible: true });
  assert.deepEqual(parseFilter('garbage'), { audience: 'all', accessible: false });
  assert.equal(clampMikvehRadius(999), 5000);
});

test('Israel summer time decides the season', () => {
  assert.equal(isIsraelSummer(new Date('2026-07-01T12:00:00Z')), true);
  assert.equal(isIsraelSummer(new Date('2026-12-01T12:00:00Z')), false);
});
