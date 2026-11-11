import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildTimeline, centuryLetters, centuryOf, centuryYears, initialOf } from '../src/lib/rabbisTimeline';

const r = (name: string, sortYear: number, category = 'rishonim') => ({ name, sortYear, category });

test('centuries are signed and skip zero', () => {
  assert.equal(centuryOf(1), 1);
  assert.equal(centuryOf(100), 1);
  assert.equal(centuryOf(101), 2);
  assert.equal(centuryOf(1984), 20);
  assert.equal(centuryOf(0), 1);
  assert.equal(centuryOf(-1), -1);
  assert.equal(centuryOf(-100), -1);
  assert.equal(centuryOf(-101), -2);
  assert.equal(centuryOf(-3760), -38);
});

test('the years of a century read in order', () => {
  assert.deepEqual(centuryYears(12), { from: 1101, to: 1200, bce: false });
  assert.deepEqual(centuryYears(1), { from: 1, to: 100, bce: false });
  assert.deepEqual(centuryYears(-5), { from: 500, to: 401, bce: true });
  assert.deepEqual(centuryYears(-1), { from: 100, to: 1, bce: true });
});

test('century letters carry geresh or gershayim', () => {
  assert.equal(centuryLetters(5), 'ה׳');
  assert.equal(centuryLetters(12), 'י״ב');
  assert.equal(centuryLetters(-16), 'ט״ז');
  assert.equal(centuryLetters(20), 'כ׳');
  assert.equal(centuryLetters(-38), 'ל״ח');
});

test('the medallion letter skips the title', () => {
  assert.equal(initialOf('רבי עקיבא'), 'ע');
  assert.equal(initialOf('הרב עובדיה יוסף'), 'ע');
  assert.equal(initialOf('רבן גמליאל'), 'ג');
  assert.equal(initialOf('רב'), 'ר');
  assert.equal(initialOf('רבא'), 'ר');
  assert.equal(initialOf('משה רבנו'), 'מ');
});

test('one line in order, grouped by century, with the gaps between', () => {
  const secs = buildTimeline([
    r('ג', 1140), r('א', -3760, 'torah'), r('ב', -50, 'zugot'), r('ב2', 40, 'tannaim'),
    r('ג2', 1105, 'rishonim'), r('ד', 1350, 'rishonim'), r('ג3', 1190, 'acharonim'),
  ]);
  assert.deepEqual(secs.map(s => s.century), [-38, -1, 1, 12, 14]);
  assert.deepEqual(secs.map(s => s.gap), [0, 36, 0, 10, 1]);
  assert.deepEqual(secs.map(s => s.start), [0, 1, 2, 3, 6]);
  assert.deepEqual(secs[3].items.map(x => x.name), ['ג2', 'ג', 'ג3']);
  assert.deepEqual(secs[3].categories, ['rishonim', 'acharonim']);
});

test('equal years keep their given order, and nothing gives nothing', () => {
  assert.deepEqual(buildTimeline([r('א', 500), r('ב', 500)])[0].items.map(x => x.name), ['א', 'ב']);
  assert.deepEqual(buildTimeline([]), []);
});
