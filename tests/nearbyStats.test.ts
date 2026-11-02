import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeNearbyStats } from '@/lib/nearbyStats/compute';
import { nearestArea } from '@/lib/nearbyStats/area';
import type { NearbySearchRow } from '@/types/nearbyStats';

const NOW = new Date('2026-11-02T12:00:00Z').getTime();
const row = (over: Partial<NearbySearchRow>): NearbySearchRow => ({
  createdAt: new Date(NOW - 60_000), feature: 'minyan', area: 'ירושלים', via: 'gps', radiusM: 2000,
  results: 5, nearestM: 300, status: 'ok', degraded: [], latencyMs: 1000, ipHash: 'a', ...over,
});

test('nearestArea names the closest city, nothing far from every town', () => {
  assert.equal(nearestArea(31.778, 35.2354), 'ירושלים');
  assert.equal(nearestArea(32.0853, 34.7818), 'תל אביב–יפו');
  assert.equal(nearestArea(32.99, 35.44), 'צפת', 'Meron is near Safed');
  assert.equal(nearestArea(48.85, 2.35), null, 'abroad has no area');
  assert.equal(nearestArea(1, 1, [['x', 1.3, 1]]), null, 'more than 20 km away');
});

test('windows, unique and returning searchers', () => {
  const day = 86_400_000;
  const s = computeNearbyStats([
    row({}),
    row({ ipHash: 'b', feature: 'mikveh', via: 'place' }),
    row({ createdAt: new Date(NOW - day), ipHash: 'a', feature: 'kivrei' }),
    row({ createdAt: new Date(NOW - 10 * day), ipHash: null }),
    row({ feature: 'unknown' }),
  ], 99, NOW);
  assert.equal(s.total, 99);
  assert.equal(s.today, 2);
  assert.equal(s.yesterday, 1);
  assert.equal(s.week, 3);
  assert.equal(s.prevWeek, 1);
  assert.equal(s.searchers7d, 2);
  assert.equal(s.returning7d, 1, '"a" searched on two days');
  assert.equal(s.gpsPct, 75);
  assert.deepEqual(s.daily.at(-1), { day: '2026-11-02', minyan: 1, mikveh: 1, kivrei: 0 });
  assert.deepEqual([s.hours[13], s.hours[14], s.hours[15]], [2, 1, 1], 'Israel hour, across the end of summer time');
});

test('zero results, failures, gaps and sources', () => {
  const s = computeNearbyStats([
    row({ results: 0, nearestM: null, area: 'ערד', feature: 'mikveh' }),
    row({ results: 0, nearestM: null, area: 'ערד', feature: 'mikveh' }),
    row({ results: 4, nearestM: 900, feature: 'mikveh', area: 'ערד' }),
    row({ status: 'error', results: 0, nearestM: null, degraded: ['osm:error', 'wikidata:error'] }),
    row({ status: 'partial', degraded: ['wikidata:error', 'osm:snapshot'], nearestM: 100 }),
    row({ area: null, nearestM: 500 }),
  ], 6, NOW);
  const mikveh = s.features.find(f => f.feature === 'mikveh')!;
  assert.equal(mikveh.zeroPct, 67);
  assert.equal(mikveh.medianNearestM, 900);
  const minyan = s.features.find(f => f.feature === 'minyan')!;
  assert.equal(minyan.errors, 1);
  assert.equal(minyan.zeroPct, 0, 'a failed search is not "nothing nearby"');
  assert.equal(minyan.degradedPct, 67);
  assert.equal(minyan.medianNearestM, 300);
  assert.deepEqual(s.gaps, [{ area: 'ערד', feature: 'mikveh', zero: 2, searches: 3 }]);
  assert.deepEqual(s.sources[0], { key: 'wikidata:error', n: 2 });
  assert.equal(s.areas[0].area, 'ערד');
  assert.ok(s.areas.some(a => a.area === ''), 'searches outside towns are grouped');
});
