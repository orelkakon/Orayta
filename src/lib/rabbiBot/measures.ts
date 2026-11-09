import { fetchText, searchExactTexts, searchRefs, SefariaText } from './sefaria';
import { tokenize } from './text';

// Server-side lookup for "how much is <a halachic measure> in liters / cm /
// grams". The Shulchan Arukh and its commentaries give measures in eggs,
// fingers and dirhams; the modern sizes are written by later works filed
// elsewhere in the library (Peninei Halakhah, Steinsaltz, Mishnat Eretz
// Yisrael on the Mishnah), so this search spans the whole library.

/** A modern unit family the question asks in → how the sources spell it out. */
const UNITS: { detect: RegExp; words: string[] }[] = [
  { detect: /ליטר|מ"ל|סמ"ק|סמק|כוס(ות)?\s+(מים|רגיל)/, words: ['ליטר', 'מיליליטר'] },
  { detect: /ס"מ|סנטימטר|מטר|ק"מ|אינץ/, words: ['סנטימטר', 'מטר'] },
  { detect: /גרם|ק"ג|קילו/, words: ['גרם'] },
];

const HITS_PER_SEARCH = 3;
const EXACT_HITS = 60;
const MAX_TEXTS = 4;

/** The unit words to pair with the measure's name, for a question asked in modern units. Pure — unit-tested. */
export function unitWords(question: string): string[] {
  const text = question.replace(/[״”“]/g, '"');
  return UNITS.filter(u => u.detect.test(text)).flatMap(u => u.words);
}

/** Words that are modern units wherever they appear (never "ליטרא / ליטרות", the old weight). */
const MODERN = new Set(['ליטר', 'ליטרים', 'מיליליטר', 'סנטימטר', 'סנטימטרים', 'קילומטר']);
/** Modern only after a number: "מטר" is also rain, "גרם" "caused", and מ״ל / ס״מ are other abbreviations too. */
const AFTER_NUMBER = new Set(['מטר', 'מטרים', 'גרם', 'גרמים', 'מל', 'סמק', 'סמ', 'קמ', 'קג']);
const NUMBER_WORDS = new Set(['אחד', 'אחת', 'שנים', 'שניים', 'שתים', 'שתיים', 'שלוש', 'שלושה', 'שלש', 'שלשה', 'ארבע', 'ארבעה', 'חמש', 'חמישה',
  'חמשה', 'שש', 'שישה', 'ששה', 'שבע', 'שבעה', 'שמונה', 'תשע', 'תשעה', 'עשר', 'עשרה', 'עשרים', 'שלושים', 'ארבעים', 'חמישים', 'שישים',
  'שבעים', 'שמונים', 'תשעים', 'מאה', 'מאות', 'אלף', 'חצי', 'רבע', 'שליש']);
/** A Hebrew-letter numeral ("ב'", "י״ב") — the old texts' way of counting litras. */
const LETTER_NUMERAL = /^[א-ת]{1,3}['׳"״]([א-ת])?$/;

/**
 * Whether a passage states a size in modern units — so a Rishon's "לוג ב'
 * ליטרים" (litras, a weight) or "מטר" (rain) never pass as liters or meters.
 * Pure — unit-tested.
 */
export function hasModernUnit(text: string): boolean {
  const toks = tokenize(text);
  return toks.some((t, i) => {
    const prev = toks[i - 1]?.raw ?? '';
    const unit = t.norm.replace(/^[בכל]/, '');
    const counted = /\d$/.test(prev) || /^\d/.test(t.raw) || NUMBER_WORDS.has((toks[i - 1]?.norm ?? '').replace(/^[וכ]+/, ''));
    if (AFTER_NUMBER.has(t.norm) || AFTER_NUMBER.has(unit)) return counted;
    if (!MODERN.has(t.norm) && !MODERN.has(unit)) return false;
    return !LETTER_NUMERAL.test(prev);
  });
}

/**
 * Passages that give the measure (`terms`) in modern units: the halacha books
 * naming it (exact word, with and without ה־) whose text has a modern unit —
 * Steinsaltz on the Rambam, Peninei Halakhah — then the measure paired with
 * the question's unit anywhere in the library.
 */
export async function measureTexts(question: string, terms: string[]): Promise<SefariaText[]> {
  const units = unitWords(question);
  if (units.length === 0 || terms.length === 0) return [];
  const names = terms.slice(0, 2);
  const pairs = names.flatMap(t => units.map(u => `${t} ${u}`));
  const [exact, paired] = await Promise.all([
    Promise.all(names.flatMap(t => [t, `ה${t}`]).map(t => searchExactTexts(t, 'Halakhah', EXACT_HITS))),
    Promise.all(pairs.map(p => searchRefs(p, null, HITS_PER_SEARCH))),
  ]);
  const halachic = exact.map(hits => hits.filter(h => hasModernUnit(h.text)).slice(0, 2).map(h => h.ref));
  const refs = Array.from(new Set([...halachic.flat(), ...paired.flat()]));
  const texts = await Promise.all(refs.map(fetchText));
  return texts.filter((t): t is SefariaText => t !== null && t.segments.some(x => hasModernUnit(x.text))).slice(0, MAX_TEXTS);
}
