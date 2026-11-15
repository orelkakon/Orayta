import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aliyaLabels, heTorahBook, heTorahRef, parsePart } from '../src/lib/parasha/refs';

test('Torah refs read in Hebrew, within and across chapters', () => {
  assert.equal(heTorahRef('Genesis 28:10-28:22'), 'בראשית כ״ח:י׳ – כ״ב');
  assert.equal(heTorahRef('Genesis 29:18-30:13'), 'בראשית כ״ט:י״ח – ל׳:י״ג');
  assert.equal(heTorahRef('Deuteronomy 32:1'), 'דברים ל״ב:א׳');
  assert.equal(heTorahRef('Exodus 15:16'), 'שמות ט״ו:ט״ז');
  assert.equal(heTorahRef('Hosea 11:7-12:12'), null);
  assert.equal(heTorahBook('Numbers 1:1-4:20'), 'במדבר');
});

test('seven aliyot and the maftir; other counts are numbered', () => {
  assert.deepEqual(aliyaLabels(8), ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'מפטיר']);
  assert.deepEqual(aliyaLabels(3), ['ראשון', 'שני', 'שלישי']);
});

test('reader parts: an aliya in range, the haftara or the whole parasha', () => {
  assert.equal(parsePart('0', 8), 0);
  assert.equal(parsePart('7', 8), 7);
  assert.equal(parsePart('8', 8), null);
  assert.equal(parsePart('h', 8), 'h');
  assert.equal(parsePart('all', 8), 'all');
  assert.equal(parsePart('-1', 8), null);
  assert.equal(parsePart(null, 8), null);
});
