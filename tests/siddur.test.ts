import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prayerDay, conditionApplies, showWeekdayPart, jerusalemSunTimes, suggestService } from '@/lib/siddur/calendar';
import { todaySpecials } from '@/lib/siddur/today';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { fill } from '@/lib/siddur/parts';
import { SERVICES, getService, serviceNodes, sliceSegments } from '@/lib/siddur';

// Morning in Israel unless stated; fixtures were checked against the Intl Hebrew calendar.
const day = (iso: string, service: 'shacharit' | 'mincha' | 'arvit' = 'shacharit', time = '06:00:00Z') =>
  prayerDay(new Date(`${iso}T${time}`), service);
const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

test('ordinary Tuesday: tachanun, winter, nothing special', () => {
  const d = day('2026-10-20'); // 9 Cheshvan 5787
  assert.equal(d.tachanun, true);
  assert.equal(d.occasions.has('winter'), true);
  assert.equal(conditionApplies('torah-reading', d), false);
  assert.deepEqual(todaySpecials(getService('shacharit'), d), []);
});

test('rain season starts on 7 Cheshvan', () => {
  assert.equal(day('2026-10-17').occasions.has('winter'), false); // 6 Cheshvan
  assert.equal(day('2026-10-18').occasions.has('winter'), true);  // 7 Cheshvan
});

test('Rosh Chodesh (Monday): hallel, yaale veyavo, torah, mussaf; no tachanun', () => {
  const d = day('2026-10-12'); // 1 Cheshvan
  assert.equal(d.occasions.has('rosh-chodesh'), true);
  assert.equal(d.noTachanunReason, 'ראש חודש');
  for (const c of ['hallel', 'yaale', 'torah-reading', 'no-tachanun'] as const) assert.equal(conditionApplies(c, d), true, c);
  assert.equal(conditionApplies('full-hallel', d), false);
  const labels = todaySpecials(getService('shacharit'), d).map(s => s.label);
  for (const l of ['יעלה ויבוא', 'הלל', 'קריאת התורה', 'מוסף לראש חודש', 'ברכי נפשי']) assert.ok(labels.includes(l), l);
  assert.ok(!labels.includes('וידוי ותחנון'));
});

test('arvit from midday belongs to the next Hebrew day (Rosh Chodesh night, motzash)', () => {
  const d = day('2026-10-10', 'arvit', '15:00:00Z'); // Sat 18:00 → night of 30 Tishri
  assert.equal(d.occasions.has('rosh-chodesh'), true);
  assert.equal(d.occasions.has('motzash'), true);
  assert.equal(day('2026-10-10', 'shacharit').occasions.has('rosh-chodesh'), false);
});

test('Chanukah: day number, full hallel, al hanisim, today\'s reading only', () => {
  const d = day('2026-12-07'); // 27 Kislev
  assert.equal(d.chanukahDay, 3);
  assert.equal(d.noTachanunReason, 'חנוכה');
  assert.equal(conditionApplies('full-hallel', d), true);
  assert.equal(conditionApplies('al-hanisim', d), true);
  assert.equal(conditionApplies('chanukah-3', d), true);
  assert.equal(conditionApplies('chanukah-4', d), false);
  const rcTevet = day('2026-12-11'); // 1 Tevet = day 7 + Rosh Chodesh
  assert.equal(rcTevet.chanukahDay, 7);
  assert.equal(rcTevet.occasions.has('rosh-chodesh'), true);
  assert.equal(day('2026-12-13').chanukahDay, null); // 3 Tevet, after Chanukah (Kislev had 30 days)
});

test('fasts, including the Ta\'anit Esther that moves to Thursday', () => {
  assert.equal(day('2026-09-14').occasions.has('fast-gedalia'), true);
  assert.equal(day('2026-12-20').occasions.has('fast-tevet'), true);
  assert.equal(day('2026-07-02').occasions.has('fast-tammuz'), true);
  assert.equal(day('2026-07-23').occasions.has('tisha-bav'), true);
  assert.equal(day('2025-08-03').occasions.has('tisha-bav'), true);     // 9 Av on Sunday
  assert.equal(day('2027-03-22').occasions.has('fast-esther'), true);   // 13 Adar II, Monday
  assert.equal(day('2028-03-09').occasions.has('fast-esther'), true);   // 11 Adar, Thursday (13th is Shabbat)
  assert.equal(day('2028-03-11').occasions.has('fast'), false);
  const d = day('2026-09-14');
  assert.equal(conditionApplies('fast', d), true);
  assert.equal(conditionApplies('public-fast', d), true);
  assert.equal(conditionApplies('public-fast', day('2026-07-23')), false);
});

test('purim and purim katan', () => {
  const purim = day('2027-03-23'); // 14 Adar II
  assert.equal(purim.occasions.has('purim'), true);
  assert.equal(conditionApplies('al-hanisim', purim), true);
  const katan = day('2027-02-21'); // 14 Adar I
  assert.equal(katan.occasions.has('purim'), false);
  assert.equal(katan.noTachanunReason, 'פורים קטן');
});

test('tachanun rules', () => {
  assert.equal(day('2026-09-22').noTachanunReason, 'מערב יום הכיפורים עד סוף תשרי'); // 11 Tishrei
  assert.equal(day('2026-09-22').occasions.has('after-yk'), true);
  assert.equal(day('2027-04-23').noTachanunReason, 'חודש ניסן');
  assert.equal(day('2027-04-23').occasions.has('chol-hamoed'), true);
  assert.equal(day('2027-05-21').noTachanunReason, 'פסח שני');
  assert.equal(day('2027-06-07').noTachanunReason, 'מראש חודש סיון עד י״ב בו');
  assert.equal(day('2026-09-14').tachanun, true); // Tzom Gedalia: tachanun is said
  // Friday: tachanun at shacharit, not at mincha.
  assert.equal(day('2026-10-23', 'shacharit').tachanun, true);
  assert.equal(day('2026-10-23', 'mincha').noTachanunReason, 'מנחה של ערב שבת');
});

test('song of the day shows only today, all on Shabbat or on request', () => {
  const sun = { node: 'x', from: 1, to: 1, weekday: 0 };
  const wed = day('2026-10-21');
  assert.equal(showWeekdayPart(sun, wed, false), false);
  assert.equal(showWeekdayPart(sun, wed, true), true);
  assert.equal(showWeekdayPart(sun, day('2026-10-17'), false), true); // Shabbat
});

test('Jerusalem sun times are close to published values', () => {
  const june = jerusalemSunTimes(new Date('2026-06-21T06:00:00Z'));
  assert.ok(minutesApart(june.sunset, new Date('2026-06-21T16:48:00Z')) < 6, june.sunset.toISOString());
  assert.ok(minutesApart(june.noon, new Date('2026-06-21T09:44:00Z')) < 6, june.noon.toISOString());
  const dec = jerusalemSunTimes(new Date('2026-12-21T06:00:00Z'));
  assert.ok(minutesApart(dec.sunset, new Date('2026-12-21T14:39:00Z')) < 6, dec.sunset.toISOString());
});

test('suggestService follows the day', () => {
  assert.equal(suggestService(new Date('2026-06-21T04:00:00Z')), 'shacharit'); // 07:00 IDT
  assert.equal(suggestService(new Date('2026-06-21T13:00:00Z')), 'mincha');    // 16:00 IDT
  assert.equal(suggestService(new Date('2026-06-21T18:30:00Z')), 'arvit');     // 21:30 IDT
  assert.equal(suggestService(new Date('2026-06-20T23:30:00Z')), 'arvit');     // 02:30 IDT
  assert.equal(suggestService(new Date('2026-12-21T15:00:00Z')), 'arvit');     // 17:00 IST
});

test('sanitizer keeps presentational tags only', () => {
  assert.equal(sanitizeSiddurHtml('<big><b>שמע</b></big><br/>'), '<big><b>שמע</b></big><br>');
  assert.equal(sanitizeSiddurHtml('<small class="x" onclick="evil()">הוראה</small>'), '<small>הוראה</small>');
  assert.equal(sanitizeSiddurHtml('<a href="javascript:x">קישור</a><img src=x onerror=y>'), 'קישור');
  assert.equal(sanitizeSiddurHtml('<script>alert(1)</script>ברוך'), 'ברוך');
});

test('fill covers a node with specials in place and no gaps', () => {
  const parts = fill('n', 2, 10, [{ from: 4, to: 5, mark: 'a' }, { from: 9, to: 10, mark: 'b' }]);
  assert.deepEqual(parts.map(p => [p.from, p.to, p.mark ?? null]), [[2, 3, null], [4, 5, 'a'], [6, 8, null], [9, 10, 'b']]);
});

test('service definitions are well-formed', () => {
  for (const s of SERVICES) {
    const ids = s.sections.map(x => x.id);
    assert.equal(new Set(ids).size, ids.length, `${s.id}: duplicate section ids`);
    for (const sec of s.sections) {
      for (const p of sec.parts) {
        assert.ok(p.from >= 1 && p.to >= p.from, `${s.id}/${sec.id}: bad range ${p.from}-${p.to}`);
        if (p.when && !p.only && !p.mark) assert.fail(`${s.id}/${sec.id}: conditional part ${p.from}-${p.to} needs a mark`);
      }
      // Within one node, parts must not overlap.
      const byNode = new Map<string, [number, number][]>();
      sec.parts.forEach(p => byNode.set(p.node, [...(byNode.get(p.node) ?? []), [p.from, p.to]]));
      byNode.forEach((ranges, node) => {
        const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
        sorted.forEach((r, i) => { if (i > 0) assert.ok(r[0] > sorted[i - 1][1], `${s.id}/${sec.id}: overlap in ${node}`); });
      });
    }
    assert.ok(serviceNodes(s).length > 0);
  }
  assert.deepEqual(sliceSegments({ n: ['a', 'b', 'c', 'd'] }, { node: 'n', from: 2, to: 3 }), ['b', 'c']);
});
