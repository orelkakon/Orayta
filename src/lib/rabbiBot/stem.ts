import { skeleton } from './match';

/**
 * Word keys for searching the Shulchan Arukh (saIndex.ts). A question asks
 * "מה מברכים", the seif rules "מברך" and the title says "ברכות": each word is
 * indexed under three forms, from strict to loose — as written, its
 * spelling-tolerant skeleton (ו/י dropped, construct ת = ה) and a light stem
 * (plural / construct / feminine / possessive ending dropped, final letters
 * plain) — each also without one or two prefix letters (ו, ה, ב, ל, מ, ש, כ).
 * A looser match counts for less, so "זימון" (skeleton "זמן") still prefers
 * seifim that say "זימון", and "תפילין" ones about tefillin over tefillah.
 * Pure — unit-tested.
 */

const FINAL: Record<string, string> = { ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' };
const PREFIX = /^[ובהלמשכ]/;
/** Two prefix letters only as Hebrew combines them (ו/ש + a prefix, כש, מש, מה) — "מברכים" is not מ + ב + "רכים". */
const DOUBLE = /^(ו[הבלמשכ]|ש[הבלמכ]|כש|מש|מה)/;

/** The light stem of a word in comparison form (normWord). */
export function stemOf(norm: string): string {
  let w = norm.replace(/[ךםןףץ]/g, c => FINAL[c]);
  if (/(ימ|ינ|ות)$/.test(w) && w.length >= 4) w = w.slice(0, -2);
  else if (/[הת]$/.test(w) && w.length >= (w.endsWith('ת') ? 4 : 3)) w = w.slice(0, -1);
  else if (w.endsWith('ו') && w.length >= 4) w = w.slice(0, -1);
  const s = w.length <= 1 ? w : w[0] + w.slice(1).replace(/[וי]/g, '');
  return s.length >= 2 ? s : norm;
}

/** The word without one prefix letter, and without two when they combine ("והשותה" → "השותה", "שותה"), while ≥ 3 letters remain. */
export function unprefixed(norm: string): string[] {
  const out: string[] = [];
  if (norm.length >= 4 && PREFIX.test(norm)) out.push(norm.slice(1));
  if (norm.length >= 5 && DOUBLE.test(norm)) out.push(norm.slice(2));
  return out;
}

/** The stems a word may stand for, with and without a prefix ("ברכת" → "ברכ", "רכת"; "מברכים" → "מברכ", "ברכ"). */
export function conceptsOf(norm: string): string[] {
  return Array.from(new Set([norm, ...unprefixed(norm)].map(stemOf)));
}

export interface WordKey { key: string; weight: number }

/** How much each kind of match counts; a question word matched only without its prefix counts BARE as much. */
export const KEY_WEIGHT = { form: 1, skeleton: 0.85, stem: 0.7 } as const;
const BARE = 0.85;

/** A word's keys, strictest first, each once (a key keeps its strongest weight). Kinds are marked so they never meet. */
export function queryKeys(norm: string): WordKey[] {
  const best = new Map<string, number>();
  const add = (key: string, weight: number) => { if ((best.get(key) ?? 0) < weight) best.set(key, weight); };
  [norm, ...unprefixed(norm)].forEach((w, i) => {
    const f = i === 0 ? 1 : BARE;
    add(`=${w}`, KEY_WEIGHT.form * f);
    add(`.${skeleton(w)}`, KEY_WEIGHT.skeleton * f);
    add(`~${stemOf(w)}`, KEY_WEIGHT.stem * f);
  });
  return Array.from(best, ([key, weight]) => ({ key, weight })).sort((a, b) => b.weight - a.weight);
}

/** Every key a word in the text is found under (the same keys as queryKeys, without weights — built for ~50k words at once). */
export function textKeys(norm: string): string[] {
  const out: string[] = [];
  const push = (k: string) => { if (!out.includes(k)) out.push(k); };
  push(`=${norm}`); push(`.${skeleton(norm)}`); push(`~${stemOf(norm)}`);
  for (const w of unprefixed(norm)) { push(`=${w}`); push(`.${skeleton(w)}`); push(`~${stemOf(w)}`); }
  return out;
}
