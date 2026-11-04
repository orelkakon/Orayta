import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml, findQuote, questionKey, excerpt, keywords, fallbackPhrases } from '@/lib/rabbiBot/text';
import { withHistory, LastAnswer } from '@/lib/rabbiBot/client';
import { answerShareText } from '@/lib/rabbiBot/share';
import { RLM } from '@/lib/siteUrl';
import { mergePlans } from '@/lib/rabbiBot/plan';
import { strictSchema } from '@/lib/rabbiBot/groq';
import { PLAN_SCHEMA, fitPassages } from '@/lib/rabbiBot/prompts';
import { verifyAnswer } from '@/lib/rabbiBot/verify';
import { validateQuestion, classifyFailure, quotaDay, quotaResetAt, isRating } from '@/lib/rabbiBot/rules';
import type { RabbiBotPassage } from '@/types/rabbiBot';

const SA = 'מצוה להניחו בטפח הסמוך לפתח משמאל, כדי שתהא מזוזה מימין ונר חנוכה משמאל. ובשעת הסכנה מניחו על שלחנו ודיו.';
const passage = (id: string, text: string): RabbiBotPassage =>
  ({ id, ref: `Ref ${id}`, heRef: `מקור ${id}`, book: 'שולחן ערוך', text, url: `https://example.org/${id}`, origin: 'sefaria' });

test('stripHtml drops tags, footnotes and commentator markers', () => {
  const html = '<i data-commentator="Mishnah Berurah" data-label="לא"></i>מצוה <b>להניחו</b><sup>1</sup><i class="footnote">הערה</i>&nbsp;בטפח';
  assert.equal(stripHtml(html), 'מצוה להניחו בטפח');
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
  assert.ok(text.trimEnd().endsWith('/ask'));
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
