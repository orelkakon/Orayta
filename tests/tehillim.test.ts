import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unitCount, unitAt, unitTitle, unitRange, unitShort, unitChapters, numeral } from '@/lib/tehillim/units';
import { pickUnit, openRound, cellsOf, completedRounds, type ClaimRow } from '@/lib/tehillim/assign';
import { circleStats } from '@/lib/tehillim/stats';
import { validateCreate, newSlug, isSlug, isClosed, cleanLine } from '@/lib/tehillim/rules';

const HOLD = 20 * 60_000;
const NOW = Date.parse('2026-11-10T10:00:00Z');
let seq = 0;
const claim = (round: number, unit: number, status: 'held' | 'done', ago = 60_000, over: Partial<ClaimRow> = {}): ClaimRow => ({
  id: `c${seq++}`, round, unit, status, heldAt: NOW - ago, doneAt: status === 'done' ? NOW - ago + 30_000 : null,
  readerHash: `r${unit % 3}`, readerName: null, ...over,
});

test('units: 119 split into 22 letters, 30 days, 5 books', () => {
  assert.equal(unitCount('chapter'), 171);
  assert.equal(unitCount('day'), 30);
  assert.equal(unitCount('book'), 5);
  assert.deepEqual(unitAt('chapter', 118)?.segments, [{ chapter: 119, from: 1, to: 8 }]);
  assert.deepEqual(unitAt('chapter', 139)?.segments, [{ chapter: 119, from: 169, to: 176 }]);
  assert.deepEqual(unitAt('chapter', 140)?.segments, [{ chapter: 120 }]);
  assert.equal(unitTitle('chapter', 22), 'פרק כ״ג');
  assert.equal(unitTitle('chapter', 119), 'פרק קי״ט · אות ב׳');
  assert.equal(unitShort('chapter', 119), 'ב');
  assert.equal(unitTitle('day', 4), 'יום ה׳');
  assert.equal(unitRange('day', 4), 'פרקים כ״ט–ל״ד');
  assert.equal(unitRange('day', 25), 'פרק קי״ט, פסוקים צ״ז–קע״ו');
  assert.equal(unitTitle('book', 1), 'ספר שני');
  assert.equal(numeral(15), 'ט״ו');
  // Whole chapters across one full round: always 150.
  const total = (m: 'chapter' | 'day' | 'book') => Array.from({ length: unitCount(m) }, (_, i) => unitChapters(m, i)).reduce((a, b) => a + b, 0);
  assert.equal(total('chapter'), 150);
  assert.equal(total('day'), 150);
  assert.equal(total('book'), 150);
});

test('pickUnit: free units of the lowest round, expired holds are reused, then a new round', () => {
  const rng = () => 0;
  assert.deepEqual(pickUnit([], 5, NOW, HOLD, null, rng), { kind: 'new', round: 1, unit: 0 });
  const r1 = [claim(1, 0, 'done'), claim(1, 1, 'held'), claim(1, 2, 'held', HOLD + 1000)];
  const p = pickUnit(r1, 5, NOW, HOLD, null, rng);
  assert.equal(p.kind, 'reuse'); // unit 2's hold expired; free units: 2, 3, 4
  assert.equal(p.unit, 2);
  // Everything taken in round 1 → round 2 opens in parallel
  const full = [0, 1, 2, 3, 4].map(u => claim(1, u, 'held'));
  assert.deepEqual(pickUnit(full, 5, NOW, HOLD, null, rng), { kind: 'new', round: 2, unit: 0 });
  // A unit picked on the map: taken in round 1 → round 2
  assert.deepEqual(pickUnit(r1, 5, NOW, HOLD, 1, rng), { kind: 'new', round: 2, unit: 1 });
  assert.deepEqual(pickUnit(r1, 5, NOW, HOLD, 3, rng), { kind: 'new', round: 1, unit: 3 });
});

test('rounds: open round, completed books and the map cells', () => {
  const done1 = [0, 1, 2].map(u => claim(1, u, 'done'));
  const rows = [...done1, claim(2, 0, 'done'), claim(2, 1, 'held'), claim(2, 2, 'held', HOLD * 2)];
  assert.equal(completedRounds(rows, 3), 1);
  assert.equal(openRound(rows, 3), 2);
  assert.deepEqual(cellsOf(rows, 3, 2, NOW, HOLD), ['done', 'held', 'free']);
  assert.equal(openRound([], 3), 1);
});

test('circleStats: readers, live holds, today and the activity buckets', () => {
  const rows = [
    claim(1, 0, 'done', 5 * 60_000, { readerName: 'רחל' }),
    claim(1, 1, 'done', 2 * 3600_000, { readerName: 'רחל' }),
    claim(1, 2, 'done', 3 * 86_400_000),
    claim(1, 3, 'held'),
    claim(1, 4, 'held', HOLD * 3),
  ];
  const s = circleStats(rows, 'chapter', NOW, HOLD);
  assert.equal(s.readUnits, 3);
  assert.equal(s.chapters, 3);
  assert.equal(s.live, 1);
  assert.equal(s.today, 2);
  assert.equal(s.hourly.reduce((a, b) => a + b, 0), 2);
  assert.equal(s.daily[13], 2);
  assert.equal(s.daily.reduce((a, b) => a + b, 0), 3);
  assert.deepEqual(s.named, [{ name: 'רחל', count: 2 }]);
  assert.equal(s.recent[0].unit, 0);
});

test('validateCreate: names, purpose, goal and end date', () => {
  const now = new Date('2026-11-10T10:00:00Z');
  const ok = validateCreate({ purpose: 'refua', names: ['משה בן שרה'], mode: 'chapter', goal: 1 }, now);
  assert.ok(ok.ok);
  assert.deepEqual(validateCreate({ purpose: 'x', names: ['א ב'], mode: 'chapter', goal: 1 }, now), { ok: false, field: 'purpose' });
  assert.deepEqual(validateCreate({ purpose: 'refua', names: [], mode: 'chapter', goal: 1 }, now), { ok: false, field: 'names' });
  assert.deepEqual(validateCreate({ purpose: 'refua', names: ['www.spam.com'], mode: 'chapter', goal: 1 }, now), { ok: false, field: 'names' });
  assert.deepEqual(validateCreate({ purpose: 'refua', names: ['משה'], mode: 'chapter', goal: 1, endsAt: '2026-11-01' }, now), { ok: false, field: 'endsAt' });
  const dated = validateCreate({ purpose: 'neshama', names: ['שרה בת אברהם'], mode: 'day', goal: 0, endsAt: '2026-11-20', note: 'שורה\n\n\n\nשנייה' }, now);
  assert.ok(dated.ok && dated.value.endsAt && dated.value.note === 'שורה\n\nשנייה');
  assert.equal(cleanLine('‮שלום‏  עולם', 40), 'שלום עולם');
});

test('slugs and closing', () => {
  const s = newSlug();
  assert.ok(isSlug(s));
  assert.equal(isSlug('ABC'), false);
  assert.equal(isClosed({ closed: false, endsAt: null }, NOW), false);
  assert.equal(isClosed({ closed: false, endsAt: new Date(NOW - 1) }, NOW), true);
  assert.equal(isClosed({ closed: true, endsAt: null }, NOW), true);
});

import { bookletVerse } from '@/lib/tehillim/text';

test('bookletVerse: no teamim, paseq or section marks; qere read, ketiv dropped', () => {
  assert.equal(bookletVerse('הַלְלוּ־יָ֨הּ ׀ אוֹדֶ֣ה'), 'הַלְלוּ־יָהּ אוֹדֶה');
  assert.equal(bookletVerse('עֹמֶדֶת לָעַד׃ {פ}'), 'עֹמֶדֶת לָעַד׃');
  assert.equal(bookletVerse('יֹאמֵרוּ (וגדלותיך) [וּגְדֻלָּתְךָ] אֲסַפְּרֶנָּה'), 'יֹאמֵרוּ וּגְדֻלָּתְךָ אֲסַפְּרֶנָּה');
  assert.equal(bookletVerse('אָמַר (בְּלִבּוֹ) הוּא'), 'אָמַר (בְּלִבּוֹ) הוּא');
});

test('bookletVerse trims trailing breaks', () => {
  assert.equal(bookletVerse('וָעֶד׃&nbsp; <br>'), 'וָעֶד׃');
});
