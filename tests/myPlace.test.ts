import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candlesMinutes, inIsrael, nearestTown, parsePlace, placeFromGps, searchTowns } from '../src/lib/myPlace';
import { SHABBAT_CITIES, placeCity, shabbatStatus } from '../src/lib/shabbat';

const at = (iso: string) => new Date(`${iso}+02:00`);

test('a GPS fix is named after the nearest town, abroad it has no name and keeps the device zone', () => {
  const bs = placeFromGps(31.75, 34.99, 'Asia/Jerusalem');
  assert.equal(bs.name, 'בית שמש');
  assert.equal(bs.tz, 'Asia/Jerusalem');
  assert.ok(inIsrael(bs));
  const ny = placeFromGps(40.71, -74.0, 'America/New_York');
  assert.equal(ny.name, null);
  assert.equal(ny.tz, 'America/New_York');
  assert.ok(!inIsrael(ny));
  assert.equal(nearestTown(31.7788, 35.2258)?.[0], 'ירושלים');
});

test('candle-lighting customs follow the town', () => {
  assert.equal(candlesMinutes('ירושלים'), 40);
  assert.equal(candlesMinutes('חיפה'), 30);
  assert.equal(candlesMinutes('זכרון יעקב'), 30);
  assert.equal(candlesMinutes('בני ברק'), 20);
  assert.equal(candlesMinutes(null), 20);
});

test('town search: prefix matches first, dashes and spaces ignored', () => {
  assert.equal(searchTowns('בית שמ')[0][0], 'בית שמש');
  assert.ok(searchTowns('שמש').some(t => t[0] === 'בית שמש'));
  assert.ok(searchTowns('תל אביב יפו').some(t => t[0] === 'תל אביב–יפו'));
  assert.equal(searchTowns('zzz').length, 0);
  assert.ok(searchTowns('').length > 0);
});

test('stored places are validated', () => {
  assert.equal(parsePlace(null), null);
  assert.equal(parsePlace('nope'), null);
  assert.equal(parsePlace('{"lat":"1","lng":2}'), null);
  const p = parsePlace('{"lat":31.7,"lng":35.2,"name":"ירושלים","via":"city"}');
  assert.equal(p?.tz, 'Asia/Jerusalem');
  assert.equal(p?.via, 'city');
});

test('the hero follows the visitor\'s place, with Jerusalem beside it', () => {
  const haifa = placeCity({ lat: 32.8191, lng: 34.9984, name: 'חיפה' });
  const s = shabbatStatus(at('2026-11-13T10:00:00'), haifa)!;
  assert.deepEqual(s.heroCities.map(c => c.id), ['mine', 'jerusalem']);
  assert.equal(s.heroCities[0].name, 'חיפה');
  // Haifa lights 30 minutes before its sunset — later than Jerusalem's 40.
  assert.ok(s.candles.getTime() > s.heroCities[1].candles.getTime());
  assert.equal(s.cities.length, SHABBAT_CITIES.length);
  // Without a place (or in Jerusalem): Jerusalem + Tel Aviv, as before.
  assert.deepEqual(shabbatStatus(at('2026-11-13T10:00:00'))!.heroCities.map(c => c.id), ['jerusalem', 'telaviv']);
  const jlm = placeCity({ lat: 31.7788, lng: 35.2258, name: 'ירושלים' });
  assert.deepEqual(shabbatStatus(at('2026-11-13T10:00:00'), jlm)!.heroCities.map(c => c.id), ['jerusalem', 'telaviv']);
});
