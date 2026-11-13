import { test } from 'node:test';
import assert from 'node:assert/strict';
import { allCityTimes, countdownParts, shabbatPreview, shabbatStatus } from '../src/lib/shabbat';
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

// Hebcal (geonameid per city), candles / havdalah at 8.5°.
const HEBCAL: Record<string, [string, string, string][]> = {
  '2026-11-13T09:00:00+02:00': [
    ['jerusalem', '2026-11-13T16:00:00+02:00', '2026-11-14T17:18:00+02:00'],
    ['telaviv', '2026-11-13T16:22:00+02:00', '2026-11-14T17:20:00+02:00'],
    ['haifa', '2026-11-13T16:09:00+02:00', '2026-11-14T17:18:00+02:00'],
    ['beersheva', '2026-11-13T16:23:00+02:00', '2026-11-14T17:21:00+02:00'],
    ['tzfat', '2026-11-13T16:17:00+02:00', '2026-11-14T17:16:00+02:00'],
    ['eilat', '2026-11-13T16:25:00+02:00', '2026-11-14T17:23:00+02:00'],
  ],
  '2027-07-02T09:00:00+03:00': [
    ['jerusalem', '2027-07-02T19:08:00+03:00', '2027-07-03T20:31:00+03:00'],
    ['telaviv', '2027-07-02T19:31:00+03:00', '2027-07-03T20:33:00+03:00'],
    ['haifa', '2027-07-02T19:22:00+03:00', '2027-07-03T20:35:00+03:00'],
    ['beersheva', '2027-07-02T19:29:00+03:00', '2027-07-03T20:31:00+03:00'],
    ['tzfat', '2027-07-02T19:30:00+03:00', '2027-07-03T20:33:00+03:00'],
    ['eilat', '2027-07-02T19:24:00+03:00', '2027-07-03T20:25:00+03:00'],
  ],
};

test('every city lands within two minutes of Hebcal, winter and summer', () => {
  for (const [friday, rows] of Object.entries(HEBCAL)) {
    const got = allCityTimes(new Date(friday));
    assert.deepEqual(got.map(c => c.id), rows.map(r => r[0]));
    rows.forEach(([id, candles, ends], i) => {
      for (const [a, iso] of [[got[i].candles, candles], [got[i].ends, ends]] as const) {
        const diff = Math.abs(a.getTime() - new Date(iso).getTime()) / 60000;
        assert.ok(diff <= 2, `${id}: ${a.toISOString()} is ${diff} min from ${iso}`);
      }
    });
  }
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
  assert.ok(s!.dayProgress > 0.35 && s!.dayProgress < 0.45, String(s?.dayProgress));
  assert.equal(s!.cities.length, 6);
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

test('share content: parasha, Shabbat date (Hebrew + civil), every city, the message', async () => {
  const { clipData, dateLine, shareText, civilDate } = await import('../src/lib/shabbatClip/data');
  const d = clipData(allCityTimes(at('2026-11-13T09:00:00')), 'פרשת תולדות');
  assert.equal(d.parasha, 'פרשת תולדות');
  assert.equal(d.civilDate, '14.11.2026');
  assert.equal(d.hebDate, 'ד׳ בכסלו התשפ״ז');
  assert.equal(dateLine(d), 'ד׳ בכסלו התשפ״ז · 14.11.2026');
  assert.deepEqual(d.rows.map(r => r.city), ['ירושלים', 'תל אביב', 'חיפה', 'באר שבע', 'צפת', 'אילת']);
  assert.deepEqual(d.rows[0], { city: 'ירושלים', candles: '16:01', ends: '17:19' });
  const msg = shareText(d, 'https://example.org');
  assert.match(msg, /זמני שבת פרשת תולדות/);
  assert.match(msg, /ד׳ בכסלו התשפ״ז · 14\.11\.2026/);
  assert.match(msg, /תל אביב: כניסה 16:22 · יציאה 17:20/);
  assert.ok(msg.trim().endsWith('https://example.org'));
  assert.equal(civilDate(new Date('2027-07-03T12:00:00+03:00')), '3.7.2027');
  assert.match(shareText(clipData(allCityTimes(at('2026-11-13T09:00:00')), null), ''), /^🕯️🕯️ \*זמני שבת\*/);
});
