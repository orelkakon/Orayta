import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversineM, telHref, nextPrayer, clampRadius, dayTypeFor, wazeUrl } from '@/lib/minyan/geo';
import { buildOverpassQuery, parseOverpass } from '@/lib/minyan/osm';
import type { MinyanTime } from '@/types/minyan';

test('haversine: 0.0062° of longitude at Jerusalem latitude is ~590m', () => {
  const d = haversineM(31.7767, 35.2283, 31.7767, 35.2345);
  assert.ok(d > 550 && d < 650, String(d));
});

test('tel links only for dialable numbers', () => {
  assert.equal(telHref('02-123 4567'), 'tel:021234567');
  assert.equal(telHref('+972 2 123 4567'), 'tel:+97221234567');
  assert.equal(telHref('12'), null);
});

test('radius is clamped to the offered options', () => {
  assert.equal(clampRadius(5000), 5000);
  assert.equal(clampRadius(999999), 2000);
  assert.equal(clampRadius(NaN), 2000);
});

test('waze deep link', () => {
  assert.equal(wazeUrl(31.5, 35.1), 'https://waze.com/ul?ll=31.5,35.1&navigate=yes');
});

const t = (over: Partial<MinyanTime>): MinyanTime => ({
  service: 'mincha', dayType: 'weekday', time: '13:30', level: 'medium', verified: false,
  reporters: 1, disputes: 0, lastConfirmedAt: new Date().toISOString(), ...over,
});

test('next prayer: soonest upcoming, ignores disputed and other day types', () => {
  const now = new Date(2026, 9, 12, 13, 0); // Monday 13:00 local
  assert.equal(dayTypeFor(now), 'weekday');
  const next = nextPrayer([
    t({ time: '12:45' }),
    t({ time: '13:10', level: 'disputed' }),
    t({ time: '13:20', dayType: 'shabbat' }),
    t({ time: '13:40' }),
    t({ service: 'maariv', time: '18:00' }),
  ], now);
  assert.deepEqual(next, { service: 'mincha', time: '13:40', minutesUntil: 40 });
  assert.equal(nextPrayer([t({ time: '20:00', service: 'maariv' })], now), null); // beyond 3h horizon
});

test('overpass query targets Jewish places of worship around the point', () => {
  const q = buildOverpassQuery(31.78, 35.21, 2000);
  assert.match(q, /"religion"="jewish"/);
  assert.match(q, /around:2000,31\.78000,35\.21000/);
});

test('overpass parsing: ways use center, dupes and other religions dropped, unsafe links dropped', () => {
  const out = parseOverpass([
    { type: 'node', id: 1, lat: 31.7, lon: 35.2, tags: { name: 'Beit Knesset', 'name:he': 'בית כנסת', 'addr:street': 'הרב קוק', 'addr:housenumber': '5', 'addr:city': 'ירושלים', phone: '02-5555555', website: 'javascript:alert(1)' } },
    { type: 'node', id: 1, lat: 31.7, lon: 35.2, tags: {} },
    { type: 'way', id: 2, center: { lat: 31.8, lon: 35.3 }, tags: { building: 'synagogue', website: 'https://example.org' } },
    { type: 'way', id: 3, center: { lat: 31.8, lon: 35.3 }, tags: { building: 'synagogue', religion: 'christian' } },
    { type: 'relation', id: 4, tags: {} },
  ]);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0], {
    id: 'node/1', lat: 31.7, lng: 35.2, name: 'בית כנסת', address: 'הרב קוק 5, ירושלים',
    phone: '02-5555555', website: null, serviceTimes: null,
  });
  assert.equal(out[1].id, 'way/2');
  assert.equal(out[1].name, null);
  assert.equal(out[1].website, 'https://example.org');
});
