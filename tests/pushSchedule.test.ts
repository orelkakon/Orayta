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
const noHoliday = { hilulaTonight: false, omerTonight: null, nightfallMinutes: 19 * 60 };

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
  assert.deepEqual(dueKinds(morning, sub(), { ...noHoliday, hilulaTonight: true }), ['daily']);
  const evening = new Date('2026-04-20T16:30:00Z'); // 19:30 Israel (UTC+3)
  const night = { hilulaTonight: true, omerTonight: 5, nightfallMinutes: 19 * 60 + 20 };
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), night), ['hilula', 'omer']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, hilula: false }), night), ['omer']);
  assert.deepEqual(dueKinds(evening, sub({ daily: false, omer: false }), { ...night, hilulaTonight: false }), []);
  const beforeNightfall = new Date('2026-04-20T16:10:00Z'); // 19:10 Israel
  assert.deepEqual(dueKinds(beforeNightfall, sub({ daily: false }), night), []);
  assert.deepEqual(dueKinds(evening, sub({ daily: false }), { ...night, omerTonight: null }), ['hilula']);
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

import { mightBeDue } from '@/lib/push/dispatch';

test('heartbeat pre-check: quarter-hour windows and Israel nightfall only', () => {
  assert.equal(mightBeDue(new Date('2026-10-21T05:00:30Z')), true);  // 08:00 Israel
  assert.equal(mightBeDue(new Date('2026-10-21T05:05:10Z')), true);  // still inside the window
  assert.equal(mightBeDue(new Date('2026-10-21T05:07:00Z')), false); // 08:07 — nothing can be due
  assert.equal(mightBeDue(new Date('2026-10-21T05:15:00Z')), true);
  // 21 Oct 2026: sunset 18:01 Israel (UTC+3) → nightfall 18:26. 18:37 is off-grid but inside
  // the nightfall window; 18:52 is past it.
  assert.equal(mightBeDue(new Date('2026-10-21T15:37:00Z')), true);
  assert.equal(mightBeDue(new Date('2026-10-21T15:52:00Z')), false);
});
