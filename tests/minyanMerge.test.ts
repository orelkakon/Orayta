import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeRecords, nameTokens, isSamePlace } from '@/lib/minyan/merge';
import { blankRecord, PlaceRecord } from '@/lib/minyan/sources/types';
import type { ProviderId } from '@/types/minyan';

const NOW = new Date('2026-10-11T12:00:00Z');
const ORIGIN = { lat: 31.25, lng: 34.79 };
const rec = (provider: ProviderId, key: string, lat: number, lng: number, over: Partial<PlaceRecord> = {}): PlaceRecord =>
  ({ ...blankRecord(provider, key, lat, lng), updatedAt: '2026-09-01T00:00:00Z', ...over });

test('generic words are ignored when comparing names', () => {
  assert.deepEqual(Array.from(nameTokens('בית הכנסת "עץ חיים"')), ['עץ', 'חיים']);
});

test('same place: very close with compatible names, or close with matching names', () => {
  const a = rec('osm', '1', 31.25, 34.79, { name: 'עץ חיים' });
  assert.equal(isSamePlace(a, rec('muni-beersheva', 'x', 31.25010, 34.79, { name: 'בית כנסת עץ חיים' })), true); // ~11m
  assert.equal(isSamePlace(a, rec('muni-beersheva', 'x', 31.25050, 34.79, { name: 'עץ חיים' })), true);         // ~55m
  assert.equal(isSamePlace(a, rec('muni-beersheva', 'x', 31.25010, 34.79, { name: 'אוהל משה' })), false);
  assert.equal(isSamePlace(a, rec('muni-beersheva', 'x', 31.25050, 34.79, { name: null })), false);
  // "מקלט" (shelter) is descriptive, so it doesn't contradict a real name nearby…
  assert.equal(isSamePlace(rec('osm', '2', 31.25, 34.79, { name: 'קול יהודה' }), rec('muni-beersheva', 'y', 31.25007, 34.79, { name: 'מקלט' })), true);
  // …but two different real names in one building stay two congregations.
  assert.equal(isSamePlace(rec('osm', '3', 31.25, 34.79, { name: 'שושן' }), rec('muni-beersheva', 'z', 31.25003, 34.79, { name: 'בית אברהם' })), false);
});

test('corroborated place → high; unmatched municipal record kept as its own medium entry', () => {
  const out = mergeRecords([
    rec('osm', 'node/1', 31.2501, 34.7901, { name: 'עץ חיים', updatedAt: '2025-01-01T00:00:00Z' }),
    rec('muni-beersheva', '7', 31.2502, 34.7901, { name: 'בית כנסת עץ חיים', address: 'הר תבור 6, באר שבע' }),
    rec('muni-beersheva', '8', 31.2550, 34.7950, { name: 'אוהל משה' }),
  ], ORIGIN, 2000, NOW);
  assert.equal(out.length, 2);
  assert.equal(out[0].name, 'עץ חיים');                    // OSM name preferred
  assert.equal(out[0].address, 'הר תבור 6, באר שבע');      // official address preferred
  assert.deepEqual(out[0].existence, { level: 'high', reason: 'multi', independent: 2, total: 2 });
  assert.equal(out[1].existence.level, 'medium');
  assert.ok(out[0].distanceM < out[1].distanceM);
});

test('an OSM record copied from the municipal file does not corroborate it', () => {
  const out = mergeRecords([
    rec('osm', 'node/1', 31.2501, 34.7901, { name: 'עץ חיים', derivedFrom: 'muni-beersheva' }),
    rec('muni-beersheva', '7', 31.2501, 34.7901, { name: 'עץ חיים' }),
  ], ORIGIN, 2000, NOW);
  assert.equal(out.length, 1);
  assert.equal(out[0].existence.level, 'medium');
});

test('a provider never merges two of its own records', () => {
  const out = mergeRecords([
    rec('osm', 'node/1', 31.2501, 34.7901, { name: 'עץ חיים' }),
    rec('osm', 'way/2', 31.2501, 34.7901, { name: 'עץ חיים' }),
  ], ORIGIN, 2000, NOW);
  assert.equal(out.length, 2);
});

test('missing data stays missing; out-of-radius records are dropped', () => {
  const out = mergeRecords([
    rec('wikidata', 'Q1', 31.2501, 34.7901),
    rec('osm', 'node/9', 31.40, 34.90, { name: 'far' }),
  ], ORIGIN, 1000, NOW);
  assert.equal(out.length, 1);
  assert.equal(out[0].name, null);
  assert.equal(out[0].address, null);
  assert.equal(out[0].phone, null);
  assert.equal(out[0].schedule, null);
});

test('schedules and contacts carry their provider', () => {
  const out = mergeRecords([
    rec('osm', 'node/1', 31.2501, 34.7901, {
      name: 'x', phone: '08-6000000', schedule: { weekday: null, shabbat: null, general: 'Sa 08:00', updatedAt: '2026-05-01T00:00:00Z' },
    }),
  ], ORIGIN, 2000, NOW);
  assert.deepEqual(out[0].phone, { value: '08-6000000', provider: 'osm' });
  assert.equal(out[0].schedules[0].provider, 'osm');
  assert.equal(out[0].schedule?.level, 'medium');
});
