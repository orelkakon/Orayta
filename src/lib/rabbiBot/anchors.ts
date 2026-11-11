import { fetchText, searchRefs, SefariaText } from './sefaria';

// Server-only: the Shulchan Arukh simanim a halacha question may sit in.

/** The four parts of the Shulchan Arukh itself (not its commentaries). */
export const SA_PATHS = ['Orach Chayim', "Yoreh De'ah", 'Even HaEzer', 'Choshen Mishpat']
  .map(part => `Halakhah/Shulchan Arukh/Shulchan Arukh, ${part}`);
const SA_REF = 'Shulchan Arukh, ';

/** Search hits asked for per lead (Sefaria repeats a seif once per version, so this many give a few distinct ones). */
const HITS = 8;
/** A pair is precise, so it may bring more: its few real hits hide among the repeats. */
const PAIR_HITS = 20;
const MAX_SIMANIM = 10;
/** Past the longest siman — Sefaria clamps a range to the siman's end. */
const WHOLE = 99;

/**
 * Refs → the distinct simanim they sit in, each as a whole-siman range
 * ("…672:1", "…672:2" → "…672:1-99"): the lead is often the siman's opening
 * seif and the case a few seifim on (296:2 → 296:8). Order of first appearance. Pure.
 */
export function simanRanges(refs: string[]): string[] {
  const simanim = refs.map(r => r.match(/^(.* \d+)(?::[\d:-]+)?$/)?.[1] ?? null).filter((x): x is string => x !== null);
  return Array.from(new Set(simanim), siman => `${siman}:1-${WHOLE}`);
}

/** a1, b1, c1, a2, b2, … without repeats — every lead's best guess comes first. Pure. */
export function interleave(lists: string[][]): string[] {
  const out: string[] = [];
  for (let i = 0; i < Math.max(0, ...lists.map(l => l.length)); i++) {
    lists.forEach(l => { if (l[i] && !out.includes(l[i])) out.push(l[i]); });
  }
  return out;
}

const distinct = (refs: string[]) => Array.from(new Set(refs));

/**
 * A phrase and its defective spelling (ו inside a word dropped: "יעלה ויבוא" →
 * "יעלה ויבא") — Sefaria's search matches spellings literally and the Shulchan
 * Arukh mostly writes defectively. Pure.
 */
export function spellings(phrase: string): string[] {
  const defective = phrase.split(' ').map(w => (w.length > 3 ? w[0] + w.slice(1, -1).replace(/ו/g, '') + w.slice(-1) : w)).join(' ');
  return defective === phrase ? [phrase] : [phrase, defective];
}

/**
 * Whole simanim from five leads, most precise first: the seifim the plan
 * names (often the right siman but the wrong seif), subject + ruling-verb
 * pairs, simanim whose title matches, the plan's phrases searched inside the
 * Shulchan Arukh itself (worded as it rules — "נשים חייבות בהבדלה" lands on
 * the seif), and the sources' term for the subject. Ranked by the caller.
 */
export interface SimanLeads {
  /** Refs the plan named (only Shulchan Arukh ones are used). */
  planned: string[];
  /** The subject term with the word the question implies ("יעלה ויבא מחזירין"). */
  pairs: string[];
  /** Simanim whose title matches the question and the plan's words (toc.ts). */
  titled: string[];
  phrases: string[];
  terms: string[];
}

export async function shulchanArukhSimanim({ planned, pairs, titled, phrases, terms }: SimanLeads): Promise<SefariaText[]> {
  const [pairHits, phraseHits, termHits] = await Promise.all([
    Promise.all(pairs.map(p => searchRefs(p, SA_PATHS, PAIR_HITS))),
    Promise.all(phrases.map(p => searchRefs(p, SA_PATHS, HITS))),
    Promise.all(terms.slice(0, 4).map(t => searchRefs(t, SA_PATHS, HITS))),
  ]);
  // A pair (the subject + the ruling's verb) is the most precise lead: all its hits go in right after the plan's own seifim.
  const leads = [
    ...planned.filter(r => r.startsWith(SA_REF)), ...distinct(pairHits.flat()), ...titled,
    ...interleave([...phraseHits, ...termHits].map(distinct)),
  ];
  const texts = await Promise.all(simanRanges(leads).slice(0, MAX_SIMANIM).map(fetchText));
  return texts.filter((t): t is SefariaText => t !== null);
}

/** "Shulchan Arukh, Orach Chayim 672:1-99" → "Arukh HaShulchan, Orach Chaim 672:1-99": the same siman, explained. Pure. */
export function arukhHaShulchanRef(saRef: string): string | null {
  const m = saRef.match(/^Shulchan Arukh, (Orach Chayim|Yoreh De'ah|Even HaEzer|Choshen Mishpat) (\d+)/);
  if (!m) return null;
  return `Arukh HaShulchan, ${m[1] === 'Orach Chayim' ? 'Orach Chaim' : m[1]} ${m[2]}:1-${WHOLE}`;
}
