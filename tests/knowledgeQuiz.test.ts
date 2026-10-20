import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseYearRange, centuryIndex, centuryParts } from '@/lib/knowledge/era';
import { parseRelations } from '@/lib/knowledge/relations';
import { buildKnowledgeQuestion, maskName, dateKey, dedupe, KRabbi } from '@/lib/knowledgeQuiz';

let n = 0;
const R = (name: string, sortYear: number, extra: Partial<KRabbi> = {}): KRabbi => ({
  id: `r${n++}`, name, fullName: null, sortYear, datePeriod: `${sortYear} - ${sortYear + 70}`,
  bio: 'חי בארץ ישראל.', category: 'rishonim', deathDate: null, ...extra,
});

test('year ranges: CE, BCE on both ends, mixed, "היום", and refusals', () => {
  assert.deepEqual(parseYearRange('1040 - 1105'), { start: 1040, end: 1105 });
  assert.deepEqual(parseYearRange('~1812 - 1637 לפנה"ס'), { start: -1812, end: -1637 });
  assert.deepEqual(parseYearRange('113 לפנה״ס - 8 לספירה'), { start: -113, end: 8 });
  assert.deepEqual(parseYearRange('1937 - היום'), { start: 1937, end: 2026 });
  assert.equal(parseYearRange('המאה ה-2 לפנה״ס'), null);
  assert.equal(parseYearRange('תקופת הבריאה'), null);
});

test('centuries have no year zero', () => {
  assert.equal(centuryIndex(1040), 10);
  assert.equal(centuryIndex(100), 0);
  assert.equal(centuryIndex(101), 1);
  assert.equal(centuryIndex(-113), -2);
  assert.deepEqual(centuryParts(10), { n: 11, bce: false });
  assert.deepEqual(centuryParts(-2), { n: 2, bce: true });
});

test('relations need an exact, bounded name', () => {
  const rashi = R('רש״י', 1040);
  const rav = R('רב', 175);
  const tam = R('רבנו תם', 1110, { bio: 'חי בצרפת. נכדו של רש"י. אחד מבעלי התוספות.' });
  const zeira = R('רבי זירא', 260, { bio: 'היה תלמיד רב הונא ורב יהודה בבבל.' });
  const abaye = R('אביי', 281, { bio: 'תלמידם של רבה ורב יוסף, ולאחריהם עמד בראש.' });
  const rabbah = R('רבה', 280);
  const yosef = R('רב יוסף', 270);
  const rels = parseRelations([rashi, rav, tam, zeira, abaye, rabbah, yosef]);
  assert.deepEqual(rels.map(r => [r.kind, r.from, r.to]), [
    ['grandfather', rashi.id, tam.id],
    ['teacher', rabbah.id, abaye.id],
    ['teacher', yosef.id, abaye.id],
  ]);
});

test('"תלמידיו" (his students) is not read as "student of"', () => {
  const a = R('רבי יהודה החסיד', 1150, { bio: 'בין תלמידיו רבי אלעזר מגרמייזא.' });
  const b = R('רבי אלעזר מגרמייזא', 1176);
  assert.deepEqual(parseRelations([a, b]), []);
});

test('hebrew date keys fold spelling, "ב" before the month and Adar variants', () => {
  assert.equal(dateKey('ט״ו באב'), dateKey('ט"ו אב'));
  assert.equal(dateKey('ט״ו אדר ב'), dateKey('ט"ו אדר'));
  assert.notEqual(dateKey('ט"ו אב'), dateKey('ט"ז אב'));
});

test('masks the rabbi’s own name, with prefixes, but not other words', () => {
  const meir = { name: 'רבי מאיר בעל הנס', fullName: null };
  assert.equal(maskName('נקרא "מאיר" — אלהא דמאיר ענני. שהאיר עיניים.', meir), 'נקרא "___" — אלהא ד___ ענני. שהאיר עיניים.');
});

test('duplicate entries (same bio + period) collapse', () => {
  const a = R('ערוך לנר', 1798, { bio: 'רב העיר אלטונה.' });
  const b = { ...a, id: 'dup', name: 'הערוך לנר' };
  assert.equal(dedupe([a, b]).length, 1);
});

test('every generated question has four distinct options and one answer', () => {
  const pool: KRabbi[] = [];
  for (let i = 0; i < 40; i++) {
    pool.push(R(`רב ${i}א`, -400 + Math.floor(i / 2) * 60 + (i % 2) * 10, { deathDate: `${['א', 'ב', 'ג', 'ד', 'ה'][i % 5]} ${['ניסן', 'אייר', 'סיון', 'תמוז', 'אב', 'אלול', 'תשרי', 'כסלו'][i % 8]}`, category: i < 20 ? 'tannaim' : 'rishonim' }));
  }
  pool.push(R("תלמיד", 210, { bio: `תלמידו של ${pool[20].name}.` }));
  for (const kind of ['era', 'yahrzeit', 'relation', 'contemporary'] as const) {
    for (let i = 0; i < 25; i++) {
      const q = buildKnowledgeQuestion(pool, Math.random, new Set(), kind);
      assert.ok(q, kind);
      assert.equal(q.options.length, 4);
      assert.equal(new Set(q.options).size, 4);
      assert.ok(q.answer >= 0 && q.answer < 4);
    }
  }
});

test('era distractors stay two centuries clear of the whole lifetime', () => {
  const pool = Array.from({ length: 10 }, (_, i) => R(`איש ${i}ב`, 1000 + i * 100));
  for (let i = 0; i < 40; i++) {
    const q = buildKnowledgeQuestion(pool, Math.random, new Set(), 'era')!;
    const nums = q.options.map(o => Number(o.match(/\d+/)![0]));
    const correct = nums[q.answer];
    nums.forEach((x, j) => { if (j !== q.answer) assert.ok(Math.abs(x - correct) >= 2, q.options.join()); });
  }
});
