import type { PlayLevel, PlayQuestion } from '@/types/play';
import { calculateGematria } from '@/lib/gematria';
import { HE } from '@/lib/hebrewTexts';
import { shuffled, sortedNumeric, withOptions, type Rng } from './util';

/** Book and gematria question builders. */
export interface SrcBook { id: string; title: string; author: string; }
export interface SrcGematria { id: string; word: string; value: number; }

export function bookQ(b: SrcBook, books: SrcBook[], rng: Rng): PlayQuestion | null {
  if (b.title.includes(b.author)) return null;
  const wrong = shuffled(books.filter(o => o.author !== b.author), rng).map(o => o.author);
  return withOptions('book', HE.PLAY_Q_BOOK(b.title), b.author, wrong, rng, { explain: `${b.title} — ${b.author}` });
}

/** Reverse: given an author, which of these books is theirs? */
export function bookOfQ(b: SrcBook, books: SrcBook[], rng: Rng): PlayQuestion | null {
  if (b.title.includes(b.author)) return null;
  const wrong = shuffled(books.filter(o => o.author !== b.author && !o.title.includes(o.author)), rng).map(o => o.title);
  const all = books.filter(o => o.author === b.author).map(o => o.title).join(', ');
  return withOptions('bookOf', HE.PLAY_Q_BOOK_OF(b.author), b.title, wrong, rng, { explain: `${b.author} — ${all}` });
}

const OFFSETS: Record<PlayLevel, number[]> = {
  easy: [-90, -70, -50, -40, 40, 50, 70, 90],
  normal: [-30, -20, -12, -9, -6, -3, 3, 6, 9, 12, 20, 30],
  hard: [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6],
};

const valid = (g: SrcGematria) => g.value >= 5 && calculateGematria(g.word) === g.value;

export function gematriaQ(g: SrcGematria, level: PlayLevel, rng: Rng): PlayQuestion | null {
  if (!valid(g)) return null;
  const wrong = shuffled(OFFSETS[level], rng).map(o => g.value + o).filter(v => v > 0).map(String);
  const right = String(g.value);
  return sortedNumeric(withOptions('gematria', HE.PLAY_Q_GEMATRIA, right, wrong, rng,
    { body: g.word, explain: `${g.word} = ${g.value}` }), right, Number);
}

/** Reverse: which of these words equals N? (Every option has a different value.) */
export function gematriaWordQ(g: SrcGematria, all: SrcGematria[], level: PlayLevel, rng: Rng): PlayQuestion | null {
  if (!valid(g)) return null;
  const pool = all.filter(o => valid(o) && o.value !== g.value);
  const byValue = new Map<number, SrcGematria>();
  pool.forEach(o => { if (!byValue.has(o.value)) byValue.set(o.value, o); });
  const near = Array.from(byValue.values()).sort((a, b) => Math.abs(a.value - g.value) - Math.abs(b.value - g.value));
  const wrong = level === 'hard' ? near.slice(0, 3) : shuffled(near, rng);
  return withOptions('gematriaWord', HE.PLAY_Q_GEMATRIA_WORD(g.value), g.word, wrong.map(o => o.word), rng, {
    body: String(g.value),
    explain: [g, ...wrong.slice(0, 3)].map(o => `${o.word} = ${o.value}`).join(' · '),
  });
}
