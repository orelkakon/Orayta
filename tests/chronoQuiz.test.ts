import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickChronoSet, scoreOrder, isSorted, moveItem, chronoSorted, ChronoRabbi } from '@/lib/chronoQuiz';

const cats = ['tannaim', 'amoraim', 'geonim', 'rishonim', 'acharonim'];
const pool: ChronoRabbi[] = Array.from({ length: 60 }, (_, i) => ({
  id: `r${i}`, name: `r${i}`, sortYear: i * 37, category: cats[Math.floor(i / 12)], datePeriod: '',
}));

test('sets are scrambled, distinct and spaced by the level gap', () => {
  for (const [level, gap] of [['easy', 120], ['hard', 15]] as const) {
    for (let k = 0; k < 50; k++) {
      const set = pickChronoSet(pool, 5, level)!;
      assert.equal(set.length, 5);
      assert.equal(new Set(set.map(r => r.id)).size, 5);
      assert.ok(!isSorted(set));
      const years = set.map(r => r.sortYear).sort((a, b) => a - b);
      years.forEach((y, i) => { if (i) assert.ok(y - years[i - 1] >= gap); });
    }
  }
});

test('hard sets stay within neighbouring eras', () => {
  const order = ['tannaim', 'amoraim', 'geonim', 'rishonim', 'acharonim'];
  for (let k = 0; k < 30; k++) {
    const idx = pickChronoSet(pool, 4, 'hard')!.map(r => order.indexOf(r.category));
    assert.ok(Math.max(...idx) - Math.min(...idx) <= 2);
  }
});

test('too small a pool returns null', () => {
  assert.equal(pickChronoSet(pool.slice(0, 3), 4, 'easy'), null);
});

test('scoring is per position', () => {
  const [a, b, c, d] = pool;
  assert.deepEqual(scoreOrder([a, b, c, d]), { correct: [true, true, true, true], score: 1 });
  assert.deepEqual(scoreOrder([b, a, c, d]).correct, [false, false, true, true]);
  assert.equal(scoreOrder([d, c, b, a]).score, 0);
  assert.deepEqual(chronoSorted([c, a, b]).map(r => r.id), ['r0', 'r1', 'r2']);
});

test('moveItem reorders without mutating', () => {
  const arr = [1, 2, 3, 4];
  assert.deepEqual(moveItem(arr, 0, 2), [2, 3, 1, 4]);
  assert.deepEqual(moveItem(arr, 3, 0), [4, 1, 2, 3]);
  assert.deepEqual(arr, [1, 2, 3, 4]);
});
