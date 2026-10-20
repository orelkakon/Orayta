import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCode, isCode, validateName, validateSettings, questionPoints, rankOf, nextPhase, leadMsFor, GRACE_MS,
} from '@/lib/play/rules';
import { buildQuestions, type PlaySource } from '@/lib/play/build';
import { dafToNumber } from '@/lib/hebrewData';
import { calculateGematria } from '@/lib/gematria';
import type { PlaySettings } from '@/types/play';
import { buildState, shouldAutoReveal, type Snapshot } from '@/lib/play/state';

function seeded(seed: number): () => number {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) % 2147483648; return s / 2147483648; };
}

test('codes are 6 digits without a leading zero', () => {
  const rng = seeded(7);
  for (let i = 0; i < 200; i++) assert.ok(isCode(generateCode(rng)));
  assert.equal(isCode('012345'), false);
  assert.equal(isCode('12345'), false);
});

test('names: trimmed, bidi stripped, links and empties rejected', () => {
  assert.equal(validateName('  משה  כהן '), 'משה כהן');
  assert.equal(validateName('‮שרה'), 'שרה');
  assert.equal(validateName('   '), null);
  assert.equal(validateName('א'.repeat(17)), null);
  assert.equal(validateName('www.spam.com'), null);
  assert.equal(validateName(42), null);
});

test('settings: only allowed values survive', () => {
  assert.deepEqual(validateSettings({ kinds: ['masechet', 'x'], count: 10, seconds: 20, masechet: 'ברכות', level: 'hard' }),
    { kinds: ['masechet'], count: 10, seconds: 20, level: 'hard', masechet: 'ברכות' });
  assert.equal(validateSettings({ kinds: [], count: 10, seconds: 20 }), null);
  assert.equal(validateSettings({ kinds: ['era'], count: 7, seconds: 20 }), null);
  assert.deepEqual(validateSettings({ kinds: ['era'], count: 5, seconds: 10, masechet: 'לא קיימת', level: '??', eras: ['tannaim', 'nope'] }),
    { kinds: ['era'], count: 5, seconds: 10, level: 'normal', eras: ['tannaim'] });
});

test('points: fast beats slow, wrong is zero, streak bonus is capped', () => {
  assert.equal(questionPoints(true, 0, 20000, 1), 1000);
  assert.equal(questionPoints(true, 20000, 20000, 1), 500);
  assert.equal(questionPoints(true, 10000, 20000, 1), 750);
  assert.equal(questionPoints(false, 0, 20000, 5), 0);
  assert.equal(questionPoints(true, 0, 20000, 3), 1100);
  assert.equal(questionPoints(true, 0, 20000, 50), 1250);
});

test('ranking shares places on ties', () => {
  const rows = [{ score: 10 }, { score: 30 }, { score: 30 }, { score: 5 }];
  const r = rankOf(rows);
  assert.deepEqual(rows.map(x => r.get(x)), [3, 1, 1, 4]);
});

test('phase machine', () => {
  assert.deepEqual(nextPhase('lobby', -1, 5, 'start'), { status: 'question', current: 0 });
  assert.equal(nextPhase('lobby', -1, 5, 'reveal'), null);
  assert.deepEqual(nextPhase('question', 2, 5, 'reveal'), { status: 'reveal', current: 2 });
  assert.deepEqual(nextPhase('reveal', 2, 5, 'next'), { status: 'question', current: 3 });
  assert.deepEqual(nextPhase('board', 4, 5, 'next'), { status: 'ended', current: 4 });
  assert.equal(nextPhase('ended', 4, 5, 'end'), null);
  assert.deepEqual(nextPhase('question', 1, 5, 'end'), { status: 'ended', current: 1 });
});

test('lead time scales with prompt length within bounds', () => {
  assert.equal(leadMsFor('קצר'), 2500);
  assert.equal(leadMsFor('א'.repeat(1000)), 7000);
});

const CATS = ['tannaim', 'amoraim', 'rishonim', 'acharonim', 'geonim'];
const SRC: PlaySource = {
  citations: Array.from({ length: 12 }, (_, i) => ({
    id: `c${i}`,
    content: `ציטוט מספר ${i} שיש בו הרבה מילים כדי שיהיה אפשר לחתוך אותו לשני חלקים ברורים ${i}`,
    locations: [{ masechet: i % 2 ? 'ברכות' : 'שבת', seder: i % 2 ? 'סדר זרעים' : 'סדר מועד', daf: ['ב', 'י', 'כ', 'ל'][i % 4], amud: null }],
  })),
  rabbis: Array.from({ length: 30 }, (_, i) => ({
    id: `r${i}`, name: `רבי פלוני ${i}`, fullName: null,
    bio: `היה גדול הדור ופעל רבות בהפצת תורה ברבים בעירו מספר ${i} ובסביבתה הקרובה`,
    category: CATS[i % 5], sortYear: 100 + i * 60, datePeriod: `${100 + i * 60} - ${160 + i * 60}`,
    deathDate: null, imageUrl: i % 3 ? `https://example.org/r${i}.jpg` : null,
  })),
  books: Array.from({ length: 8 }, (_, i) => ({ id: `b${i}`, title: `ספר ${i}`, author: `רבי פלוני ${i}`, rabbiId: `r${i}` })),
  gematria: [
    { id: 'g1', word: 'שלום', value: 376 }, { id: 'g2', word: 'אמת', value: 441 },
    { id: 'g3', word: 'חסד', value: 72 }, { id: 'g4', word: 'יין', value: 70 }, { id: 'g5', word: 'אהבה', value: 13 },
  ],
};
const ALL = ['masechet', 'daf', 'complete', 'seder', 'era', 'whoFirst', 'whoLast', 'bio', 'image', 'book', 'bookOf', 'gematria', 'gematriaWord'] as const;
const opts = (over: Partial<PlaySettings> = {}): PlaySettings => ({ kinds: [...ALL], count: 10, seconds: 20, level: 'normal', ...over });

test('questions: valid options, correct index, no repeats, every chosen type shows up', () => {
  for (let seed = 1; seed < 30; seed++) {
    const qs = buildQuestions(SRC, opts({ count: 20 }), seeded(seed));
    assert.equal(qs.length, 20);
    for (const q of qs) {
      assert.equal(q.options.length, 4, q.kind);
      assert.equal(new Set(q.options).size, 4, q.kind);
      assert.ok(q.correct >= 0 && q.correct < 4);
      assert.ok(q.leadMs >= 2500 && q.leadMs <= 7000);
    }
    if (seed === 1) assert.ok(new Set(qs.map(q => q.kind)).size >= 11);
  }
});

test('only the chosen types are asked', () => {
  const qs = buildQuestions(SRC, opts({ kinds: ['daf', 'gematriaWord'], count: 6 }), seeded(3));
  assert.ok(qs.length >= 5);
  assert.ok(qs.every(q => q.kind === 'daf' || q.kind === 'gematriaWord'));
});

test('eras filter keeps rabbi questions inside the chosen eras', () => {
  const tannaim = new Set(SRC.rabbis.filter(r => r.category === 'tannaim').map(r => r.name));
  for (let seed = 1; seed < 15; seed++) {
    for (const q of buildQuestions(SRC, opts({ kinds: ['bio', 'image'], eras: ['tannaim'], count: 4 }), seeded(seed))) {
      assert.ok(tannaim.has(q.options[q.correct]));
    }
  }
});

test('daf options are real pages of the masechet, ascending', () => {
  for (const level of ['easy', 'normal', 'hard'] as const) {
    for (const q of buildQuestions(SRC, opts({ kinds: ['daf'], count: 5, level }), seeded(9))) {
      const nums = q.options.map(dafToNumber);
      assert.deepEqual([...nums].sort((a, b) => a - b), nums);
      assert.ok(nums.every(n => n >= 2 && n <= 157));
    }
  }
});

test('seder questions are dropped when the game is scoped to one seder', () => {
  const qs = buildQuestions(SRC, opts({ kinds: ['seder', 'complete'], seder: 'סדר מועד', count: 5 }), seeded(2));
  assert.ok(qs.every(q => q.kind !== 'seder'));
});

test('masechet questions never offer another location of the same citation', () => {
  const src = { ...SRC, citations: SRC.citations.map(c => ({ ...c, locations: [...c.locations, { masechet: 'יומא', seder: 'סדר מועד', daf: 'ג', amud: 'א' }] })) };
  for (let seed = 1; seed < 20; seed++) {
    for (const q of buildQuestions(src, opts({ kinds: ['masechet'], count: 5 }), seeded(seed))) {
      assert.ok(!q.options.includes('יומא'));
    }
  }
});

test('who-first / who-last: the right answer is the earliest / latest', () => {
  for (let seed = 1; seed < 20; seed++) {
    for (const q of buildQuestions(SRC, opts({ kinds: ['whoFirst', 'whoLast'], count: 6 }), seeded(seed))) {
      const years = q.options.map(n => SRC.rabbis.find(r => r.name === n)!.sortYear);
      assert.equal(years[q.correct], q.kind === 'whoFirst' ? Math.min(...years) : Math.max(...years));
    }
  }
});

test('gematria word: exactly one option has the asked value', () => {
  for (const q of buildQuestions(SRC, opts({ kinds: ['gematriaWord'], count: 5 }), seeded(4))) {
    const n = Number(q.body);
    assert.equal(q.options.filter(o => calculateGematria(o) === n).length, 1);
    assert.equal(calculateGematria(q.options[q.correct]), n);
  }
});

const snap = (over: Partial<Snapshot> = {}): Snapshot => ({
  id: 's', code: '123456', status: 'question', current: 0, phaseAt: 0, questionMs: 20000, version: 3,
  settings: { kinds: ['masechet'], count: 1, seconds: 20, level: 'normal' },
  questions: [{ kind: 'masechet', prompt: 'p', options: ['א', 'ב', 'ג', 'ד'], correct: 2, leadMs: 3000 }],
  players: [
    { id: 'a', name: 'א', avatar: '🦁', score: 900, streak: 1, kicked: false },
    { id: 'b', name: 'ב', avatar: '🦁', score: 500, streak: 0, kicked: false },
    { id: 'k', name: 'ק', avatar: '🦁', score: 0, streak: 0, kicked: true },
  ],
  answers: [{ playerId: 'a', choice: 2, correct: true, points: 900 }],
  ...over,
});

test('state hides the answer until reveal', () => {
  const st = buildState(snap(), { playerId: 'a', isHost: false }, 5000);
  assert.equal(st.reveal, null);
  assert.equal(st.me?.correct, null);
  assert.equal(st.me?.answered, true);
  assert.equal(st.question?.opensAt, 3000);
  assert.equal(st.question?.endsAt, 23000);
  assert.equal(st.playerCount, 2);
  assert.deepEqual(st.roster, []);
  assert.ok(!JSON.stringify(st).includes('"correct":2'));
});

test('state after reveal: counts, ranks with previous ranks, gap', () => {
  const st = buildState(snap({ status: 'reveal' }), { playerId: 'b', isHost: false }, 30000);
  assert.deepEqual(st.reveal?.counts, [0, 0, 1, 0]);
  assert.equal(st.board[0].id, 'a');
  assert.equal(st.board[0].prevRank, 2);
  assert.equal(st.board[0].delta, 900);
  assert.equal(st.me?.correct, false);
  assert.equal(st.me?.gapUp, 400);
});

test('auto reveal: after the buzzer or once every active player answered', () => {
  assert.equal(shouldAutoReveal(snap(), 10000), false);
  assert.equal(shouldAutoReveal(snap(), 23000 + GRACE_MS + 1), true);
  const all = snap({ answers: [{ playerId: 'a', choice: 2, correct: true, points: 900 }, { playerId: 'b', choice: 0, correct: false, points: 0 }] });
  assert.equal(shouldAutoReveal(all, 10000), true);
  assert.equal(shouldAutoReveal(snap({ status: 'reveal' }), 99999), false);
});
