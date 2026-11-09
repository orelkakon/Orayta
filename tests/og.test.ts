import { test } from 'node:test';
import assert from 'node:assert/strict';
import { visualLine, wrapLines, cleanText, rtlLines } from '@/lib/og/text';
import { parseFeedLink } from '@/lib/feedLink';

test('visualLine reverses Hebrew, keeps numbers and Latin in order', () => {
  assert.equal(visualLine('שלום עולם'), 'םלוע םולש');
  assert.equal(visualLine('דף 45'), '45 ףד');
  assert.equal(visualLine('קוד 123456 למשחק'), 'קחשמל 123456 דוק');
  assert.equal(visualLine('ברכות (ה)'), '(ה) תוכרב');
  assert.equal(visualLine('ה-1000'), '1000-ה');
  assert.equal(visualLine('אתר orayta app כאן'), 'ןאכ orayta app רתא');
});

test('cleanText strips nikud and bidi marks', () => {
  assert.equal(cleanText('בְּרֵאשִׁית  בָּרָא'), 'בראשית ברא');
  assert.equal(cleanText('‏שלום‫'), 'שלום');
});

test('wrapLines wraps on words and marks a cut with an ellipsis', () => {
  assert.deepEqual(wrapLines('אחת שתיים שלוש ארבע', 9, 3), ['אחת שתיים', 'שלוש ארבע']);
  const cut = wrapLines('אחת שתיים שלוש ארבע חמש שש', 9, 2);
  assert.equal(cut.length, 2);
  assert.ok(cut[1].endsWith('…'));
  assert.deepEqual(wrapLines('קצר', 20, 2), ['קצר']);
  assert.deepEqual(wrapLines('', 20, 2), []);
  // Lines are reordered one by one: the first logical line stays on top.
  assert.deepEqual(rtlLines('אחת שתיים שלוש ארבע', 9, 2), ['םייתש תחא', 'עברא שולש']);
});

test('parseFeedLink accepts only known types and safe ids', () => {
  assert.deepEqual(parseFeedLink('citation.ckx12_ab-3'), { type: 'citation', id: 'ckx12_ab-3' });
  assert.equal(parseFeedLink('reel.abc'), null);
  assert.equal(parseFeedLink('citation.<script>'), null);
  assert.equal(parseFeedLink(null), null);
});
