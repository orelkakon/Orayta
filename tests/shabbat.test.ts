import { test } from 'node:test';
import assert from 'node:assert/strict';
import { countdownParts, shabbatPreview, shabbatStatus, shabbatTimes } from '../src/lib/shabbat';
import { jerusalemSunAt, jerusalemSunTimes } from '../src/lib/siddur/calendar';

// Parashat Toldot 5787. Hebcal, Jerusalem: candles Fri 13 Nov 2026 16:00, havdalah Sat 17:18.
const at = (iso: string) => new Date(`${iso}+02:00`);
const near = (a: Date, iso: string, minutes = 2) => {
  const diff = Math.abs(a.getTime() - at(iso).getTime()) / 60000;
  assert.ok(diff <= minutes, `${a.toISOString()} is ${diff.toFixed(1)} min from ${iso}`);
};

test('the altitude helper matches sunrise/sunset at -0.833° and runs later for tzeit', () => {
  const d = at('2026-11-14T12:00:00');
  assert.deepEqual(jerusalemSunAt(d, -0.833), jerusalemSunTimes(d));
  assert.ok(jerusalemSunAt(d, -8.5).sunset > jerusalemSunTimes(d).sunset);
  assert.ok(jerusalemSunAt(d, -8.5).sunrise < jerusalemSunTimes(d).sunrise);
});

test('times land within two minutes of Hebcal for Jerusalem', () => {
  const t = shabbatTimes(at('2026-11-13T09:00:00'));
  near(t.candles, '2026-11-13T16:00:00');
  near(t.ends, '2026-11-14T17:18:00');
  // Rabbeinu Tam: Saturday sunset (~16:39) + 72 min.
  near(t.rabbeinuTam, '2026-11-14T17:51:00', 3);
});

test('nothing from Sunday to Thursday', () => {
  for (const iso of ['2026-11-15T12:00:00', '2026-11-16T20:00:00', '2026-11-19T23:30:00']) {
    assert.equal(shabbatStatus(at(iso)), null);
  }
});

test('Friday before candle lighting: erev with a countdown', () => {
  const s = shabbatStatus(at('2026-11-13T10:00:00'));
  assert.equal(s?.phase, 'erev');
  assert.ok(s && s.minutesToCandles >= 358 && s.minutesToCandles <= 362, String(s?.minutesToCandles));
  assert.equal(shabbatStatus(at('2026-11-13T00:30:00'))?.phase, 'erev');
  assert.equal(shabbatStatus(at('2026-11-13T15:58:00'))?.phase, 'erev');
});

test('from candle lighting until Shabbat goes out: shabbat', () => {
  const lit = shabbatStatus(at('2026-11-13T16:05:00'));
  assert.equal(lit?.phase, 'shabbat');
  assert.equal(lit?.minutesToCandles, 0);
  assert.equal(shabbatStatus(at('2026-11-13T23:00:00'))?.phase, 'shabbat');
  const sat = shabbatStatus(at('2026-11-14T11:00:00'));
  assert.equal(sat?.phase, 'shabbat');
  near(sat!.ends, '2026-11-14T17:18:00');
  near(sat!.candles, '2026-11-13T16:00:00');
  assert.equal(shabbatStatus(at('2026-11-14T17:10:00'))?.phase, 'shabbat');
});

test('after havdalah: nothing', () => {
  assert.equal(shabbatStatus(at('2026-11-14T17:25:00')), null);
  assert.equal(shabbatStatus(at('2026-11-14T22:00:00')), null);
});

test('summer: candles track the later sunset', () => {
  // Hebcal Jerusalem, Fri 3 Jul 2026: candles 19:09 (sunset ~19:49, IDT).
  const t = shabbatTimes(new Date('2026-07-03T09:00:00+03:00'));
  const diff = Math.abs(t.candles.getTime() - new Date('2026-07-03T19:09:00+03:00').getTime()) / 60000;
  assert.ok(diff <= 3, `${diff} min`);
});

test('preview: today as if Friday, or just after candle lighting', () => {
  const tuesday = at('2026-11-17T10:00:00');
  const erev = shabbatPreview(tuesday, 1);
  assert.equal(erev?.phase, 'erev');
  near(erev!.candles, '2026-11-20T16:00:00', 4);
  assert.equal(shabbatPreview(tuesday, 2)?.phase, 'shabbat');
  assert.equal(shabbatPreview(tuesday, 0), null);
});

test('countdown parts', () => {
  assert.deepEqual(countdownParts(125), { h: 2, m: 5 });
  assert.deepEqual(countdownParts(7), { h: 0, m: 7 });
});
