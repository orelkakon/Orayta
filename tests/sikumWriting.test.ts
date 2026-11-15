import { test } from 'node:test';
import assert from 'node:assert/strict';
import { tidyInline, tidySikumText, countWords, readingMinutes } from '@/lib/sikum/typography';
import { parseNumeral, nextInSequence, topicPrefix, suggestNext } from '@/lib/sikum/suggest';
import { joinDictation, dictationPrompt } from '@/lib/sikum/dictation';
import { sameWords, acceptPunctuation } from '@/lib/sikum/punctuate';

test('tidyInline: gershayim, geresh, spaces, dashes, invisible marks', () => {
  assert.equal(tidyInline('‏סימן רל"ז - ברכות'), 'סימן רל״ז – ברכות');
  assert.equal(tidyInline("אמר ר' יוחנן"), 'אמר ר׳ יוחנן');
  assert.equal(tidyInline("ר''ח"), 'ר״ח');
  assert.equal(tidyInline('שלום  ,  עולם .'), 'שלום, עולם.');
  assert.equal(tidyInline('א,ב:ג'), 'א, ב: ג');
  assert.equal(tidyInline('סוף.התחלה'), 'סוף. התחלה');
  assert.equal(tidyInline('3.5 ליטר'), '3.5 ליטר');
  assert.equal(tidyInline('( הערה )'), '(הערה)');
  assert.equal(tidyInline('"והוא רחום"'), '"והוא רחום"');
});

test('tidySikumText: every line, paragraphs kept, extra blank lines collapsed', () => {
  assert.equal(tidySikumText('‏שורה א \r\n‏שורה ב\n\n\n\nשורה ג  '), 'שורה א\nשורה ב\n\nשורה ג');
  assert.equal(countWords(' אחת  שתיים\nשלוש '), 3);
  assert.equal(readingMinutes(0), 0);
  assert.equal(readingMinutes(30), 1);
  assert.equal(readingMinutes(450), 2);
});

test('parseNumeral: canonical, marked or after a counter only', () => {
  assert.deepEqual(parseNumeral('רל״ז'), { value: 237, marked: true, hebrew: true });
  assert.equal(parseNumeral('ז'), null);
  assert.equal(parseNumeral('ז', true)?.value, 7);
  assert.equal(parseNumeral('וירא', true), null);
  assert.equal(parseNumeral('שו״ע'), null);
  assert.equal(parseNumeral('רמב״ם'), null);
  assert.equal(parseNumeral('טו', true)?.value, 15);
  assert.equal(parseNumeral('12')?.value, 12);
});

test('nextInSequence: the next siman / mishna / page', () => {
  assert.equal(nextInSequence('מסכת ברכות פרק ב משנה ז'), 'מסכת ברכות פרק ב משנה ח');
  assert.equal(nextInSequence('סימן רל״ז - ברכות קריאת שמע'), 'סימן רל״ח – ');
  assert.equal(nextInSequence('סימן רל״ט'), 'סימן ר״מ');
  assert.equal(nextInSequence('כז'), 'כח');
  assert.equal(nextInSequence('יד'), 'טו');
  assert.equal(nextInSequence('פרק ט׳'), 'פרק י׳');
  assert.equal(nextInSequence('עמוד 7–10'), 'עמוד 11');
  assert.equal(nextInSequence('עמוד 7 - 10'), 'עמוד 11');
  assert.equal(nextInSequence('וירא - חיי עולם הזה זמניים'), null);
  assert.equal(nextInSequence('עבודת ה׳'), null);
  assert.equal(nextInSequence('דף ב ע״ב'), 'דף ג ע״ב');
});

test('topicPrefix + suggestNext', () => {
  assert.equal(topicPrefix('וירא - הצדיק מגיע לעליונים'), 'וירא – ');
  assert.equal(topicPrefix('הקדמה'), null);
  const s = suggestNext([
    { title: 'משנה ו', location: 'כז', createdAt: '2026-11-01T10:00:00Z' },
    { title: 'וירא - הצדיק', location: null, createdAt: '2026-11-02T10:00:00Z' },
  ]);
  assert.deepEqual(s, { titles: ['וירא – '], location: null });
  assert.deepEqual(suggestNext([{ title: 'פרק ב משנה ז', location: 'כז', createdAt: '2026-11-01T10:00:00Z' }]),
    { titles: ['פרק ב משנה ח'], location: 'כח' });
  assert.deepEqual(suggestNext([]), { titles: [], location: null });
});

test('joinDictation: spacing, spoken line breaks, echoes dropped', () => {
  assert.equal(joinDictation('והצדיק מגיע', 'אמר', ''), ' והצדיק מגיע');
  assert.equal(joinDictation('והצדיק מגיע', 'אמר ', ''), 'והצדיק מגיע');
  assert.equal(joinDictation('שלום', '', 'עולם'), 'שלום ');
  assert.equal(joinDictation('שלום', '', '. עוד'), 'שלום');
  assert.equal(joinDictation('סוף העניין. פסקה חדשה. התחלה', '', ''), 'סוף העניין.\nהתחלה');
  assert.equal(joinDictation('  ', 'x', ''), '');
  assert.equal(joinDictation('ר"ח ', '', ''), 'ר״ח');
  assert.equal(joinDictation('והצדיק מגיע עד העולמות', '', '', 'ספר. והצדיק מגיע עד העולמות'), '');
  assert.ok(dictationPrompt({ book: 'נועם אלימלך', title: 'וירא', before: 'א'.repeat(300) + ' סוף' }).includes('ספר נועם אלימלך.'));
});

test('punctuation: accepted only with the same words', () => {
  assert.ok(sameWords('אמר רבי יוחנן שלום', 'אמר רבי יוחנן: "שלום."'));
  assert.ok(!sameWords('אמר רבי יוחנן', 'אמר ר׳ יוחנן'));
  assert.equal(acceptPunctuation('שלום עולם מה נשמע', { text: 'שלום עולם, מה נשמע?' }), 'שלום עולם, מה נשמע?');
  assert.equal(acceptPunctuation('שלום עולם', { text: 'שלום לעולם.' }), null);
  assert.equal(acceptPunctuation('שלום', null), null);
});

test('parseEntryInput: text required, typography, valid dates only', async () => {
  const { parseEntryInput } = await import('@/lib/sikum/entryInput');
  assert.equal(parseEntryInput({ text: '  ' }), null);
  assert.equal(parseEntryInput(null), null);
  const e = parseEntryInput({ text: '‏ר"ח', title: ' סימן א ', date: '2026-11-15', dateEnd: '2026-11-10', location: '' });
  assert.equal(e?.text, 'ר״ח');
  assert.equal(e?.title, 'סימן א');
  assert.equal(e?.location, null);
  assert.equal(e?.dateEnd, null);
  assert.equal(e?.date.toISOString().slice(0, 10), '2026-11-15');
  assert.ok(parseEntryInput({ text: 'x', date: 'garbage' })?.date instanceof Date);
  assert.equal(parseEntryInput({ text: 'x', date: '2026-11-01', dateEnd: '2026-11-05' })?.dateEnd?.toISOString().slice(0, 10), '2026-11-05');
});
