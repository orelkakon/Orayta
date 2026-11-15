import { test } from 'node:test';
import assert from 'node:assert/strict';
import { followUpContext, followUpKey, parseFollowUp, withPriorRefs } from '@/lib/rabbiBot/followUp';
import { followUpPlanUser, mergePlans } from '@/lib/rabbiBot/plan';
import { answerPrompt } from '@/lib/rabbiBot/prompts';
import { validateQuestion } from '@/lib/rabbiBot/rules';

const PREV = {
  question: 'מה מברכים על אורז?',
  understood: 'ברכת האורז',
  short: 'לפי מרן מברכים על אורז בורא מיני מזונות.',
  refs: ['Shulchan Arukh, Orach Chayim 208:7', 'Shulchan Arukh, Orach Chayim 208:7', 'bad|ref', 'עברית', 'x'.repeat(200)],
};

test('the previous turn is cleaned: lengths capped, only Sefaria-shaped refs, deduped', () => {
  const f = parseFollowUp(PREV)!;
  assert.deepEqual(f.refs, ['Shulchan Arukh, Orach Chayim 208:7']);
  assert.equal(f.understood, 'ברכת האורז');
  assert.equal(parseFollowUp(null), null);
  assert.equal(parseFollowUp({ question: '' }), null);
  assert.equal(parseFollowUp('string'), null);
  assert.equal(parseFollowUp({ question: 'שאלה', short: 'א'.repeat(900) })!.short.length, 400);
});

test('a follow-up may be short; a fresh question may not', () => {
  assert.equal(validateQuestion('ולמה?').ok, false);
  assert.equal(validateQuestion('ולמה?', 2).ok, true);
});

test('the planner sees the earlier exchange, then the follow-up', () => {
  const f = parseFollowUp(PREV)!;
  const msg = followUpPlanUser('ובשבת?', f);
  assert.ok(msg.startsWith(followUpContext(f)));
  assert.match(msg, /Follow-up question: ובשבת\?/);
  assert.match(followUpContext(f), /Previous question restated: ברכת האורז/);
});

test('merged plans keep the resolved question', () => {
  const m = mergePlans([{ kind: 'halacha', standalone: '' }, { kind: 'halacha', standalone: 'מה מברכים על אורז בשבת?' }]);
  assert.equal(m.standalone, 'מה מברכים על אורז בשבת?');
});

test('the answer prompt marks the earlier turn as background only', () => {
  const p = answerPrompt('מה מברכים על אורז בשבת?', 'halacha', [], 'ברכת האורז בשבת', {
    previousQuestion: 'ברכת האורז', previousShort: 'מזונות', asked: 'ובשבת?',
  });
  assert.match(p, /^רקע \(שאלת המשך/);
  assert.match(p, /שאלה: מה מברכים על אורז בשבת\?/);
  assert.ok(!answerPrompt('ש', 'torah', []).includes('רקע'));
});

test('cache key and refs', () => {
  assert.equal(followUpKey({ question: 'q', understood: '', short: '', refs: [] }), 'q');
  assert.equal(followUpKey(parseFollowUp(PREV)!), 'ברכת האורז');
  assert.deepEqual(withPriorRefs(['A 1', 'B 2'], ['B 2', 'C 3', 'D 4'], 3), ['A 1', 'B 2', 'C 3']);
});
