import type { PlayQuestion, PlayQuestionKind } from '@/types/play';
import { leadMsFor } from './rules';

/** Small pure helpers for the question builders. */
export type Rng = () => number;

/** Fisher–Yates with an injectable RNG (seeded in tests). */
export function shuffled<T>(arr: readonly T[], rng: Rng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Clips at a word boundary so an option never ends mid-word. */
export function clipWords(text: string, n: number): string {
  if (text.length <= n) return text;
  const cut = text.slice(0, n);
  const space = cut.lastIndexOf(' ');
  return `${(space > n * 0.6 ? cut.slice(0, space) : cut).trimEnd()}…`;
}

export interface Extra { body?: string; explain?: string; image?: string; }

/** Puts the right answer among 3 distinct distractors at a random position. */
export function withOptions(kind: PlayQuestionKind, prompt: string, right: string, wrong: string[], rng: Rng, extra: Extra = {}): PlayQuestion | null {
  const distinct = Array.from(new Set(wrong.filter(w => w && w !== right))).slice(0, 3);
  if (distinct.length < 3) return null;
  const options = shuffled([right, ...distinct], rng);
  const leadMs = Math.min(7000, leadMsFor(prompt, extra.body) + (extra.image ? 1500 : 0));
  return { kind, prompt, ...extra, options, correct: options.indexOf(right), leadMs };
}

/** Same, but numbers stay in ascending order (they read best that way). */
export function sortedNumeric(q: PlayQuestion | null, right: string, value: (o: string) => number): PlayQuestion | null {
  if (!q) return null;
  const options = [...q.options].sort((a, b) => value(a) - value(b));
  return { ...q, options, correct: options.indexOf(right) };
}
