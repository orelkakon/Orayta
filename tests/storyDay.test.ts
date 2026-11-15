import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addDayKey, dayNumber, dayParam, israelDayKey, pickForDay, validDayKey, weekdayOfKey } from '../src/lib/daily/day';
import {
  DATED_CACHE, israelMidnight, shabbatEnds, shabbatFridayKey, storyCacheControl,
} from '../src/lib/storyRender/schedule';

const il = (iso: string) => new Date(`${iso}+02:00`); // Israel winter time

test('the daily day is the Israel date, not UTC', () => {
  // 23:30 UTC on the 14th is already the 15th in Israel.
  assert.equal(israelDayKey(new Date('2026-11-14T23:30:00Z')), '2026-11-15');
  assert.equal(israelDayKey(il('2026-11-15T00:05:00')), '2026-11-15');
  assert.equal(israelDayKey(il('2026-11-15T23:59:00')), '2026-11-15');
});

test('pickForDay keeps /today\'s index (days since the epoch) and rotates daily', () => {
  assert.equal(dayNumber('1970-01-01'), 0);
  assert.equal(dayNumber('2026-11-15'), Math.floor(Date.UTC(2026, 10, 15) / 86_400_000));
  const list = ['a', 'b', 'c'];
  const n = dayNumber('2026-11-15');
  assert.equal(pickForDay(list, '2026-11-15'), list[n % 3]);
  assert.equal(pickForDay(list, '2026-11-16'), list[(n + 1) % 3]);
  assert.equal(pickForDay([], '2026-11-15'), null);
});

test('?date= wins, ?d= (the scheduler\'s cache buster) also works, junk is ignored', () => {
  assert.equal(dayParam(new URLSearchParams('date=2026-11-20&d=2026-11-21')), '2026-11-20');
  assert.equal(dayParam(new URLSearchParams('d=2026-11-21&utm_source=buffer')), '2026-11-21');
  assert.equal(dayParam(new URLSearchParams('d=2026-02-30')), null);
  assert.equal(dayParam(new URLSearchParams('d=tomorrow')), null);
  assert.equal(dayParam(new URLSearchParams('')), null);
  assert.equal(validDayKey('2028-02-29'), '2028-02-29');
  assert.equal(addDayKey('2026-12-31', 1), '2027-01-01');
  assert.equal(weekdayOfKey('2026-11-20'), 5);
});

test('the upcoming Shabbat: this week\'s Friday, the one in progress on Saturday, then next week\'s', () => {
  assert.equal(shabbatFridayKey('2026-11-15'), '2026-11-20'); // Sunday
  assert.equal(shabbatFridayKey('2026-11-19'), '2026-11-20'); // Thursday
  assert.equal(shabbatFridayKey('2026-11-20'), '2026-11-20'); // Friday
  assert.equal(shabbatFridayKey('2026-11-21'), '2026-11-20'); // Saturday (a date preview)
  const ends = shabbatEnds('2026-11-20');
  assert.equal(shabbatFridayKey('2026-11-21', new Date(ends.getTime() - 60_000)), '2026-11-20');
  assert.equal(shabbatFridayKey('2026-11-21', new Date(ends.getTime() + 60_000)), '2026-11-27');
  // Ends Saturday evening in Jerusalem (≈17:16 in late November).
  assert.equal(israelDayKey(ends), '2026-11-21');
});

test('Israel midnight in winter and in summer time', () => {
  assert.equal(israelMidnight('2026-11-16').toISOString(), '2026-11-15T22:00:00.000Z');
  assert.equal(israelMidnight('2026-07-01').toISOString(), '2026-06-30T21:00:00.000Z');
});

test('the bare URL is never cached past the moment its content changes', () => {
  const now = il('2026-11-15T22:00:00');
  const midnight = israelMidnight('2026-11-16');
  assert.equal(storyCacheControl(now, midnight), 'public, s-maxage=3600, stale-while-revalidate=3600');
  assert.equal(storyCacheControl(il('2026-11-15T23:50:00'), midnight), 'public, s-maxage=600, stale-while-revalidate=0');
  assert.equal(storyCacheControl(il('2026-11-15T08:00:00'), midnight), 'public, s-maxage=3600, stale-while-revalidate=54000');
  assert.equal(storyCacheControl(il('2026-11-16T00:00:01'), midnight), 'public, s-maxage=0, stale-while-revalidate=0');
  assert.equal(storyCacheControl(now, null), DATED_CACHE);
});
