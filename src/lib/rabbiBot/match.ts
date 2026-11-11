import { tokenize } from './text';
import { expandAbbrev, isAbbrev } from './abbrev';

/**
 * Matching words between a question and the sources (ranking and excerpts —
 * never quoting, which stays exact in text.ts): spelling-, prefix- and
 * abbreviation-tolerant. Pure — unit-tested in tests/rabbiBot.test.ts.
 */

/**
 * Spelling-tolerant form for matching (ranking only — never quoting): ו/י after
 * the first letter dropped, so full and defective spellings meet
 * (תפילה/תפלה, ויבוא/ויבא, מצווה/מצוה, אישה/אשה), and a construct or plural
 * ending in ת meets the absolute.
 */
export function skeleton(w: string): string {
  const s = w.length <= 2 ? w : w[0] + w.slice(1).replace(/[וי]/g, '');
  // Construct and plural forms meet the absolute: תפילת/תפלה, ברכות/ברכה, הדלקת/הדלקה.
  return s.length >= 4 && s.endsWith('ת') ? `${s.slice(0, -1)}ה` : s;
}

const PREFIX = /^[בהולמשכ]/;

/** Every word of `text` in skeleton form, also without a one-letter prefix (ב/ה/ו/ל/מ/ש/כ). */
export function wordForms(text: string): Set<string> {
  const out = new Set<string>();
  tokenize(text).forEach(({ raw, norm }) => {
    out.add(skeleton(norm));
    if (norm.length >= 4 && PREFIX.test(norm)) out.add(skeleton(norm.slice(1)));
    if (isAbbrev(raw)) expandAbbrev(norm).forEach(w => out.add(skeleton(w)));
  });
  return out;
}

/** A query word's forms to look up: itself and, behind a one-letter prefix, without it ("בהבדלה" → "הבדלה"). */
export function keysOf(w: string): string[] {
  return w.length >= 4 && PREFIX.test(w) ? [skeleton(w), skeleton(w.slice(1))] : [skeleton(w)];
}

/** Does a text (its wordForms) hold this query word? */
export const holds = (forms: Set<string>, w: string) => keysOf(w).some(k => forms.has(k));

/** How many of `words` occur in `text` (prefix- and spelling-tolerant on both sides). */
export function overlap(text: string, words: string[]): number {
  const forms = wordForms(text);
  return words.filter(w => holds(forms, w)).length;
}

/** Trim a long passage to a window around its best keyword hit. */
export function excerpt(text: string, words: string[], max: number): string {
  if (text.length <= max) return text;
  const toks = tokenize(text);
  // Which of `words` each token stands for (-1: none) — computed once, then a
  // sliding window counts the distinct words in it (linear in the text).
  const index = new Map(words.flatMap((w, i) => keysOf(w).map(k => [k, i] as const)).reverse());
  const which = toks.map(({ norm }) => index.get(skeleton(norm))
    ?? (norm.length >= 4 && PREFIX.test(norm) ? index.get(skeleton(norm.slice(1))) : undefined) ?? -1);
  const span = Math.max(20, Math.floor(max / 6));
  const inWindow = new Map<number, number>();
  const move = (i: number, d: number) => {
    if (which[i] < 0) return;
    const n = (inWindow.get(which[i]) ?? 0) + d;
    if (n > 0) inWindow.set(which[i], n); else inWindow.delete(which[i]);
  };
  let bestAt = 0;
  let bestScore = -1;
  for (let i = 0; i < toks.length; i++) {
    move(i, 1);
    if (i >= span) move(i - span, -1);
    const startAt = Math.max(0, i - span + 1);
    if (inWindow.size > bestScore) { bestScore = inWindow.size; bestAt = startAt; }
  }
  const start = Math.max(0, bestAt - 10);
  let out = '';
  let end = start;
  for (; end < toks.length && out.length + toks[end].raw.length < max; end++) out += (out ? ' ' : '') + toks[end].raw;
  return `${start > 0 ? '… ' : ''}${out}${end < toks.length ? ' …' : ''}`;
}
