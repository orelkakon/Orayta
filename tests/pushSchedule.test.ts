import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  localClock, isDue, dueKinds, normalizeMinutes, parseTime, formatMinutes, isValidTimeZone,
  LATE_WINDOW_MIN, type SubscriptionPrefs,
} from '@/lib/push/schedule';
import { parsePrefs } from '@/lib/push/prefs';
import { joinNames, hebDatePartsFor, hilulaRabbisOn } from '@/lib/push/hilula';

const sub = (over: Partial<SubscriptionPrefs> = {}): SubscriptionPrefs => ({
  timeZone: 'Asia/Jerusalem', dailyMinutes: 480, daily: true, hilula: true, omer: true,
  lastDailyDay: null, lastHilulaDay: null, lastOmerDay: null, ...over,
});
const noHoliday = { hilulaDay: null, omerTonight: null, nightfallMinutes: 19 * 60 };

test('localClock follows the zone, including DST', () => {
  // 2026-01-15 06:00Z = 08:00 Israel winter (UTC+2)
  assert.deepEqual(localClock(new Date('2026-01-15T06:00:00Z'), 'Asia/Jerusalem'), { day: '2026-01-15', minutes: 480 });
  // 2026-07-15 05:00Z = 08:00 Israel summer (UTC+3)
  assert.deepEqual(localClock(new Date('2026-07-15T05:00:00Z'), 'Asia/Jerusalem'), { day: '2026-07-15', minutes: 480 });
  // Same instant is the previous evening in New York
  assert.deepEqual(localClock(new Date('2026-01-15T03:00:00Z'), 'America/New_York'), { day: '2026-01-14', minutes: 22 * 60 });
  // Invalid zone falls back to Israel
  assert.equal(localClock(new Date('2026-01-15T06:00:00Z'), 'Nope/Zone').minutes, 480);
});

test('isDue: on time, late within the window, too late, already sent, too early', () => {
  assert.equal(isDue({ day: 'd', minutes: 480 }, 480, null), true);
  assert.equal(isDue({ day: 'd', minutes: 480 + LATE_WINDOW_MIN }, 480, null), true);
  assert.equal(isDue({ day: 'd', minutes: 481 + LATE_WINDOW_MIN }, 480, null), false);
  assert.equal(isDue({ day: 'd', minutes: 500 }, 480, 'd'), false);
  assert.equal(isDue({ day: 'd', minutes: 500 }, 480, 'yesterday'), true);
  assert.equal(isDue({ day: 'd', minutes: 479 }, 480, null), false);
});

test('a delayed run (GitHub cron lag) still sends once', () => {
  const at = new Date('2026-01-15T06:47:00Z'); // 08:47 Israel
  assert.deepEqual(dueKinds(at, sub(), noHoliday), ['daily']);
  assert.deepEqual(dueKinds(at, sub({ lastDailyDay: '2026-01-15' }), noHoliday), []);
});

test('hilula goes out at Israel nightfall when its day begins; omer too; daily keeps its own time', () => {
  const morning = new Date('2026-01-15T06:10:00Z'); // 08:10 Israel — daily time, not nightfall
  assert.deepEqual(dueKinds(morning, sub(), { ...noHoliday, hilulaDay: '2026-01-16' }), ['daily']);
  const evening = new Date('2026-04-20T16:30:00Z'); // 19:30 Israel (UTC+3)
  const night = { hilulaDay: '2026-04-21', omerTonight: 5, nightfallMinutes: 19 * 60 + 20 };
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), night), ['hilula', 'omer']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, hilula: false }), night), ['omer']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, omer: false }), { ...night, hilulaDay: null }), []);
  const beforeNightfall = new Date('2026-04-20T16:10:00Z'); // 19:10 Israel
  assert.deepEqual(dueKinds(beforeNightfall, sub({ daily: false }), night), []);
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), { ...night, omerTonight: null }), ['hilula']);
});

test('the hilula marker is the Hebrew day announced, not the civil day it was sent on', () => {
  const evening = new Date('2026-04-20T16:30:00Z'); // 19:30 Israel, the night of 2026-04-21's Hebrew day
  const night = { hilulaDay: '2026-04-21', omerTonight: null, nightfallMinutes: 19 * 60 + 20 };
  // A marker from earlier the same civil day (an older schedule) doesn't block tonight's.
  assert.deepEqual(dueKinds(evening, sub({ daily: false, lastHilulaDay: '2026-04-20' }), night), ['hilula']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, lastHilulaDay: '2026-04-21' }), night), []);
});

test('respects the subscriber zone for the daily time', () => {
  // 13:00Z = 08:00 New York (EST)
  assert.deepEqual(dueKinds(new Date('2026-01-15T13:00:00Z'), sub({ timeZone: 'America/New_York' }), noHoliday), ['daily']);
  assert.deepEqual(dueKinds(new Date('2026-01-15T06:00:00Z'), sub({ timeZone: 'America/New_York' }), noHoliday), []);
});

test('minutes/time helpers', () => {
  assert.equal(normalizeMinutes(495), 495);
  assert.equal(normalizeMinutes(490), null);
  assert.equal(normalizeMinutes(1440), null);
  assert.equal(normalizeMinutes('480'), null);
  assert.equal(formatMinutes(495), '08:15');
  assert.equal(parseTime('08:15'), 495);
  assert.equal(parseTime('8:07'), 480);
  assert.equal(parseTime('bad'), null);
  assert.equal(isValidTimeZone('Asia/Jerusalem'), true);
  assert.equal(isValidTimeZone('x'.repeat(80)), false);
});

test('parsePrefs keeps only well-formed fields', () => {
  assert.deepEqual(parsePrefs({ dailyMinutes: 495, daily: false, hilula: 'yes', evil: 1 }, 'Asia/Jerusalem'),
    { timeZone: 'Asia/Jerusalem', dailyMinutes: 495, daily: false });
  assert.deepEqual(parsePrefs(null, 'Bad/Zone'), {});
});

test('joinNames joins with ו and truncates long lists', () => {
  const more = (n: number) => `ועוד ${n}`;
  assert.equal(joinNames(['רבי א'], 2, more), 'רבי א');
  assert.equal(joinNames(['רבי א', 'רבי ב'], 2, more), 'רבי א ורבי ב');
  assert.equal(joinNames(['א', 'ב', 'ג'], 2, more), 'א, ב וג');
  assert.equal(joinNames(['א', 'ב', 'ג', 'ד', 'ה'], 2, more), 'א, ב ועוד 3');
});

test('hilula matching uses the Israel day (no network)', () => {
  // 2026-10-21 is 10 Cheshvan 5787
  assert.deepEqual(hebDatePartsFor(new Date('2026-10-21T20:30:00Z')), { hd: 10, hm: 'Cheshvan' });
  // 23:30 Israel on the 21st is still the 21st's civil day
  assert.deepEqual(hebDatePartsFor(new Date('2026-10-21T20:30:00Z')), hebDatePartsFor(new Date('2026-10-21T05:00:00Z')));
  const rabbis = [{ deathDate: 'י חשוון' }, { deathDate: 'י"א חשון' }, { deathDate: null }];
  assert.deepEqual(hilulaRabbisOn(rabbis, new Date('2026-10-21T09:00:00Z')), [rabbis[0]]);
});

import { isPushServiceUrl, parseSubscription } from '@/lib/push/validate';

test('subscriptions: only real push services and well-formed keys', () => {
  const keys = { p256dh: 'B'.repeat(87), auth: 'a'.repeat(22) };
  assert.ok(parseSubscription({ endpoint: 'https://fcm.googleapis.com/fcm/send/abc', keys }));
  assert.ok(parseSubscription({ endpoint: 'https://web.push.apple.com/QK', keys }));
  assert.ok(parseSubscription({ endpoint: 'https://updates.push.services.mozilla.com/wpush/v2/x', keys }));
  assert.ok(isPushServiceUrl('https://wns2-par02p.notify.windows.com/w/?token=x'));
  assert.equal(parseSubscription({ endpoint: 'https://example.invalid/x', keys }), null);
  assert.equal(parseSubscription({ endpoint: 'https://fcm.googleapis.com.evil.com/x', keys }), null);
  assert.equal(parseSubscription({ endpoint: 'http://fcm.googleapis.com/x', keys }), null);
  assert.equal(parseSubscription({ endpoint: 'https://fcm.googleapis.com:8443/x', keys }), null);
  assert.equal(parseSubscription({ endpoint: 'https://fcm.googleapis.com/x', keys: { p256dh: 'a', auth: 'b' } }), null);
});

import { hebrewDayAnchor } from '@/lib/push/hilula';

test('hilula day follows the Hebrew day: after nightfall it is already tomorrow', () => {
  const afternoon = new Date('2026-10-21T12:00:00Z'); // 15:00 Israel
  const night = new Date('2026-10-21T17:30:00Z');     // 20:30 Israel, after nightfall
  assert.equal(hebrewDayAnchor(afternoon), afternoon);
  assert.equal(hebrewDayAnchor(night).toISOString().slice(0, 10), '2026-10-22');
  // 10 Cheshvan 5787 is civil 21 Oct (by day); its eve is the night of 20 Oct.
  const gad = [{ deathDate: 'י׳ חשוון' }];
  assert.equal(hilulaRabbisOn(gad, hebrewDayAnchor(new Date('2026-10-20T17:30:00Z'))).length, 1);
  assert.equal(hilulaRabbisOn(gad, hebrewDayAnchor(night)).length, 0);
});

import { needsDispatch, type ScheduleEntry } from '@/lib/push/wake';

const entry = (over: Partial<ScheduleEntry> = {}): ScheduleEntry =>
  ({ timeZone: 'Asia/Jerusalem', dailyMinutes: 8 * 60 + 15, daily: true, hilula: true, omer: true, ...over });
const quiet = { hilula: false, omer: false };
const NIGHTFALL = Date.parse('2026-10-21T15:26:00Z'); // 18:26 Israel

test('heartbeat wakes the DB only when someone is due', () => {
  // 08:15 Israel (UTC+3) chosen time: the ping on the minute and the backup 5 minutes later.
  assert.equal(needsDispatch(new Date('2026-10-21T05:15:20Z'), [entry()], NIGHTFALL, quiet), true);
  assert.equal(needsDispatch(new Date('2026-10-21T05:20:10Z'), [entry()], NIGHTFALL, quiet), true);
  assert.equal(needsDispatch(new Date('2026-10-21T05:25:00Z'), [entry()], NIGHTFALL, quiet), false);
  assert.equal(needsDispatch(new Date('2026-10-21T05:00:00Z'), [entry()], NIGHTFALL, quiet), false); // other quarter
  assert.equal(needsDispatch(new Date('2026-10-21T05:15:20Z'), [entry({ daily: false })], NIGHTFALL, quiet), false);
  // Another time zone: 08:15 in London (UTC+1 in October) is 07:15Z.
  assert.equal(needsDispatch(new Date('2026-10-21T07:15:00Z'), [entry({ timeZone: 'Europe/London' })], NIGHTFALL, quiet), true);
  // Midnight wrap: 23:55 chosen, ping at 00:00 is inside the window.
  assert.equal(needsDispatch(new Date('2026-10-20T21:00:00Z'), [entry({ dailyMinutes: 23 * 60 + 55 })], NIGHTFALL, quiet), true);
});

test('nightfall wakes only on hilula / omer nights for subscribers who want them', () => {
  const at = new Date(NIGHTFALL + 2 * 60_000);
  assert.equal(needsDispatch(at, [entry({ dailyMinutes: 0 })], NIGHTFALL, quiet), false);
  assert.equal(needsDispatch(at, [entry({ dailyMinutes: 0 })], NIGHTFALL, { hilula: true, omer: false }), true);
  assert.equal(needsDispatch(at, [entry({ dailyMinutes: 0, hilula: false })], NIGHTFALL, { hilula: true, omer: false }), false);
  assert.equal(needsDispatch(at, [entry({ dailyMinutes: 0 })], NIGHTFALL, { hilula: false, omer: true }), true);
  assert.equal(needsDispatch(new Date(NIGHTFALL + 9 * 60_000), [entry({ dailyMinutes: 0 })], NIGHTFALL, { hilula: true, omer: true }), false);
});

import { isRestDay, isHolyInIsrael, isHolyFor, eveningDelayMin, HOLY_AFTER_SUNSET_MIN } from '@/lib/push/holy';

const holyCtx = { ...noHoliday, holy: isHolyFor };

test('rest days: Shabbat and Yom Tov, with the diaspora second days', () => {
  assert.equal(isRestDay('2026-10-24'), true);   // Saturday
  assert.equal(isRestDay('2026-10-23'), false);  // Friday
  assert.equal(isRestDay('2026-09-12'), true);   // 1 Tishrei 5787 (Shabbat anyway)
  assert.equal(isRestDay('2026-09-13'), true);   // 2 Tishrei — Rosh Hashana day 2
  assert.equal(isRestDay('2026-09-21'), true);   // 10 Tishrei — Yom Kippur (Monday)
  assert.equal(isRestDay('2026-09-27'), false);  // 16 Tishrei — Chol HaMoed in Israel…
  assert.equal(isRestDay('2026-09-27', true), true); // …second day abroad
  assert.equal(isRestDay('2027-04-22'), true);   // 15 Nisan 5787 (Thursday)
  assert.equal(isRestDay('2027-06-11'), true);   // 6 Sivan — Shavuot (Friday)
});

test('Israel holy time: from 40 min before sunset on the eve to 50 min after sunset on the day', () => {
  // Friday 2026-10-23, sunset in Jerusalem ≈ 17:59 (UTC+3 → 14:59Z)
  assert.equal(isHolyInIsrael(new Date('2026-10-23T13:40:00Z')), false); // 16:40 Friday
  assert.equal(isHolyInIsrael(new Date('2026-10-23T14:30:00Z')), true);  // 17:30 Friday
  assert.equal(isHolyInIsrael(new Date('2026-10-24T09:00:00Z')), true);  // Shabbat morning
  assert.equal(isHolyInIsrael(new Date('2026-10-24T15:30:00Z')), true);  // 18:30, before the end
  assert.equal(isHolyInIsrael(new Date('2026-10-24T16:00:00Z')), false); // 19:00 Motzash
  assert.equal(isHolyInIsrael(new Date('2026-10-21T15:30:00Z')), false); // ordinary Wednesday
});

test('abroad: the whole local rest day plus its eve from 14:00', () => {
  const ny = 'America/New_York';
  assert.equal(isHolyFor(new Date('2026-10-23T17:00:00Z'), ny), false); // Fri 13:00 NY
  assert.equal(isHolyFor(new Date('2026-10-23T19:00:00Z'), ny), true);  // Fri 15:00 NY
  assert.equal(isHolyFor(new Date('2026-10-24T22:00:00Z'), ny), true);  // Sat 18:00 NY
  assert.equal(isHolyFor(new Date('2026-10-25T13:00:00Z'), ny), false); // Sun 09:00 NY
});

test('no notification on Shabbat; a reminder that fell in Shabbat is not sent late', () => {
  const shabbat8 = new Date('2026-10-24T05:00:00Z'); // Sat 08:00 Israel
  assert.deepEqual(dueKinds(shabbat8, sub(), holyCtx), []);
  // 17:00 reminder on Shabbat (inside it); at 19:00 Shabbat is out but the reminder stays skipped
  const motzash = new Date('2026-10-24T16:00:00Z');
  assert.deepEqual(dueKinds(motzash, sub({ dailyMinutes: 17 * 60 }), holyCtx), []);
  // An evening reminder after Shabbat ends goes out as usual
  assert.deepEqual(dueKinds(new Date('2026-10-24T18:00:00Z'), sub({ dailyMinutes: 21 * 60 }), holyCtx), ['daily']);
  // Hilula / omer at Friday nightfall are held
  const fridayNight = new Date('2026-10-23T15:40:00Z');
  const night = { hilulaDay: '2026-10-24', omerTonight: 3, nightfallMinutes: 18 * 60 + 24, holy: isHolyFor };
  assert.deepEqual(dueKinds(fridayNight, sub({ daily: false }), night), []);
  // Weekday nights unchanged
  assert.deepEqual(dueKinds(new Date('2026-10-21T15:40:00Z'), sub({ daily: false }), { ...night, hilulaDay: '2026-10-22' }), ['hilula', 'omer']);
});

test('evening notifications after a rest day wait until it has ended', () => {
  assert.equal(eveningDelayMin(new Date('2026-10-21T14:00:00Z'), 25), 25);
  assert.equal(eveningDelayMin(new Date('2026-10-24T14:00:00Z'), 25), HOLY_AFTER_SUNSET_MIN + 5);
});

test('heartbeat sleeps through Shabbat', () => {
  const e = { timeZone: 'Asia/Jerusalem', dailyMinutes: 8 * 60, daily: true, hilula: true, omer: true };
  assert.equal(needsDispatch(new Date('2026-10-24T05:01:00Z'), [e], 0, { hilula: false, omer: false }), false);
  assert.equal(needsDispatch(new Date('2026-10-22T05:01:00Z'), [e], 0, { hilula: false, omer: false }), true);
  const fridayNightfall = Date.parse('2026-10-23T15:24:00Z');
  assert.equal(needsDispatch(new Date(fridayNightfall + 60_000), [{ ...e, dailyMinutes: 0 }], fridayNightfall, { hilula: true, omer: true }), false);
});
