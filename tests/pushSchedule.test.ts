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
const noHoliday = { hasHilula: false, omerTonight: null, omerMinutes: 19 * 60 };

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

test('hilula only on hilula days and only when enabled; omer follows Israel nightfall', () => {
  const at = new Date('2026-01-15T06:10:00Z');
  assert.deepEqual(dueKinds(at, sub(), { ...noHoliday, hasHilula: true }), ['daily', 'hilula']);
  assert.deepEqual(dueKinds(at, sub({ hilula: false }), { ...noHoliday, hasHilula: true }), ['daily']);
  const evening = new Date('2026-04-20T16:30:00Z'); // 19:30 Israel (UTC+3)
  const omer = { hasHilula: false, omerTonight: 5, omerMinutes: 19 * 60 + 20 };
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), omer), ['omer']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, omer: false }), omer), []);
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), { ...omer, omerTonight: null }), []);
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
