import { test } from 'node:test';
import assert from 'node:assert/strict';
import { candleSlot, chanukahStatus } from '../src/lib/chanukah';

// Chanukah 5787: the first candle is lit on Friday 4 Dec 2026; 25 Kislev = Sat 5 Dec.
const at = (iso: string) => new Date(`${iso}+02:00`);

test('nothing before the eve of Chanukah or after it', () => {
  assert.equal(chanukahStatus(at('2026-12-03T12:00:00')), null);
  assert.equal(chanukahStatus(at('2026-12-03T22:00:00')), null);
  assert.equal(chanukahStatus(at('2026-12-12T19:00:00')), null);
  assert.equal(chanukahStatus(at('2026-12-13T10:00:00')), null);
});

test('the eve: one candle stands ready, lit before Shabbat', () => {
  assert.deepEqual(chanukahStatus(at('2026-12-04T10:00:00')), { candles: 1, lit: false, zot: false, when: 'before-shabbat' });
  // Sunset in Jerusalem is about 16:35; candles go on 40 minutes earlier.
  assert.equal(chanukahStatus(at('2026-12-04T16:10:00'))?.lit, true);
  assert.deepEqual(chanukahStatus(at('2026-12-04T23:00:00')), { candles: 1, lit: true, zot: false, when: 'before-shabbat' });
  assert.deepEqual(chanukahStatus(at('2026-12-05T03:00:00')), { candles: 1, lit: true, zot: false, when: 'tonight' });
});

test('the second candle waits for Shabbat to end', () => {
  assert.deepEqual(chanukahStatus(at('2026-12-05T12:00:00')), { candles: 2, lit: false, zot: false, when: 'motzash' });
  assert.equal(chanukahStatus(at('2026-12-05T17:00:00'))?.lit, false);
  assert.equal(chanukahStatus(at('2026-12-05T17:40:00'))?.lit, true);
});

test('a weekday: unlit by day, lit at nightfall', () => {
  assert.deepEqual(chanukahStatus(at('2026-12-07T15:00:00')), { candles: 4, lit: false, zot: false, when: 'tonight' });
  assert.equal(chanukahStatus(at('2026-12-07T16:45:00'))?.lit, false);
  assert.deepEqual(chanukahStatus(at('2026-12-07T17:15:00')), { candles: 4, lit: true, zot: false, when: 'tonight' });
});

test('זאת חנוכה: eight candles burn through the eighth day, then nothing', () => {
  assert.deepEqual(chanukahStatus(at('2026-12-11T20:00:00'))?.candles, 8);
  const zot = chanukahStatus(at('2026-12-12T11:00:00'));
  assert.equal(zot?.candles, 8);
  assert.equal(zot?.zot, true);
  assert.equal(zot?.lit, true);
});

test('candles are placed from the right, skipping the shamash', () => {
  assert.deepEqual([1, 2, 3, 4, 5, 6, 7, 8].map(candleSlot), [8, 7, 6, 5, 3, 2, 1, 0]);
});
