import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ttlCache, withDeadline, errorDetail } from '@/lib/minyan/sources/cache';
import { endpointOrder, OVERPASS_ENDPOINTS, overpassCoolingDown } from '@/lib/minyan/sources/overpass';
import { toElement, snapshotNear, SNAPSHOT_SYNAGOGUES } from '@/lib/minyan/sources/osmSnapshot';
import { parseOverpass } from '@/lib/minyan/sources/osm';
import { isQuietPath } from '@/lib/whatsNew';

test('withDeadline: a slow source yields the fallback, a fast one its value', async () => {
  const slow = new Promise<string>(r => setTimeout(() => r('late'), 200));
  assert.equal(await withDeadline(slow, 20, 'fallback'), 'fallback');
  assert.equal(await withDeadline(Promise.resolve('ok'), 20, 'fallback'), 'ok');
});

test('ttlCache serves a stale entry when a refresh fails', async () => {
  const get = ttlCache<number>(0, 10, 60_000); // every read refreshes
  assert.equal(await get('k', async () => 1), 1);
  assert.equal(await get('k', async () => { throw new Error('down'); }), 1);
  await assert.rejects(get('other', async () => { throw new Error('down'); }));
});

test('errorDetail names timeouts', () => {
  const t = new Error('x'); t.name = 'TimeoutError';
  assert.equal(errorDetail(t), 'timeout');
  assert.equal(errorDetail(new Error('HTTP 406')), 'HTTP 406');
  assert.equal(errorDetail('weird'), 'failed');
});

test('Overpass instances start healthy and in list order', () => {
  assert.deepEqual(endpointOrder(), OVERPASS_ENDPOINTS);
  assert.equal(overpassCoolingDown(), false);
});

test('snapshot rows become Overpass elements the OSM parser reads', () => {
  const el = toElement({ k: 'way/42', la: 31.78, lo: 35.23, ts: '2025-03-01', name: 'בית כנסת אוהל משה', amenity: 'place_of_worship', religion: 'jewish' });
  assert.deepEqual([el.type, el.id, el.lat, el.lon], ['way', 42, 31.78, 35.23]);
  const [r] = parseOverpass([el]);
  assert.equal(r.name, 'בית כנסת אוהל משה');
  assert.equal(r.url, 'https://www.openstreetmap.org/way/42');
  assert.ok(SNAPSHOT_SYNAGOGUES.length > 1000, 'snapshot ships with the build');
  const near = snapshotNear(SNAPSHOT_SYNAGOGUES, 31.778, 35.2354, 1000);
  assert.ok(near.length > 0, 'Jerusalem old city has synagogues in the snapshot');
});

test('announcement stays out of full-screen flows', () => {
  assert.equal(isQuietPath('/play/host/1234'), true);
  assert.equal(isQuietPath('/feed'), true);
  assert.equal(isQuietPath('/'), false);
  assert.equal(isQuietPath('/minyan'), false);
});
