import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sortEntries, orderKey, isRunningCount } from '@/lib/sikum/order';

const mk = (title: string | null, location: string | null = null, date = '2026-01-01') => ({ title, location, date });
const titles = (xs: { title: string | null }[]) => xs.map(x => x.title);

test('title order: Hebrew numerals compare as numbers', () => {
  const input = ['סימן רכ״ח', 'סימן י״א', 'סימן ב', 'סימן רכ״ז', 'סימן י', 'סימן א', 'סימן י״ב', 'סימן ט'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['סימן א', 'סימן ב', 'סימן ט', 'סימן י', 'סימן י״א', 'סימן י״ב', 'סימן רכ״ז', 'סימן רכ״ח']);
});

test('title order: unmarked numerals after a counter, subtitles, untitled last', () => {
  const input = ['סימן יא – ברכות', 'סימן ט', null, 'סימן טו', 'סימן ט – הקדמה'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['סימן ט', 'סימן ט – הקדמה', 'סימן יא – ברכות', 'סימן טו', null]);
});

test('a plain word that spells a number stays a word', () => {
  assert.deepEqual(orderKey('אמר רבי יוחנן'), [{ text: 'אמר' }, { text: 'רבי' }, { text: 'יוחנן' }]);
  assert.deepEqual(orderKey('דף כז ע״א'), [{ text: 'דף' }, { num: 27, counted: true }, { text: 'עא' }]);
});

test('running count across prefixes: ספר החינוך sorts by the mitzvah', () => {
  const input = ['פרשת לך לך – מצוה ב – מילה', 'פרשת בא – מצוה ד', 'פרשת בראשית – מצוה א – פרו ורבו', 'פרשת וישלח – מצוה ג'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['פרשת בראשית – מצוה א – פרו ורבו', 'פרשת לך לך – מצוה ב – מילה', 'פרשת וישלח – מצוה ג', 'פרשת בא – מצוה ד']);
});

test('a count that restarts per section sorts by section, then number', () => {
  const input = ['שבת – סימן ה', 'ברכות – סימן ה', 'ברכות – סימן ב', 'שבת – סימן א'];
  assert.equal(isRunningCount(input.map(orderKey)), false);
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['ברכות – סימן ב', 'ברכות – סימן ה', 'שבת – סימן א', 'שבת – סימן ה']);
});

test('the order may live in the location field, titles break ties', () => {
  const input = [mk('ענווה', 'פרק ג'), mk('זריזות', 'פרק ב'), mk('הקדמה', null), mk('נקיות', 'פרק ב')];
  assert.deepEqual(titles(sortEntries(input, 'order')), ['הקדמה', 'זריזות', 'נקיות', 'ענווה']);
  const pages = [mk('תפילה', 'עמוד 12'), mk('אמונה', 'עמוד 7–10'), mk('ענווה', null), mk('זריזות', 'עמוד 7–10', '2025-01-01')];
  assert.deepEqual(titles(sortEntries(pages, 'order')), ['אמונה', 'זריזות', 'תפילה', 'ענווה']);
});

test('date orders', () => {
  const input = [mk('a', null, '2026-01-02'), mk('b', null, '2026-01-03'), mk('c', null, '2026-01-01')];
  assert.deepEqual(titles(sortEntries(input, 'desc')), ['b', 'a', 'c']);
  assert.deepEqual(titles(sortEntries(input, 'asc')), ['c', 'a', 'b']);
});

test('parashot sort in Torah order, whatever the spelling', () => {
  const input = ['בא – יציאה', 'פרשת תצווה', 'נח', 'וירא – הכנסת אורחים', 'פרשת בחוקותי', 'בראשית'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['בראשית', 'נח', 'וירא – הכנסת אורחים', 'בא – יציאה', 'פרשת תצווה', 'פרשת בחוקותי']);
});

test('tractates in Mishnah order, then the daf', () => {
  const input = ['שבת דף ב', 'ב״ק דף י', 'ברכות דף ס״ד', 'שבת דף קנ״ז', 'מסכת נידה', 'ברכות דף ב'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['ברכות דף ב', 'ברכות דף ס״ד', 'שבת דף ב', 'שבת דף קנ״ז', 'ב״ק דף י', 'מסכת נידה']);
});

test('Tanakh: "ספר שופטים" is the book, books follow the Torah', () => {
  const input = ['ספר שופטים פרק ב', 'ישעיהו פרק א', 'שמואל ב פרק ג', 'שמואל א פרק ז', 'דברים פרק א'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['דברים פרק א', 'ספר שופטים פרק ב', 'שמואל א פרק ז', 'שמואל ב פרק ג', 'ישעיהו פרק א']);
});

test('Shulchan Arukh parts, an introduction first', () => {
  const input = ['חושן משפט סימן א', 'או״ח סימן ב', 'הקדמה', 'יורה דעה סימן א'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['הקדמה', 'או״ח סימן ב', 'יורה דעה סימן א', 'חושן משפט סימן א']);
});

test('ספר החינוך: a mitzvah written without its parasha still runs in order', () => {
  const input = ['פרשת בא – מצוה ד', 'מצוה ב – מילה', 'פרשת בראשית – מצוה א', 'הקדמה', 'פרשת וישלח – מצוה ג'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['הקדמה', 'פרשת בראשית – מצוה א', 'מצוה ב – מילה', 'פרשת וישלח – מצוה ג', 'פרשת בא – מצוה ד']);
});

test('chapters and mishnayot nest', () => {
  const input = ['פרק ב משנה א', 'פרק א משנה י״ב', 'פרק א משנה ג', 'פרק י משנה ב'];
  assert.deepEqual(titles(sortEntries(input.map(t => mk(t)), 'order')),
    ['פרק א משנה ג', 'פרק א משנה י״ב', 'פרק ב משנה א', 'פרק י משנה ב']);
});
