import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml, findQuote, questionKey, excerpt, keywords, fallbackPhrases, markRema, splitRema, simanTitle, overlap } from '@/lib/rabbiBot/text';
import { splitRemaCandidate } from '@/lib/rabbiBot/sources';
import { simanRanges, spellings, arukhHaShulchanRef } from '@/lib/rabbiBot/anchors';
import { partialAnswer } from '@/lib/rabbiBot/partial';
import { worthSecondTry } from '@/lib/rabbiBot/retry';
import { scorer, wordWeights, impliedWords } from '@/lib/rabbiBot/rank';
import { withHistory, LastAnswer } from '@/lib/rabbiBot/client';
import { answerShareText } from '@/lib/rabbiBot/share';
import { RLM } from '@/lib/siteUrl';
import { mergePlans } from '@/lib/rabbiBot/plan';
import { strictSchema } from '@/lib/rabbiBot/groq';
import { PLAN_SCHEMA, fitPassages } from '@/lib/rabbiBot/prompts';
import { verifyAnswer } from '@/lib/rabbiBot/verify';
import { validateQuestion, classifyFailure, isMomentary, quotaDay, quotaResetAt, isRating } from '@/lib/rabbiBot/rules';
import { namedAuthorities } from '@/lib/rabbiBot/authorities';
import { unitWords, hasModernUnit } from '@/lib/rabbiBot/measures';
import type { RabbiBotPassage } from '@/types/rabbiBot';

const SA = 'מצוה להניחו בטפח הסמוך לפתח משמאל, כדי שתהא מזוזה מימין ונר חנוכה משמאל. ובשעת הסכנה מניחו על שלחנו ודיו.';
const passage = (id: string, text: string): RabbiBotPassage =>
  ({ id, ref: `Ref ${id}`, heRef: `מקור ${id}`, book: 'שולחן ערוך', text, url: `https://example.org/${id}`, origin: 'sefaria' });

test('stripHtml drops tags and commentator markers, fences footnotes off', () => {
  const html = '<i data-commentator="Mishnah Berurah" data-label="לא"></i>מצוה <b>להניחו</b><sup>1</sup><i class="footnote">הערה</i>&nbsp;בטפח';
  assert.equal(stripHtml(html), 'מצוה להניחו … הערה … בטפח');
  // A footnote can be quoted, but a quote never runs from the text into it.
  const noted = stripHtml('להקיף בגדר שגובהה עשרה טפחים<sup>1</sup><i class="footnote">טפח לפי שיעור רבי חיים נאה הוא 8 ס"מ</i> ולסגור את הדלתות');
  assert.equal(findQuote(noted, 'טפח לפי שיעור רבי חיים נאה'), 'טפח לפי שיעור רבי חיים נאה');
  assert.equal(findQuote(noted, 'שגובהה עשרה טפחים טפח לפי שיעור'), null);
});

test('findQuote returns the exact source span, ignoring nikud and punctuation', () => {
  assert.equal(findQuote(SA, 'מניחו על שלחנו ודיו'), 'מניחו על שלחנו ודיו.');
  // A misspelt last word: only the words that really match are returned.
  assert.equal(findQuote('מִפְּנֵי הַבָּשָׂר שֶׁל בֵּין הַשִּׁנַּיִם', 'מפני הבשר של בין השינים'), 'מִפְּנֵי הַבָּשָׂר שֶׁל בֵּין');
  assert.equal(findQuote('מִפְּנֵי הַבָּשָׂר שֶׁל בֵּין הַשִּׁנַּיִם', 'מפני הבשר של בין השנים'), 'מִפְּנֵי הַבָּשָׂר שֶׁל בֵּין הַשִּׁנַּיִם');
});

test('findQuote tolerates one stray word but rejects invented text', () => {
  assert.ok(findQuote(SA, 'כדי שתהא מזוזה מימין ונר חנוכה משמאל תמיד'));
  assert.equal(findQuote(SA, 'מותר להדליק בתוך הבית לכתחילה'), null);
  assert.equal(findQuote(SA, 'בטפח הסמוך'), null, 'too short to verify');
});

test('verifyAnswer keeps only points backed by a real quote', () => {
  const ps = [passage('S1', SA), passage('S2', 'אכל בשר לא יאכל גבינה אחריו עד שישהה שש שעות')];
  const a = verifyAnswer({
    status: 'answered', short: 'מניחים בפתח', dispute: false,
    points: [
      { text: 'השולחן ערוך פוסק שמניחים משמאל הפתח', view: 'main', cites: [{ id: 'S1', quote: 'כדי שתהא מזוזה מימין ונר חנוכה משמאל' }] },
      { text: 'נקודה עם ציטוט מומצא שלא קיים', view: 'main', cites: [{ id: 'S1', quote: 'מותר להדליק בתוך הבית לכתחילה' }] },
      { text: 'נקודה עם מקור שלא קיים כלל', view: 'note', cites: [{ id: 'S9', quote: 'כדי שתהא מזוזה מימין' }] },
    ],
  }, ps, 'moadim');
  assert.equal(a.status, 'answered');
  assert.equal(a.total, 3);
  assert.equal(a.verified, 1);
  assert.equal(a.sources.length, 1);
  assert.equal(a.sources[0].heRef, 'מקור S1');
  assert.equal(a.points[0].cites[0].source, 0);
});

test('verifyAnswer: nothing verified → not_found with no prose', () => {
  const a = verifyAnswer({
    status: 'answered', short: 'תשובה בלי בסיס',
    points: [{ text: 'טענה שאין לה ציטוט אמיתי', view: 'main', cites: [{ id: 'S1', quote: 'דבר שלא נכתב שם מעולם' }] }],
  }, [passage('S1', SA)], 'other');
  assert.equal(a.status, 'not_found');
  assert.equal(a.short, '');
  assert.equal(a.points.length, 0);
});

test('an ashkenaz point marks the answer as disputed', () => {
  const a = verifyAnswer({
    status: 'answered', short: 'x', dispute: false,
    points: [{ text: 'הרמ״א כותב שבזמן הזה אין לחוש', view: 'ashkenaz', cites: [{ id: 'S1', quote: 'ובשעת הסכנה מניחו על שלחנו' }] }],
  }, [passage('S1', SA)], 'moadim');
  assert.equal(a.dispute, true);
});

test('validateQuestion', () => {
  assert.deepEqual(validateQuestion('  מה מברכים   על אורז? '), { ok: true, text: 'מה מברכים על אורז?' });
  assert.deepEqual(validateQuestion('מה'), { ok: false, error: 'too_short' });
  assert.deepEqual(validateQuestion('א'.repeat(301)), { ok: false, error: 'too_long' });
  assert.deepEqual(validateQuestion('ראו https://spam.example'), { ok: false, error: 'link' });
  assert.ok(isRating(5) && !isRating(0) && !isRating(3.5));
});

test('questionKey ignores punctuation, nikud and spacing', () => {
  assert.equal(questionKey('מה מְבָרְכִים על אורז?'), questionKey('  מה מברכים  על אורז '));
});

test('excerpt keeps the window around the keywords', () => {
  const long = `${'מלל מילוי '.repeat(200)}נר חנוכה על פתח ביתו ${'עוד מלל '.repeat(200)}`;
  const out = excerpt(long, keywords('נר חנוכה פתח'), 300);
  assert.ok(out.includes('נר חנוכה'));
  assert.ok(out.length <= 310);
});

test('classifyFailure: only a per-day quota violation is "daily"', () => {
  const daily = { error: { details: [{ violations: [{ quotaId: 'GenerateRequestsPerDayPerProjectPerModel-FreeTier' }] }] } };
  const minute = { error: { details: [{ violations: [{ quotaId: 'GenerateRequestsPerMinutePerProjectPerModel-FreeTier' }] }] } };
  assert.equal(classifyFailure(429, daily), 'daily');
  assert.equal(classifyFailure(429, minute), 'rate');
  assert.equal(classifyFailure(503, null), 'error');
});

test('quota day and reset follow Pacific midnight', () => {
  const now = new Date('2026-10-29T12:00:00Z'); // 05:00 PDT
  assert.equal(quotaDay(now), '2026-10-29');
  assert.equal(quotaResetAt(now).toISOString(), '2026-10-30T07:00:00.000Z');
});

test('a derived conclusion survives only when every premise is verified', () => {
  const ps = [
    passage('S1', 'וַיָּקֶם יְהוָה מוֹשִׁיעַ לִבְנֵי יִשְׂרָאֵל וַיּוֹשִׁיעֵם אֵת עָתְנִיאֵל בֶּן קְנַז'),
    passage('S2', 'וַיָּקֶם יְהוָה לָהֶם מוֹשִׁיעַ אֶת אֵהוּד בֶּן גֵּרָא בֶּן הַיְמִינִי'),
    passage('S3', 'וְאַחֲרָיו הָיָה שַׁמְגַּר בֶּן עֲנָת וַיַּךְ אֶת פְּלִשְׁתִּים'),
  ];
  const premises = [
    { id: 'S1', quote: 'וַיּוֹשִׁיעֵם אֵת עָתְנִיאֵל בֶּן קְנַז' },
    { id: 'S2', quote: 'מוֹשִׁיעַ אֶת אֵהוּד בֶּן גֵּרָא' },
    { id: 'S3', quote: 'וְאַחֲרָיו הָיָה שַׁמְגַּר בֶּן עֲנָת' },
  ];
  const text = 'השופט השלישי הוא שמגר בן ענת, לפי סדר הפסוקים בספר שופטים';
  const ok = verifyAnswer({ status: 'answered', short: 'שמגר', points: [{ text, view: 'main', derived: true, cites: premises }] }, ps, 'tanakh');
  assert.equal(ok.status, 'answered');
  assert.equal(ok.points[0].derived, true);
  assert.equal(ok.points[0].cites.length, 3);

  const broken = [...premises.slice(0, 2), { id: 'S3', quote: 'והשלישי היה שמגר השופט' }];
  const bad = verifyAnswer({ status: 'answered', short: 'שמגר', points: [{ text, view: 'main', derived: true, cites: broken }] }, ps, 'tanakh');
  assert.equal(bad.status, 'not_found');
});

// ── Applied rules, search fallback, history, sharing ─────────────────────

const TEVILA = [
  passage('S1', 'אבל כלי מתכות יטבול בלא ברכה או יקנה כלי אחר ויטבילנו עמו ויברך על טבילת כלים'),
  passage('S2', 'אם תקע סדר א בנשימה אחת מחלוקת בין הפוסקים אם יצא וספק דאורייתא לחומרא'),
];
const RULE_TEXT = 'אין מקור שעוסק בספק אם הוטבל הכלי, אך מהכלל ספק דאורייתא לחומרא עולה שיטבילנו בלא ברכה';
const RULE_CITES = [{ id: 'S1', quote: 'כלי מתכות יטבול בלא ברכה' }, { id: 'S2', quote: 'וספק דאורייתא לחומרא' }];

test('a rule applied to an unwritten case is kept and marks the answer byRule', () => {
  const a = verifyAnswer({ status: 'answered', short: 'יטבילנו בלא ברכה', points: [
    { text: RULE_TEXT, view: 'main', basis: 'rule', cites: RULE_CITES },
    { text: 'הרמב״ם כותב שהטבילה מדברי סופרים', view: 'note', basis: 'explicit', cites: [{ id: 'S1', quote: 'ויקנה כלי אחר ויטבילנו עמו' }] },
  ] }, TEVILA, 'kashrut');
  assert.equal(a.status, 'answered');
  assert.equal(a.points[0].rule, true);
  assert.equal(a.points[0].derived, undefined);
  assert.equal(a.byRule, true, 'notes do not count against byRule');
});

test('an applied rule with one unverified premise is dropped', () => {
  const cites = [RULE_CITES[0], { id: 'S2', quote: 'ספק טבילת כלים לחומרא לעולם' }];
  const a = verifyAnswer({ status: 'answered', short: 'x', points: [{ text: RULE_TEXT, view: 'main', basis: 'rule', cites }] }, TEVILA, 'kashrut');
  assert.equal(a.status, 'not_found');
});

test('an explicit ruling beside an applied rule: not byRule; basis "derived" maps to derived', () => {
  const a = verifyAnswer({ status: 'answered', short: 'x', points: [
    { text: RULE_TEXT, view: 'main', basis: 'rule', cites: RULE_CITES },
    { text: 'ערוך השולחן פוסק שכלי מתכות יטבול בלא ברכה', view: 'main', basis: 'explicit', cites: [RULE_CITES[0]] },
    { text: 'מסקנה מחושבת מתוך שני המקורות יחד', view: 'main', basis: 'derived', cites: RULE_CITES },
  ] }, TEVILA, 'kashrut');
  assert.equal(a.byRule, undefined);
  assert.deepEqual(a.points.map(p => [Boolean(p.rule), Boolean(p.derived)]), [[true, false], [false, false], [false, true]]);
});

test('fallbackPhrases: content-word pairs, nothing for short phrases', () => {
  assert.deepEqual(fallbackPhrases('ספק אם הוטבל כלי'), ['ספק הוטבל', 'הוטבל כלי']);
  assert.deepEqual(fallbackPhrases('טבילת כלים'), []);
  assert.deepEqual(fallbackPhrases('נר חנוכה מניחו על פתח', 1), ['נר חנוכה']);
});

test('keywords skip the filler of a spoken question', () => {
  assert.deepEqual(keywords('במידה ואני לא זוכר האם הטבלתי כלי, צריך ללכת להטביל?'), ['זוכר', 'הטבלתי', 'כלי', 'להטביל']);
});

const entry = (id: string, question: string): LastAnswer => ({
  id, question, token: 't', rating: null, reported: false,
  answer: { status: 'answered', short: 'קצר', points: [], sources: [], dispute: false, topic: 'kashrut', total: 0, verified: 0 },
});

test('withHistory puts the newest first, replaces repeats and caps the list', () => {
  let h: LastAnswer[] = [];
  ['1', '2', '3', '4', '5', '6'].forEach(id => { h = withHistory(h, entry(id, `שאלה ${id}`)); });
  assert.deepEqual(h.map(x => x.id), ['6', '5', '4', '3', '2']);
  h = withHistory(h, entry('7', 'שאלה 4 '));
  assert.deepEqual(h.map(x => x.id), ['7', '6', '5', '3', '2'], 'the same question asked again replaces the old one');
});

test('answerShareText: question, answer, sources and link, every line RTL', () => {
  const a = verifyAnswer({ status: 'answered', short: 'יטבילנו בלא ברכה', points: [{ text: RULE_TEXT, view: 'main', basis: 'rule', cites: RULE_CITES }] }, TEVILA, 'kashrut');
  const text = answerShareText('לא זוכר אם הטבלתי', a);
  const lines = text.split('\n').filter(Boolean);
  assert.ok(lines.every(l => l.startsWith(RLM)));
  assert.ok(text.includes('לא זוכר אם הטבלתי') && text.includes('יטבילנו בלא ברכה') && text.includes('מקור S1 · מקור S2'));
  assert.ok(text.includes('(מקור S1, מקור S2)'), 'each point names where it comes from');
  assert.ok(text.trimEnd().endsWith(`/ask?q=${encodeURIComponent('לא זוכר אם הטבלתי')}`), 'links to the question itself');
});

// ── Groq + the planning ensemble ─────────────────────────────────────────

test('mergePlans interleaves both plans and keeps the first rewrite', () => {
  const qwen = { kind: 'halacha', topic: 'kashrut', refs: ["Shulchan Arukh, Yoreh De'ah 120:9", 'Arukh HaShulchan 120:51'], parallels: [],
    searches: ['ספק טבילת כלים'], terms: ['טבילת כלים'], principles: ['ספק דאורייתא לחומרא'], quote: '', rewrite: 'המסופק אם הטביל כלי' };
  const oss = { kind: 'halacha', topic: 'kashrut', refs: ["Shulchan Arukh, Yoreh De'ah 120:9", 'Tur, Yoreh De\'ah 120'], parallels: ['Kitzur Shulchan Arukh 37:1'],
    searches: ['טבילת כלים'], terms: ['טבילה', 'טבילת כלים'], principles: ['ספק דאורייתא לחומרא', 'ספק ברכות להקל', 'המתנה'], quote: '', rewrite: 'שכחתי אם הטבלתי' };
  const m = mergePlans([qwen, oss]);
  assert.deepEqual(m.refs, ["Shulchan Arukh, Yoreh De'ah 120:9", 'Arukh HaShulchan 120:51', "Tur, Yoreh De'ah 120"]);
  assert.deepEqual(m.terms, ['טבילת כלים', 'טבילה']);
  assert.deepEqual(m.principles, ['ספק דאורייתא לחומרא', 'ספק ברכות להקל'], 'capped at 2');
  assert.deepEqual(m.parallels, ['Kitzur Shulchan Arukh 37:1']);
  assert.equal(m.rewrite, 'המסופק אם הטביל כלי');
});

test('mergePlans: "sensitive" from either model wins; "other" yields to an answerable kind', () => {
  assert.equal(mergePlans([{ kind: 'halacha', topic: 'family' }, { kind: 'sensitive', topic: 'family' }]).kind, 'sensitive');
  const m = mergePlans([{ kind: 'other', topic: 'other' }, { kind: 'torah', topic: 'tanakh', refs: ['Judges 3:31'] }]);
  assert.equal(m.kind, 'torah');
  assert.equal(m.topic, 'tanakh');
  assert.deepEqual(mergePlans([{ kind: 'torah', refs: ['Genesis 1:1'] }]).refs, ['Genesis 1:1'], 'a single plan passes through');
});

test('classifyFailure reads Groq\'s per-day limits from its message', () => {
  const groq = (m: string) => ({ error: { message: m, code: 'rate_limit_exceeded' } });
  assert.equal(classifyFailure(429, groq('Rate limit reached for model `qwen/qwen3.8-27b` on requests per day (RPD): Limit 1000')), 'daily');
  assert.equal(classifyFailure(429, groq('Rate limit reached … on tokens per day (TPD): Limit 200000')), 'daily');
  assert.equal(classifyFailure(429, groq('Rate limit reached … on tokens per minute (TPM): Limit 8000')), 'rate');
});

test('strictSchema closes every object and drops maxItems', () => {
  const s = strictSchema(PLAN_SCHEMA) as { additionalProperties: boolean; required: string[]; properties: Record<string, { maxItems?: number }> };
  assert.equal(s.additionalProperties, false);
  assert.deepEqual([...s.required].sort(), Object.keys(PLAN_SCHEMA.properties).sort());
  assert.equal(s.properties.refs.maxItems, undefined);
  const nested = strictSchema({ type: 'array', items: { type: 'object', properties: { a: { type: 'string' } } } }) as { items: { additionalProperties: boolean; required: string[] } };
  assert.equal(nested.items.additionalProperties, false);
  assert.deepEqual(nested.items.required, ['a']);
});

test('fitPassages keeps priority order and S-numbers within the budget', () => {
  const ps = [passage('S1', 'א'.repeat(50)), passage('S2', 'ב'.repeat(200)), passage('S3', 'ג'.repeat(40))];
  // מקור Sn = 6 chars + 12 overhead: S1 = 68, S2 = 218, S3 = 58
  assert.deepEqual(fitPassages(ps, 140).map(p => p.id), ['S1', 'S3'], 'a too-long passage is skipped, a later short one still fits');
  assert.deepEqual(fitPassages(ps, 1000).map(p => p.id), ['S1', 'S2', 'S3']);
  assert.deepEqual(fitPassages(ps, 10), []);
});

// ── Maran vs. the Rema ───────────────────────────────────────────────────

// Shulchan Arukh, Orach Chayim 422:1 as Sefaria serves it (abridged).
const SEIF_422 = 'ואם לא אמרו בערבי\' אין מחזירין אותו <small>(<i data-commentator="Mishnah Berurah" data-label="ב"></i>ובאיזה מקום שזוכר שאינו חוזר ע"ל סי\' רצ"ד)</small> מפני שאין מקדשין את החודש בלילה אבל לא אמרו שחרית ומנחה <i data-commentator="Mishnah Berurah" data-label="ד"></i>מחזירין אותו: <small>הגה (ואם הוא ספק אם הזכיר או לאו אין צריך לחזור כל בו הלכות תפלה)</small> וש"ץ ששכח';

test('splitRema separates the Rema\'s glosses from Maran\'s words', () => {
  const { main, rema } = splitRema(stripHtml(markRema(SEIF_422)));
  assert.equal(main, 'ואם לא אמרו בערבי\' אין מחזירין אותו … מפני שאין מקדשין את החודש בלילה אבל לא אמרו שחרית ומנחה מחזירין אותו: … וש"ץ ששכח');
  assert.equal(rema, '(ובאיזה מקום שזוכר שאינו חוזר ע"ל סי\' רצ"ד) … הגה (ואם הוא ספק אם הזכיר או לאו אין צריך לחזור כל בו הלכות תפלה)');
  assert.equal(findQuote(main, 'ואם הוא ספק אם הזכיר או לאו אין צריך לחזור'), null, 'the gloss is no longer quotable as Maran');
  assert.equal(findQuote(main, 'מחזירין אותו וש"ץ ששכח'), null, 'no quote spans the gap');
  assert.deepEqual(splitRema('טקסט בלי הגה'), { main: 'טקסט בלי הגה', rema: '' });
});

test('splitRemaCandidate: a seif becomes Maran + "הגהת הרמ״א"; a bare source note is dropped', () => {
  const c = { ref: 'Shulchan Arukh, Orach Chayim 422:1', heRef: 'שולחן ערוך, אורח חיים תכ״ב:א׳', book: 'שולחן ערוך, אורח חיים', url: 'u', origin: 'sefaria' as const, text: stripHtml(markRema(SEIF_422)) };
  const [maran, rema] = splitRemaCandidate(c);
  assert.equal(maran.heRef, c.heRef);
  assert.equal(rema.heRef, 'הגהת הרמ״א — שולחן ערוך, אורח חיים תכ״ב:א׳');
  assert.equal(rema.book, 'הגהות הרמ״א');
  assert.notEqual(rema.ref, maran.ref, 'distinct keys, so both survive de-duplication');
  assert.ok(findQuote(rema.text, 'ואם הוא ספק אם הזכיר או לאו אין צריך לחזור'));
  const noteOnly = { ...c, text: stripHtml(markRema('צריך להטבילם במקוה <small>(טור)</small>')) };
  assert.deepEqual(splitRemaCandidate(noteOnly).map(x => x.text), ['צריך להטבילם במקוה']);
});

test('isMomentary: overload, unparsable output and a derailed Groq generation get one retry', () => {
  assert.equal(isMomentary(503, null), true);
  assert.equal(isMomentary(502, null), true);
  assert.equal(isMomentary(400, { error: { code: 'json_validate_failed' } }), true);
  assert.equal(isMomentary(400, { error: { code: 'invalid_api_key' } }), false);
  assert.equal(isMomentary(429, null), false);
});

test('namedAuthorities finds the poskim whose books are not online, in any spelling', () => {
  const names = (q: string) => namedAuthorities(q).map(a => a.names[0]);
  assert.deepEqual(names('כמה זה טפח לפי החזו״א?'), ['חזון איש']);
  assert.deepEqual(names('שיעור רביעית לפי החזון איש ולפי הגר״ח נאה'), ['חזון איש', 'חיים נאה']);
  assert.deepEqual(names('מה כתב בקצות השולחן על קידוש?'), ['חיים נאה']);
  assert.deepEqual(names('האם מותר לאכול לפני קידוש?'), []);
  // "נאה" alone is just "nice".
  assert.deepEqual(names('האם נאה להתפלל בבגד כזה?'), []);
});

test('unitWords: a question asked in modern units pairs the measure with the unit as the sources spell it', () => {
  assert.deepEqual(unitWords('מה המידה של לוג בליטרים?'), ['ליטר', 'מיליליטר']);
  assert.deepEqual(unitWords('כמה זה רביעית במ״ל?'), ['ליטר', 'מיליליטר']);
  assert.deepEqual(unitWords('כמה ס"מ זה טפח?'), ['סנטימטר', 'מטר']);
  assert.deepEqual(unitWords('כמה גרם זה כזית?'), ['גרם']);
  assert.deepEqual(unitWords('מה שיעור כזית?'), []);
});

test('hasModernUnit tells liters and meters from litras, rain and "caused"', () => {
  assert.equal(hasModernUnit('שלושה לוגים שהם 0.8 ליטר'), true);
  assert.equal(hasModernUnit("שיעור 'רביעית הלוג' יין, שהוא כ-75 מיליליטר"), true);
  assert.equal(hasModernUnit('הלוג היא מידה שהיא כחצי ליטר'), true);
  assert.equal(hasModernUnit('חֲצִי סְאָה. כארבעה ליטרים.'), true);
  assert.equal(hasModernUnit('וכל מיל אורכו 912 מטר'), true);
  assert.equal(hasModernUnit("סאה עבדה כ\"ד לוגים, וכל לוג ב' ליטרות"), false);
  assert.equal(hasModernUnit("ולוג ב' ליטרים"), false);
  assert.equal(hasModernUnit('ונתתי מטר ארצכם בעתו'), false);
  assert.equal(hasModernUnit('הו"ל גורם ברכה שאינה צריכה, כי גרם לו'), false);
  assert.equal(hasModernUnit('רבע לוג, כשבעים וחמש סמ"ק.'), true);
  assert.equal(hasModernUnit('ובמידות ימינו שיעור הלוג כ-350 סמ"ק'), true);
  assert.equal(hasModernUnit('וכמ"ש לעיל ס"מ ע"ש'), false);
});

// ── Voice: transcripts and the reading script ─────────────────────────────

import { audioExtension, cleanTranscript } from '@/lib/rabbiBot/voice/transcript';
import { answerSpeech, sentences, speakable } from '@/lib/rabbiBot/voice/speech';

test('audioExtension maps recorder types and refuses the rest', () => {
  assert.equal(audioExtension('audio/webm;codecs=opus'), 'webm');
  assert.equal(audioExtension('audio/mp4'), 'm4a');
  assert.equal(audioExtension('video/mp4'), null);
  assert.equal(audioExtension(null), null);
});

test('cleanTranscript trims and drops Whisper silence hallucinations', () => {
  assert.equal(cleanTranscript('  האם מותר   לטלטל מוקצה? '), 'האם מותר לטלטל מוקצה?');
  assert.equal(cleanTranscript('תודה שצפיתם'), '');
  assert.equal(cleanTranscript('תודה רבה.'), '');
  assert.equal(cleanTranscript('כתוביות על ידי'), '');
  assert.equal(cleanTranscript(' . '), '');
  assert.equal(cleanTranscript('תודה רבה על התשובה, ומה הדין בחול המועד?'), 'תודה רבה על התשובה, ומה הדין בחול המועד?');
});

test('speakable spells out abbreviations as whole words only', () => {
  assert.equal(speakable('כך פסק בשו״ע או"ח שח'), 'כך פסק בשולחן ערוך אורח חיים שח');
  assert.equal(speakable('והרמ״א (שם) מחמיר'), 'והרמא, שם, מחמיר');
  assert.equal(speakable('דברי רע״א'), 'דברי רבי עקיבא איגר');
  assert.equal(speakable('ברע״א'), 'ברבי עקיבא איגר');
});

test('sentences splits long text into short utterances', () => {
  const long = `${'מילה '.repeat(60)}סוף.`;
  const parts = sentences(long, 100);
  assert.ok(parts.length > 1 && parts.every(p => p.length <= 100));
  assert.deepEqual(sentences('אחת. שתיים? שלוש'), ['אחת.', 'שתיים?', 'שלוש']);
});

test('answerSpeech reads understood, short, points by view and sources', () => {
  const a = verifyAnswer({ status: 'answered', short: 'יטבילנו בלא ברכה', points: [{ text: RULE_TEXT, view: 'main', basis: 'rule', cites: RULE_CITES }] }, TEVILA, 'kashrut');
  const chunks = answerSpeech({ ...a, understood: 'המסופק אם הטביל' });
  assert.ok(chunks[0].text.startsWith('הבנתי שהשאלה היא'));
  assert.ok(chunks.some(c => c.text.includes('יטבילנו בלא ברכה')));
  assert.ok(chunks.some(c => c.point === 0), 'point chunks carry their index');
  assert.ok(chunks[chunks.length - 1].text.startsWith('המקורות'));
  assert.deepEqual(answerSpeech({ ...a, status: 'not_found' }), []);
});

test('simanRanges: each distinct siman once, whole', () => {
  const SA = 'Shulchan Arukh, Orach Chayim';
  assert.deepEqual(simanRanges([`${SA} 672:1`, `${SA} 671:3`, `${SA} 672:2`, `${SA} 611`, `${SA} 128:2-4`]),
    [`${SA} 672:1-99`, `${SA} 671:1-99`, `${SA} 611:1-99`, `${SA} 128:1-99`]);
});

test('impliedWords: the question\'s wording in the sources\' words', () => {
  assert.deepEqual(impliedWords(['מתי', 'להדליק']), ['זמן']);
  assert.deepEqual(impliedWords(['אישה', 'לחזור']), ['נשים', 'מחזירין']);
});

test('simanTitle reads the siman title off its first seif only', () => {
  assert.equal(simanTitle('זמן הדלקת נר חנוכה. ובו ב סעיפים: אין מדליקין'), 'זמן הדלקת נר חנוכה');
  assert.equal(simanTitle('סדר הדלקת נר חנוכה ומקום הנחתו. ובו ח סעיפים: צריך'), 'סדר הדלקת נר חנוכה ומקום הנחתו');
  assert.equal(simanTitle('שכח או הזיד ולא הדליק עם שקיעת החמה'), '');
});

test('overlap meets full and defective spelling, and a one-letter prefix', () => {
  assert.equal(overlap('ואם לא אמר יעלה ויבא ברצה', ['ויבוא', 'יעלה']), 2);
  assert.equal(overlap('קודם שיתפלל תפלת השחר', ['תפילת']), 1);
  assert.equal(overlap('נשים חייבות בהבדלה', ['הבדלה', 'אישה']), 1);
});

test('wordWeights: the rare word outweighs the common ones', () => {
  const texts = ['ברכת המזון על הפת', 'ברכת המזון בשבת', 'אורז שבשלו מברך בורא מיני מזונות', 'ברכת המזון לנשים'];
  const rank = scorer(wordWeights(['ברכת', 'המזון', 'אורז'], texts, ['אורז']));
  assert.ok(rank(texts[2]) > rank(texts[0]));
});

test('spellings adds the defective spelling only when it differs', () => {
  assert.deepEqual(spellings('יעלה ויבוא מחזירין'), ['יעלה ויבוא מחזירין', 'יעלה ויבא מחזירין']);
  assert.deepEqual(spellings('נשים הבדלה'), ['נשים הבדלה']);
});

test('abbreviations meet the words they stand for', () => {
  assert.equal(overlap('ואומר יעלה ויבא ברצה … אבל לא אמרו שחרית בר"ח מחזירין אותו', ['ראש', 'חודש']), 2);
  assert.deepEqual(keywords('שכחתי יעלה ויבוא בר״ח'), ['שכחתי', 'יעלה', 'ויבוא', 'ברח', 'ראש', 'חודש']);
  assert.equal(overlap('רח בלי גרשיים', ['ראש']), 0);
});

test('partialAnswer reads only what is already closed', () => {
  const full = JSON.stringify({ status: 'answered', short: 'עד עמוד השחר', dispute: false, points: [
    { text: 'א { ב } "ג"', view: 'main', basis: 'explicit', cites: [{ id: 'S1', quote: 'מדליק והולך כל הלילה' }] },
    { text: 'שני', view: 'note', basis: 'explicit', cites: [] },
  ] });
  const cut = full.slice(0, full.indexOf('שני') + 2);
  const p = partialAnswer(cut);
  assert.equal(p.status, 'answered');
  assert.equal(p.short, 'עד עמוד השחר');
  assert.equal((p.points as unknown[]).length, 1);
  assert.equal((partialAnswer(full).points as unknown[]).length, 2);
  assert.deepEqual(partialAnswer('{"status":"answ'), {});
});

test('worthSecondTry: only a miss that looks like the model\'s', () => {
  const nf = { status: 'not_found' as const, short: '', points: [], sources: [], dispute: false, topic: 'moadim' as const, total: 0, verified: 0 };
  const passage = (text: string) => ({ id: 'S1', ref: 'r', heRef: 'r', book: 'b', url: '', origin: 'sikum' as const, text });
  const q = 'עד מתי אפשר להדליק נרות חנוכה?';
  assert.equal(worthSecondTry(nf, [passage('זמן הדלקת נרות: מותר להדליק נרות חנוכה עד עמוד השחר')], q), true);
  assert.equal(worthSecondTry(nf, [passage('הלכות שבת ותפילה')], q), false);
  assert.equal(worthSecondTry({ ...nf, total: 2 }, [], q), true);
  assert.equal(worthSecondTry({ ...nf, status: 'answered', verified: 1 }, [], q), false);
});

test('arukhHaShulchanRef: the same siman in the Arukh HaShulchan', () => {
  assert.equal(arukhHaShulchanRef('Shulchan Arukh, Orach Chayim 672:1-99'), 'Arukh HaShulchan, Orach Chaim 672:1-99');
  assert.equal(arukhHaShulchanRef("Shulchan Arukh, Yoreh De'ah 89:1"), "Arukh HaShulchan, Yoreh De'ah 89:1-99");
  assert.equal(arukhHaShulchanRef('Mishnah Berurah 672:1'), null);
});
