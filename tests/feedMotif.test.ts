import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashSeed, rnd, dafPath, scrollPath, embers, MOTIFS_BY_TYPE } from '@/components/FeedView/motif/motifPaths';

test('a post always gets the same seed, different posts usually differ', () => {
  assert.equal(hashSeed('citation:abc'), hashSeed('citation:abc'));
  assert.notEqual(hashSeed('citation:abc'), hashSeed('citation:abd'));
  assert.ok(hashSeed('x') >= 0 && Number.isInteger(hashSeed('x')));
});

test('rnd stays in [0, 1) and is deterministic', () => {
  for (let s = 0; s < 200; s++) {
    for (let k = 0; k < 20; k++) {
      const v = rnd(s * 7919, k);
      assert.ok(v >= 0 && v < 1);
      assert.equal(v, rnd(s * 7919, k));
    }
  }
});

test('every feed type has two motifs and the drawings are well-formed', () => {
  for (const pair of Object.values(MOTIFS_BY_TYPE)) assert.equal(pair.length, 2);
  for (const seed of [0, 1, 123456, 4294967295]) {
    const daf = dafPath(seed);
    assert.equal(daf, dafPath(seed));
    assert.match(daf, /^M70 40H330V360H70Z/);
    assert.doesNotMatch(daf + scrollPath(seed), /NaN|undefined/);
  }
});

test('embers rise from the lower half with negative delays', () => {
  for (const e of embers(42)) {
    assert.ok(e.top >= 55 && e.top <= 100);
    assert.ok(e.delay <= 0 && e.dur >= 8);
  }
});
