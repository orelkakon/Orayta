import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifySource, cleanHost, cleanUtm, referrerHost, storedUtmSource } from '../src/lib/audience/source';
import { stripUtm, withShareUtm } from '../src/lib/audience/shareUtm';
import { addDays, computeDeviceStats, isUuid, validFirstDay } from '../src/lib/audience/devices';
import { computeSourceStats } from '../src/lib/audience/sourceStats';
import type { DeviceRow } from '../src/types/audience';
import { Prisma } from '@prisma/client';
import { isMissingTable } from '../src/lib/audience/missingTable';

const OWN = 'orayta-eight.vercel.app';
const cls = (ref: string, utmSource = '') => classifySource({ host: referrerHost(ref), ownHost: OWN, utmSource });

test('referrer is reduced to a bare hostname', () => {
  assert.equal(referrerHost('https://www.google.co.il/search?q=secret'), 'google.co.il');
  assert.equal(referrerHost('android-app://com.whatsapp/'), 'com.whatsapp');
  assert.equal(referrerHost(''), '');
  assert.equal(referrerHost('not a url'), '');
  assert.equal(cleanHost('evil host/<script>'), '');
});

test('known hostnames map to their bucket', () => {
  assert.equal(cls('https://l.instagram.com/?u=x'), 'instagram');
  assert.equal(cls('https://instagram.com/'), 'instagram');
  assert.equal(cls('android-app://com.instagram.android'), 'instagram');
  assert.equal(cls('https://wa.me/'), 'whatsapp');
  assert.equal(cls('https://api.whatsapp.com/send'), 'whatsapp');
  assert.equal(cls('https://web.whatsapp.com/'), 'whatsapp');
  assert.equal(cls('https://t.me/somechannel'), 'telegram');
  assert.equal(cls('android-app://org.telegram.messenger/'), 'telegram');
  assert.equal(cls('https://l.facebook.com/l.php'), 'facebook');
  assert.equal(cls('https://www.google.com/'), 'google');
  assert.equal(cls('https://www.google.co.il/'), 'google');
  assert.equal(cls('android-app://com.google.android.googlequicksearchbox/'), 'google');
  assert.equal(cls('https://mail.google.com/'), 'other');
  assert.equal(cls('https://www.bing.com/'), 'other-search');
  assert.equal(cls('https://duckduckgo.com/'), 'other-search');
  assert.equal(cls('https://example.org/page'), 'other');
  assert.equal(cls('https://notgoogle.com/'), 'other');
});

test('own host is internal; no referrer is direct', () => {
  assert.equal(cls(`https://${OWN}/feed`), 'internal');
  assert.equal(classifySource({ host: OWN, ownHost: `${OWN}:443`, utmSource: '' }), 'internal');
  assert.equal(cls(''), 'direct');
});

test('a known utm_source wins over the referrer; unknown ones mark a campaign', () => {
  assert.equal(cls('', 'whatsapp'), 'whatsapp');
  assert.equal(cls('https://t.me/x', 'instagram'), 'instagram');
  assert.equal(cls('', 'ig'), 'instagram');
  assert.equal(cls('', 'newsletter'), 'other');
  assert.equal(cls('https://wa.me/', 'newsletter'), 'whatsapp');
  assert.equal(cls('', 'share'), 'direct', 'an unknown-app share with no referrer stays direct');
});

test('UTM values are cleaned and capped', () => {
  assert.equal(cleanUtm('  Shabbat Campaign '), 'shabbat_campaign');
  assert.equal(cleanUtm('<b>x</b>'), 'bxb');
  assert.equal(cleanUtm('a'.repeat(80)).length, 40);
  assert.equal(cleanUtm(42), '');
  assert.equal(storedUtmSource('', 'share'), 'share');
  assert.equal(storedUtmSource('WhatsApp', 'share'), 'whatsapp');
  assert.equal(storedUtmSource('', 'email'), '');
});

test('share links get short UTM tags; the rest of the URL is untouched', () => {
  assert.equal(withShareUtm('https://x.app/tehillim/abc', 'tehillim', 'whatsapp'),
    'https://x.app/tehillim/abc?utm_source=whatsapp&utm_medium=share&utm_campaign=tehillim');
  assert.equal(withShareUtm('https://x.app/feed?i=rabbi.12', 'feed', 'native'),
    'https://x.app/feed?i=rabbi.12&utm_medium=share&utm_campaign=feed');
  assert.equal(withShareUtm('https://x.app/ask?q=%D7%90%20b', 'ask', 'telegram'),
    'https://x.app/ask?q=%D7%90%20b&utm_source=telegram&utm_medium=share&utm_campaign=ask');
  assert.equal(withShareUtm('https://x.app/#top', 'about', 'copy'), 'https://x.app/?utm_medium=share&utm_campaign=about#top');
});

test('stripUtm removes only utm_* params', () => {
  const u = stripUtm(new URL('https://x.app/play?code=123456&utm_source=whatsapp&utm_campaign=play'));
  assert.equal(u?.toString(), 'https://x.app/play?code=123456');
  assert.equal(stripUtm(new URL('https://x.app/feed?i=a.b')), null);
});

test('device id and first-day validation', () => {
  assert.ok(isUuid('3b241101-e2bb-4255-8caf-4136c566a962'));
  assert.ok(!isUuid('not-a-uuid'));
  assert.ok(!isUuid('3b241101-e2bb-4255-8caf-4136c566a96'));
  assert.equal(validFirstDay('2026-11-10', '2026-11-15'), '2026-11-10');
  assert.equal(validFirstDay('2026-11-16', '2026-11-15'), null, 'future');
  assert.equal(validFirstDay('2026-02-30', '2026-11-15'), null, 'not a real date');
  assert.equal(validFirstDay('2020-01-01', '2026-11-15'), null, 'before launch');
  assert.equal(addDays('2026-02-28', 1), '2026-03-01');
  assert.equal(addDays('2026-03-01', -1), '2026-02-28');
});

const TODAY = '2026-11-15';
const DAYS = Array.from({ length: 30 }, (_, i) => addDays(TODAY, i - 29));
const row = (day: string, idHash: string, firstDay: string | null): DeviceRow => ({ day, idHash, firstDay });

test('new vs returning, uniques and D1/D7', () => {
  const rows: DeviceRow[] = [
    // a: new 10 days ago, back next day and today
    row(addDays(TODAY, -10), 'a', addDays(TODAY, -10)), row(addDays(TODAY, -9), 'a', addDays(TODAY, -10)), row(TODAY, 'a', addDays(TODAY, -10)),
    // b: new 10 days ago, back two days later only
    row(addDays(TODAY, -10), 'b', addDays(TODAY, -10)), row(addDays(TODAY, -8), 'b', addDays(TODAY, -10)),
    // c: new today
    row(TODAY, 'c', TODAY),
    // d: legacy device (no first day), active today and 20 days ago
    row(TODAY, 'd', null), row(addDays(TODAY, -20), 'd', null),
    // e: new 3 days ago, never back (too recent for D7, counts for D1)
    row(addDays(TODAY, -3), 'e', addDays(TODAY, -3)),
  ];
  const s = computeDeviceStats(rows, DAYS);
  assert.deepEqual(s.today, { fresh: 1, returning: 2 });
  assert.equal(s.uniques7, 4);  // a, c, d, e
  assert.equal(s.uniques30, 5);
  assert.deepEqual(s.d1, { cohort: 3, returned: 1, pct: 33 });   // a, b, e — only a came back next day
  assert.deepEqual(s.d7, { cohort: 2, returned: 2, pct: 100 });  // a, b
  assert.equal(s.daily.length, 30);
  assert.equal(s.since, addDays(TODAY, -20));
});

test('empty input gives zeros and null rates', () => {
  const s = computeDeviceStats([], DAYS);
  assert.equal(s.uniques7, 0);
  assert.equal(s.d1.pct, null);
  assert.equal(s.since, null);
});

test('source stats: per-source windows and top campaigns', () => {
  const r = (day: string, source: string, utmSource: string, utmCampaign: string, count: number) =>
    ({ day, source, utmSource, utmCampaign, count });
  const out = computeSourceStats([
    r(TODAY, 'whatsapp', 'whatsapp', 'tehillim', 4),
    r(addDays(TODAY, -3), 'whatsapp', '', '', 2),
    r(addDays(TODAY, -20), 'google', '', '', 7),
    r(addDays(TODAY, -40), 'google', '', '', 99), // outside the window
    r(TODAY, 'direct', 'share', 'feed', 1),
  ], DAYS);
  const wa = out.rows.find(x => x.source === 'whatsapp');
  assert.deepEqual(wa, { source: 'whatsapp', today: 4, week: 6, month: 6 });
  assert.deepEqual(out.rows.find(x => x.source === 'google'), { source: 'google', today: 0, week: 0, month: 7 });
  assert.equal(out.rows[0].source, 'google', 'sorted by 30-day count');
  assert.equal(out.campaigns.length, 2);
  assert.deepEqual(out.campaigns[0], { utmSource: 'whatsapp', utmCampaign: 'tehillim', week: 4, month: 4 });
  assert.equal(out.since, addDays(TODAY, -40));
});

test('only "table does not exist" counts as the empty state', () => {
  const known = (code: string, meta?: Record<string, unknown>) =>
    new Prisma.PrismaClientKnownRequestError('x', { code, clientVersion: '5', meta });
  assert.ok(isMissingTable(known('P2021')));
  assert.ok(isMissingTable(known('P2010', { code: '42P01' })), 'raw query on a missing relation');
  assert.ok(!isMissingTable(known('P2010', { code: '42703' })), 'missing column is a real error');
  assert.ok(!isMissingTable(known('P2002')), 'unique violation');
  assert.ok(!isMissingTable(known('P1001')), 'database unreachable');
  assert.ok(!isMissingTable(new Error('timeout')));
});
