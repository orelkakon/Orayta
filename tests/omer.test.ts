import { test } from 'node:test';
import assert from 'node:assert/strict';
import { omerCount, omerStatus, getOmerDay, nextOmerStart, omerStreak, omerGap } from '@/lib/omer';
import { prayerDay, conditionApplies } from '@/lib/siddur/calendar';
import { todaySpecials, occasionLabels } from '@/lib/siddur/today';
import { getService, sliceSegments } from '@/lib/siddur';
import { israelDateKey } from '@/lib/dailyLearning/kinds';

// 15 Nisan 5786 = 2 Apr 2026; 5 Sivan 5786 = 21 May 2026; 15 Nisan 5787 = 22 Apr 2027 (Intl Hebrew calendar).
// Israel is UTC+3 in this season; Jerusalem sunset is ~19:00–19:40 local.
const at = (iso: string) => new Date(iso);

test('count wording: singular/plural, teens, tens, weeks and remainders', () => {
  assert.equal(omerCount(1)?.text, 'יוֹם אֶחָד לָעֹמֶר:');
  assert.equal(omerCount(2)?.text, 'שְׁנֵי יָמִים לָעֹמֶר:');
  assert.equal(omerCount(7)?.text, 'שִׁבְעָה יָמִים לָעֹמֶר, שֶׁהֵם שָׁבוּעַ אֶחָד:');
  assert.equal(omerCount(10)?.text, 'עֲשָׂרָה יָמִים לָעֹמֶר, שֶׁהֵם שָׁבוּעַ אֶחָד וּשְׁלֹשָׁה יָמִים:');
  assert.equal(omerCount(11)?.text, 'אַחַד עָשָׂר יוֹם לָעֹמֶר, שֶׁהֵם שָׁבוּעַ אֶחָד וְאַרְבָּעָה יָמִים:');
  assert.equal(omerCount(20)?.text, 'עֶשְׂרִים יוֹם לָעֹמֶר, שֶׁהֵם שְׁנֵי שָׁבוּעוֹת וְשִׁשָּׁה יָמִים:');
  assert.equal(omerCount(22)?.text, 'שְׁנַיִם וְעֶשְׂרִים יוֹם לָעֹמֶר, שֶׁהֵם שְׁלֹשָׁה שָׁבוּעוֹת וְיוֹם אֶחָד:');
  assert.equal(omerCount(33)?.text, 'שְׁלֹשָׁה וּשְׁלֹשִׁים יוֹם לָעֹמֶר, שֶׁהֵם אַרְבָּעָה שָׁבוּעוֹת וַחֲמִשָּׁה יָמִים:');
  assert.equal(omerCount(49)?.text, 'תִּשְׁעָה וְאַרְבָּעִים יוֹם לָעֹמֶר, שֶׁהֵם שִׁבְעָה שָׁבוּעוֹת:');
  assert.equal(omerCount(0), null);
  assert.equal(omerCount(50), null);
});

test('sefira of the day: inner sefira within the week\'s sefira', () => {
  assert.equal(omerCount(1)?.sefira, 'חסד שבחסד');
  assert.equal(omerCount(2)?.sefira, 'גבורה שבחסד');
  assert.equal(omerCount(8)?.sefira, 'חסד שבגבורה');
  assert.equal(omerCount(33)?.sefira, 'הוד שבהוד');
  assert.equal(omerCount(49)?.sefira, 'מלכות שבמלכות');
});

test('15 Nisan afternoon: nothing counted yet, day 1 tonight', () => {
  const s = omerStatus(at('2026-04-02T12:00:00Z')); // 15:00 IDT
  assert.deepEqual(s, { isNight: false, tonight: 1, today: null });
  assert.equal(nextOmerStart(at('2026-04-02T12:00:00Z')), null);
});

test('after sunset the count is already tonight\'s (next Hebrew day)', () => {
  assert.deepEqual(omerStatus(at('2026-04-02T17:30:00Z')), { isNight: true, tonight: 1, today: null }); // 20:30 IDT
  assert.equal(getOmerDay(at('2026-04-02T17:30:00Z')), 1);
});

test('after midnight, before dawn, the same night is still counted', () => {
  assert.deepEqual(omerStatus(at('2026-04-02T23:30:00Z')), { isNight: true, tonight: 1, today: null }); // 02:30 IDT, 16 Nisan
});

test('16 Nisan by day: last night was 1 (forgot → count without bracha), tonight 2', () => {
  assert.deepEqual(omerStatus(at('2026-04-03T09:00:00Z')), { isNight: false, tonight: 2, today: 1 });
  assert.equal(getOmerDay(at('2026-04-03T09:00:00Z')), 2);
});

test('the 49th day and Shavuot night', () => {
  assert.equal(getOmerDay(at('2026-05-20T18:00:00Z')), 49); // 21:00 IDT, night of 5 Sivan
  assert.deepEqual(omerStatus(at('2026-05-21T09:00:00Z')), { isNight: false, tonight: null, today: 49 });
  assert.deepEqual(omerStatus(at('2026-05-21T18:00:00Z')), { isNight: true, tonight: null, today: null }); // Shavuot night
});

test('out of season: next count begins on the evening of 15 Nisan 5787', () => {
  const start = nextOmerStart(at('2026-10-21T09:00:00Z'));
  assert.ok(start);
  assert.equal(israelDateKey(start), '2027-04-22');
  assert.equal(getOmerDay(at('2026-10-21T09:00:00Z')), null);
  assert.equal(israelDateKey(nextOmerStart(at('2026-05-21T18:00:00Z')) ?? new Date(0)), '2027-04-22');
});

test('5787 season: first and last days', () => {
  assert.equal(omerStatus(at('2027-04-23T09:00:00Z')).today, 1);
  assert.equal(omerStatus(at('2027-06-10T09:00:00Z')).today, 49);
  assert.equal(omerStatus(at('2027-06-10T09:00:00Z')).tonight, null);
});

test('arvit gets the omer section with only tonight\'s count', () => {
  const d = prayerDay(at('2026-04-02T15:00:00Z'), 'arvit'); // 18:00 IDT → night of 16 Nisan
  assert.equal(d.omerDay, 1);
  assert.equal(conditionApplies('omer', d), true);
  assert.equal(conditionApplies('omer-1', d), true);
  assert.equal(conditionApplies('omer-2', d), false);
  assert.ok(todaySpecials(getService('arvit'), d).some(s => s.anchor === 'omer'));
  assert.ok(occasionLabels(d).some(l => l.includes('לעומר')));

  const ord = prayerDay(at('2026-10-20T15:00:00Z'), 'arvit');
  assert.equal(ord.omerDay, null);
  assert.equal(conditionApplies('omer', ord), false);
});

test('omer parts map to Sefaria segments: count n = 3n+3, sefira 3n+4, close 152–161', () => {
  const omer = getService('arvit').sections.find(s => s.id === 'omer');
  assert.ok(omer);
  const fake = { 'Counting_of_the_Omer': Array.from({ length: 161 }, (_, i) => String(i + 1)) };
  const day16 = omer.parts.find(p => p.when === 'omer-16');
  assert.ok(day16?.only);
  assert.deepEqual(sliceSegments(fake, day16), ['51', '52']);
  const last = omer.parts[omer.parts.length - 1];
  assert.deepEqual([last.from, last.to], [152, 161]);
  assert.equal(omer.parts.filter(p => p.when?.startsWith('omer-')).length, 49);
});

test('check-off streak and gaps', () => {
  assert.equal(omerStreak([1, 2, 3], 4), 3);
  assert.equal(omerStreak([1, 2, 3, 4], 4), 4);
  assert.equal(omerStreak([1, 3, 4], 4), 2);
  assert.equal(omerStreak([], 4), 0);
  assert.equal(omerGap([1, 2, 4], 5), 3);
  assert.equal(omerGap([3, 4], 5), null);
  assert.equal(omerGap([], 5), null);
});
