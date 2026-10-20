import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isMartyr } from '@/lib/martyrs';

test('the ten martyrs are recognised by their directory names', () => {
  assert.equal(isMartyr('רבי עקיבא'), true);
  assert.equal(isMartyr(' רבי ישבב הסופר '), true);
  assert.equal(isMartyr('רבי עקיבא איגר'), false);
  assert.equal(isMartyr('רבי מאיר בעל הנס'), false);
});
