import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'fs';
import { buildSaIndex, SaData } from '@/lib/rabbiBot/saIndex';
import { searchSa, searchSeifim } from '@/lib/rabbiBot/saSearch';
import { saQuery, contentWords } from '@/lib/rabbiBot/saQuery';
import { candidateLine } from '@/lib/rabbiBot/saFinder';
import TITLES from '@/lib/rabbiBot/data/sa-toc.json';
import { SA_CASES } from './fixtures/saQuestions';

// The Shulchan Arukh search measured on questions as people ask them
// (fixtures/saQuestions.ts). The floors sit just under what it reaches today
// (titles alone reached 37 / 61 / 80 of 171), so a change that loses ground fails here.

const data = JSON.parse(readFileSync('src/lib/rabbiBot/data/sa-text.json', 'utf8')) as SaData;
const index = buildSaIndex(data, TITLES as Record<string, string[]>);
const AB: Record<string, string> = { 'Orach Chayim': 'OC', "Yoreh De'ah": 'YD', 'Even HaEzer': 'EH', 'Choshen Mishpat': 'CM' };
const short = (siman: string) => {
  const m = siman.match(/^Shulchan Arukh, (.+) (\d+)$/);
  return m ? `${AB[m[1]]} ${m[2]}` : siman;
};
const rankOf = (q: string, expect: string[]) => searchSa(index, saQuery(q), 10).findIndex(h => expect.includes(short(h.siman)));

test('the corpus holds all four parts and their hilchot', () => {
  assert.deepEqual(Object.keys(data.text), Object.keys(AB));
  assert.equal(data.text['Orach Chayim'].length, 697);
  assert.ok(data.text['Orach Chayim'][203][6].startsWith('השותה מים לצמאו מברך שהכל'));
  assert.ok(data.hilchot['Orach Chayim'].some(s => s.name === 'הלכות שבת' && s.from === 242 && s.to === 344));
});

test('benchmark: the right siman is found for questions as people ask them', () => {
  const ranks = SA_CASES.map(c => rankOf(c.q, c.expect));
  const within = (k: number) => ranks.filter(r => r >= 0 && r < k).length;
  const report = `top1 ${within(1)} · top3 ${within(3)} · top10 ${within(10)} of ${SA_CASES.length}`;
  assert.ok(within(1) >= 100, report);
  assert.ok(within(3) >= 138, report);
  assert.ok(within(10) >= 162, report);
});

test('the question that started it: water is OC 204:7', () => {
  const hits = searchSa(index, saQuery('מה מברכים על מים?'), 3);
  assert.ok(hits.some(h => h.seifim[0] === 'Shulchan Arukh, Orach Chayim 204:7'), JSON.stringify(hits));
});

test('the hilchot decide a context word the seif never says', () => {
  assert.equal(rankOf('מותר להתרחץ בתשעה באב?', ['OC 554']), 0);
  const gentile = rankOf('מותר לבקש מגוי לעשות מלאכה בשבת?', ['OC 307']);
  assert.ok(gentile >= 0 && gentile < 10, `rank ${gentile}`);
});

test('a phrase is found in the one seif that holds all its words, in any inflection', () => {
  const water = searchSeifim(index, contentWords('השותה מים לצמאו').map(word => ({ word, weight: 1 })), 3, 1).map(h => h.ref);
  assert.equal(water[0], 'Shulchan Arukh, Orach Chayim 204:7');
  const yaaleh = searchSeifim(index, contentWords('לא אמר יעלה ויבוא מחזירין').map(word => ({ word, weight: 1 })), 5, 1).map(h => h.ref);
  assert.ok(yaaleh.includes('Shulchan Arukh, Orach Chayim 422:1'), yaaleh.join(', '));
});

test('a planner line names the seif, its siman and its own words', () => {
  const line = candidateLine({ siman: 'Shulchan Arukh, Orach Chayim 204', seifim: ['Shulchan Arukh, Orach Chayim 204:7'], score: 1 },
    () => data.text['Orach Chayim'][203][6], ['מים']);
  assert.match(line, /^Shulchan Arukh, Orach Chayim 204:7 — דיני הברכות ליתר מאכלים — «השותה מים לצמאו/);
  const first = candidateLine({ siman: 'Shulchan Arukh, Orach Chayim 204', seifim: ['Shulchan Arukh, Orach Chayim 204:1'], score: 1 },
    () => data.text['Orach Chayim'][203][0], ['בשר']);
  assert.ok(!first.includes('ובו יג סעיפים'), 'the title is not repeated as the seif');
});
