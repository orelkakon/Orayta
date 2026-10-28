import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stripHtml, findQuote, questionKey, excerpt, keywords } from '@/lib/rabbiBot/text';
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
