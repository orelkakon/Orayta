import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildOverpassQuery, parseOverpass, derivedFromTag, latestDate } from '@/lib/minyan/sources/osm';
import { parseWikidata } from '@/lib/minyan/sources/wikidata';
import { parseBeersheva } from '@/lib/minyan/sources/municipal';
import { parseTelAviv, parseTlvDate } from '@/lib/minyan/sources/telaviv';

test('overpass query asks for metadata (edit dates) around the point', () => {
  const q = buildOverpassQuery(31.78, 35.21, 2000);
  assert.match(q, /"religion"="jewish"/);
  assert.match(q, /around:2000,31\.78000,35\.21000/);
  assert.match(q, /out center tags meta/);
});

test('osm parsing: dates, centers, provenance, unsafe links, schedules', () => {
  const out = parseOverpass([
    { type: 'node', id: 1, lat: 31.7, lon: 35.2, timestamp: '2020-01-01T00:00:00Z',
      tags: { 'name:he': 'בית כנסת', check_date: '2025-06-01', website: 'javascript:alert(1)', service_times: 'Sa 08:00' } },
    { type: 'node', id: 1, lat: 31.7, lon: 35.2, tags: {} },
    { type: 'way', id: 2, center: { lat: 31.8, lon: 35.3 }, tags: { building: 'synagogue', source: 'data.gov.il באר שבע' } },
    { type: 'way', id: 3, center: { lat: 31.8, lon: 35.3 }, tags: { building: 'synagogue', religion: 'christian' } },
  ]);
  assert.equal(out.length, 2);
  assert.equal(out[0].updatedAt, '2025-06-01T00:00:00.000Z'); // check_date is newer than the edit
  assert.equal(out[0].website, null);
  assert.equal(out[0].url, 'https://www.openstreetmap.org/node/1');
  assert.equal(out[0].schedule?.general, 'Sa 08:00');
  assert.equal(out[1].derivedFrom, 'muni-beersheva');
  assert.equal(out[1].name, null);
});

test('provenance tags and date helper', () => {
  assert.equal(derivedFromTag('Wikidata'), 'wikidata');
  assert.equal(derivedFromTag('survey'), null);
  assert.equal(latestDate(undefined, 'nope'), null);
});

test('wikidata parsing: point order is lng lat; QID-only labels dropped; duplicates collapsed', () => {
  const out = parseWikidata([
    { item: { value: 'http://www.wikidata.org/entity/Q123' }, itemLabel: { value: 'בית הכנסת הגדול' }, coord: { value: 'Point(35.21662 31.77579)' }, mod: { value: '2026-09-27T10:00:00Z' } },
    { item: { value: 'http://www.wikidata.org/entity/Q123' }, itemLabel: { value: 'dup' }, coord: { value: 'Point(35.2 31.7)' } },
    { item: { value: 'http://www.wikidata.org/entity/Q9' }, itemLabel: { value: 'Q9' }, coord: { value: 'Point(35 31)' } },
  ]);
  assert.equal(out.length, 2);
  assert.deepEqual([out[0].lat, out[0].lng], [31.77579, 35.21662]);
  assert.equal(out[0].updatedAt, '2026-09-27T10:00:00Z');
  assert.equal(out[1].name, null);
});

test('beer sheva parsing uses the dataset date and skips rows without coordinates', () => {
  const out = parseBeersheva([
    { Id: 1, name: 'בית כנסת רמות', OtherName: '', street: 'הר תבור', HouseNumbe: 6, lat: 31.2767, lon: 34.8112 },
    { Id: 2, name: 'no coords' },
    { Id: 3, name: '', OtherName: 'הכוכב', lat: 31.25, lon: 34.79 },
  ], '2026-10-05T15:12:13.000Z');
  assert.equal(out.length, 2);
  assert.equal(out[1].name, 'הכוכב');
  assert.equal(out[0].address, 'הר תבור 6, באר שבע');
  assert.equal(out[0].altName, null);
  assert.equal(out[0].updatedAt, '2026-10-05T15:12:13.000Z');
});

test('tel aviv parsing keeps schedules as published text with the import date', () => {
  assert.equal(parseTlvDate('13/06/2025 01:50:34'), '2025-06-13T00:00:00.000Z');
  const [r] = parseTelAviv([{
    attributes: { oid_cneset: 1, name_bet_cneset: 'אבשלום ', ketovet: 'בוגרשוב  63', nosah: 'עדות המזרח',
      tel_gabay: '054-0000000', name_gabay: 'א', daily_shaharit: 'שחרית-7:30', sat_shaharit: '', date_import: '13/06/2025 01:50:34' },
    geometry: { x: 34.7729, y: 32.0754 },
  }]);
  assert.equal(r.name, 'אבשלום');
  assert.equal(r.address, 'בוגרשוב 63, תל אביב-יפו');
  assert.deepEqual(r.schedule, { weekday: 'שחרית-7:30', shabbat: null, general: null, updatedAt: '2025-06-13T00:00:00.000Z' });
  assert.deepEqual(r.gabbai, { name: 'א', phone: '054-0000000' });
});
