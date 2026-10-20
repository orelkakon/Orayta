import { test } from 'node:test';
import assert from 'node:assert/strict';
import { matchYahrzeitRabbis, normalizeHebDate } from '@/lib/yahrzeit';

const r = (deathDate: string | null) => ({ deathDate });

test('spelling variants of the month match hebcal', () => {
  assert.equal(normalizeHebDate('ט"ו סיוון'), normalizeHebDate('ט״ו סיון'));
  assert.equal(normalizeHebDate('א מרחשוון'), normalizeHebDate('א חשוון'));
});

test('matches deathDate against hebcal parts', () => {
  const rabbis = [r('י חשוון'), r('א מרחשוון'), r('כ"ה סיוון'), r(null), r('י"א חשוון')];
  assert.deepEqual(matchYahrzeitRabbis(rabbis, { hd: 10, hm: 'Cheshvan' }), [rabbis[0]]);
  assert.deepEqual(matchYahrzeitRabbis(rabbis, { hd: 1, hm: 'Cheshvan' }), [rabbis[1]]);
  assert.deepEqual(matchYahrzeitRabbis(rabbis, { hd: 25, hm: 'Sivan' }), [rabbis[2]]);
});
