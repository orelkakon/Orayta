import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prayerDay, partApplies, showWeekdayPart, jerusalemSunTimes, suggestService } from '@/lib/siddur/calendar';
import { sanitizeSiddurHtml } from '@/lib/siddur/sanitize';
import { SERVICES, serviceNodes, sliceSegments } from '@/lib/siddur';

// Instants are given in UTC; Israel is UTC+3 in summer (IDT) and UTC+2 in winter (IST).
const at = (iso: string) => new Date(iso);
const minutesApart = (a: Date, b: Date) => Math.abs(a.getTime() - b.getTime()) / 60000;

test('prayerDay: weekday is taken in Israel time', () => {
  assert.equal(prayerDay(at('2026-10-19T21:30:00Z')).weekday, 2); // Tue 00:30 in Israel
  assert.equal(prayerDay(at('2026-10-19T12:00:00Z')).weekday, 1); // Mon
});

test('prayerDay: aseret yemei teshuva is Tishrei 1–10', () => {
  assert.equal(prayerDay(at('2026-09-15T09:00:00Z')).aseret, true);  // 4 Tishrei 5787
  assert.equal(prayerDay(at('2026-09-30T09:00:00Z')).aseret, false); // 19 Tishrei
});

test('conditional parts', () => {
  const part = { node: 'x', from: 1, to: 1 };
  const mon = { weekday: 1, aseret: false };
  const tue = { weekday: 2, aseret: false };
  assert.equal(partApplies({ ...part, when: 'mon-thu' }, mon), true);
  assert.equal(partApplies({ ...part, when: 'mon-thu' }, tue), false);
  assert.equal(partApplies({ ...part, when: 'aseret' }, { weekday: 2, aseret: true }), true);
  assert.equal(partApplies({ ...part, when: 'motzash' }, { weekday: 6, aseret: false }), true);
  assert.equal(partApplies({ ...part, when: 'optional' }, mon), false);
  assert.equal(partApplies(part, tue), true);
});

test('song of the day shows only today, all on Shabbat or on request', () => {
  const sun = { node: 'x', from: 1, to: 1, weekday: 0 };
  assert.equal(showWeekdayPart(sun, { weekday: 0, aseret: false }, false), true);
  assert.equal(showWeekdayPart(sun, { weekday: 3, aseret: false }, false), false);
  assert.equal(showWeekdayPart(sun, { weekday: 3, aseret: false }, true), true);
  assert.equal(showWeekdayPart(sun, { weekday: 6, aseret: false }, false), true);
});

test('Jerusalem sun times are close to published values', () => {
  const june = jerusalemSunTimes(at('2026-06-21T06:00:00Z'));
  assert.ok(minutesApart(june.sunset, at('2026-06-21T16:48:00Z')) < 6, `june sunset ${june.sunset.toISOString()}`);
  assert.ok(minutesApart(june.noon, at('2026-06-21T09:44:00Z')) < 6, `june noon ${june.noon.toISOString()}`);
  const dec = jerusalemSunTimes(at('2026-12-21T06:00:00Z'));
  assert.ok(minutesApart(dec.sunset, at('2026-12-21T14:39:00Z')) < 6, `dec sunset ${dec.sunset.toISOString()}`);
});

test('suggestService follows the day', () => {
  assert.equal(suggestService(at('2026-06-21T04:00:00Z')), 'shacharit'); // 07:00 IDT
  assert.equal(suggestService(at('2026-06-21T13:00:00Z')), 'mincha');    // 16:00 IDT
  assert.equal(suggestService(at('2026-06-21T18:30:00Z')), 'arvit');     // 21:30 IDT
  assert.equal(suggestService(at('2026-06-20T23:30:00Z')), 'arvit');     // 02:30 IDT, before dawn
  assert.equal(suggestService(at('2026-12-21T15:00:00Z')), 'arvit');     // 17:00 IST, after sunset
});

test('sanitizer keeps presentational tags only', () => {
  assert.equal(sanitizeSiddurHtml('<big><b>שמע</b></big><br/>'), '<big><b>שמע</b></big><br>');
  assert.equal(sanitizeSiddurHtml('<small class="x" onclick="evil()">הוראה</small>'), '<small>הוראה</small>');
  assert.equal(sanitizeSiddurHtml('<a href="javascript:x">קישור</a><img src=x onerror=y>'), 'קישור');
  assert.equal(sanitizeSiddurHtml('<script>alert(1)</script>ברוך'), 'ברוך');
});

test('service definitions are well-formed', () => {
  for (const s of SERVICES) {
    const ids = s.sections.map(x => x.id);
    assert.equal(new Set(ids).size, ids.length, `${s.id}: duplicate section ids`);
    for (const sec of s.sections) for (const p of sec.parts) {
      assert.ok(p.from >= 1 && p.to >= p.from, `${s.id}/${sec.id}: bad range ${p.from}-${p.to}`);
    }
    assert.ok(serviceNodes(s).length > 0);
  }
  assert.deepEqual(sliceSegments({ n: ['a', 'b', 'c', 'd'] }, { node: 'n', from: 2, to: 3 }), ['b', 'c']);
});
