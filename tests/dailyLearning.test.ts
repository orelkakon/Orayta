import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toBlocks, attachExplain, cleanSegment } from '@/lib/dailyLearning/normalize';
import { learnStreak, toggleDate } from '@/lib/dailyLearning/log';
import { isLearnKind, israelDateKey } from '@/lib/dailyLearning/kinds';

// Shapes mirror live Sefaria v1 responses for each daily cycle.

test('single range: numbering starts at the first segment (Mishnah 11:4-5)', () => {
  const b = toBlocks({ he: ['א', 'ב'], sections: [11, 4], isSpanning: false }, 'perek');
  assert.equal(b.length, 1);
  assert.equal(b[0].heading, null);
  assert.deepEqual(b[0].segments.map(s => s.n), [4, 5]);
});

test('whole chapter (Rambam 1) numbers from 1', () => {
  const b = toBlocks({ he: ['x', 'y', 'z'], sections: [1] }, 'perek');
  assert.deepEqual(b[0].segments.map(s => s.n), [1, 2, 3]);
});

test('spanning chapters get a heading each (Rambam 5-7)', () => {
  const b = toBlocks({ he: [['a'], ['b', 'c'], ['d']], sections: [5], isSpanning: true }, 'perek');
  assert.deepEqual(b.map(x => x.heading), ['פרק ה׳', 'פרק ו׳', 'פרק ז׳']);
});

test('spanning verses: first block starts mid-chapter (Joshua 22:34-24:33)', () => {
  const b = toBlocks({ he: [['v34'], ['v1', 'v2'], ['v1']], sections: [22, 34], isSpanning: true }, 'perek');
  assert.deepEqual(b.map(x => x.heading), ['פרק כ״ב', 'פרק כ״ג', 'פרק כ״ד']);
  assert.deepEqual(b.map(x => x.segments[0].n), [34, 1, 1]);
});

test('a daf spans two amudim (Bekhorot 32)', () => {
  const b = toBlocks({
    he: [['a1', 'a2'], ['b1']], sections: ['32a'], isSpanning: true,
    spanningRefs: ['Bekhorot 32a', 'Bekhorot 32b'],
  }, 'amud');
  assert.deepEqual(b.map(x => x.heading), ['דף ל״ב עמוד א׳', 'דף ל״ב עמוד ב׳']);
});

test('single string (Tanya) and empty segments are dropped', () => {
  const b = toBlocks({ he: '<i data-overlay="Vilna Pages" data-value="x"></i> טקסט', sections: [26, 25] }, 'perek');
  assert.equal(b[0].segments[0].html, 'טקסט');
  assert.equal(b[0].segments[0].n, 25);
  assert.deepEqual(toBlocks({ he: ['', ''], sections: [1] }, 'perek'), []);
});

test('cleanSegment strips footnotes, attributes and scripts', () => {
  const html = 'שלום<sup class="footnote-marker">1</sup><i class="footnote">הערה</i> <b class="x">עולם</b><script>x()</script>';
  assert.equal(cleanSegment(html), 'שלום <b>עולם</b>');
});

test('Steinsaltz attaches segment by segment', () => {
  const main = toBlocks({ he: [['a1', 'a2'], ['b1']], sections: ['2a'], isSpanning: true, spanningRefs: ['X 2a', 'X 2b'] }, 'amud');
  const expl = toBlocks({ he: [['e1', 'e2'], ['f1']], sections: ['2a'], isSpanning: true, spanningRefs: ['X 2a', 'X 2b'] }, 'amud');
  const out = attachExplain(main, expl);
  assert.equal(out[0].segments[1].explain, 'e2');
  assert.equal(out[1].segments[0].explain, 'f1');
});

test('learn streak counts back from today or yesterday', () => {
  assert.equal(learnStreak(['2026-10-21', '2026-10-20', '2026-10-19'], '2026-10-21'), 3);
  assert.equal(learnStreak(['2026-10-20', '2026-10-19'], '2026-10-21'), 2);
  assert.equal(learnStreak(['2026-10-18'], '2026-10-21'), 0);
  assert.equal(learnStreak(['2026-03-01', '2026-02-28'], '2026-03-01'), 2); // across month end
});

test('toggleDate adds newest-first and removes', () => {
  assert.deepEqual(toggleDate(['2026-10-19'], '2026-10-21'), ['2026-10-21', '2026-10-19']);
  assert.deepEqual(toggleDate(['2026-10-21', '2026-10-19'], '2026-10-21'), ['2026-10-19']);
});

test('kinds and Israel date key', () => {
  assert.equal(isLearnKind('mishnah'), true);
  assert.equal(isLearnKind('nope'), false);
  assert.equal(israelDateKey(new Date('2026-10-20T22:30:00Z')), '2026-10-21'); // 01:30 IDT
});
