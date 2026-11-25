import { test } from 'node:test';
import assert from 'node:assert/strict';
import { conceptsOf, queryKeys, stemOf, textKeys, unprefixed } from '@/lib/rabbiBot/stem';
import { classicalWords } from '@/lib/rabbiBot/vocab';
import { contentWords, saQuery } from '@/lib/rabbiBot/saQuery';

const meet = (asked: string, written: string) => {
  const keys = new Set(textKeys(written));
  return queryKeys(asked).find(k => keys.has(k.key))?.weight ?? 0;
};

test('inflections of one word share a stem', () => {
  assert.equal(stemOf('מברכים'), stemOf('מברך'));
  assert.equal(stemOf('מברכין'), stemOf('מברך'));
  assert.equal(stemOf('ברכות'), stemOf('ברכה'));
  assert.equal(stemOf('ברכת'), stemOf('ברכה'));
  assert.equal(stemOf('מצות'), stemOf('מצה'));
  assert.equal(stemOf('להצילו'), stemOf('להציל'));
  assert.equal(stemOf('שבת'), 'שבת', 'a short word keeps its ת');
});

test('prefixes: one letter, or two only as Hebrew combines them', () => {
  assert.deepEqual(unprefixed('והשותה'), ['השותה', 'שותה']);
  assert.deepEqual(unprefixed('כשערב'), ['שערב', 'ערב']);
  assert.deepEqual(unprefixed('מברכים'), ['ברכים'], 'מ + ב is no prefix pair');
  assert.deepEqual(unprefixed('מים'), [], 'three letters stay whole');
});

test('a stricter match counts more', () => {
  assert.equal(meet('זימון', 'זימון'), 1);
  assert.ok(meet('זימון', 'זמן') < 1, 'זימון and זמן share only a skeleton');
  assert.ok(meet('מברכים', 'מברך') > 0);
  assert.ok(meet('בשבת', 'ובשבת') > 0);
  assert.equal(meet('מברכים', 'וכרכים'), 0, 'never two prefix letters on each side');
  assert.equal(meet('תפילין', 'תפילין'), 1);
  assert.ok(meet('תפילין', 'תפלה') < meet('תפילין', 'תפילין'));
});

test('words of one stem are one concept', () => {
  const shared = (a: string, b: string) => conceptsOf(a).some(s => conceptsOf(b).includes(s));
  assert.ok(shared('מברכים', 'ברכת'));
  assert.ok(shared('ברכות', 'לברך'));
  assert.ok(!shared('מים', 'מברכים'));
});

test('modern words find their classical names, with a prefix too', () => {
  assert.deepEqual(classicalWords('סיר'), ['קדרה']);
  assert.ok(classicalWords('מגוי').includes('נכרי'));
  assert.ok(classicalWords('תחנון').includes('נפילת'));
  assert.deepEqual(classicalWords('שולחן'), []);
});

test('the query keeps two-letter subjects and weighs the asker first', () => {
  assert.ok(contentWords('מותר לאכול דג עם בשר?').includes('דג'));
  assert.ok(!contentWords('מה יש על זה?').some(w => w.length === 2));
  const q = saQuery('מותר להחזיר סיר לפלטה בשבת?', ['חזרה']);
  assert.equal(q.find(w => w.word === 'סיר')?.weight, 1);
  assert.equal(q.find(w => w.word === 'קדרה')?.weight, 0.8);
  assert.equal(q.find(w => w.word === 'חזרה')?.weight, 1);
});
