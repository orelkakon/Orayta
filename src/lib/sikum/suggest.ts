import { toHebrewNumeral } from '@/lib/hebrewNumerals';

/**
 * Suggestions for the next summary in a book (pure, tested). Summaries run in
 * order — "סימן רל״ו" then "סימן רל״ז", "משנה ו" then "משנה ז", page "כז"
 * then "כח" — so the form offers the next one as a chip. A bare Hebrew word
 * counts as a number only when it is marked (רל״ז, ז׳) or follows a counter
 * word (פרק ז), and only in its canonical spelling — "וירא" is never 217.
 */
export const COUNTERS = new Set([
  'פרק', 'משנה', 'סימן', 'סעיף', 'דף', 'עמוד', 'הלכה', 'הלכות', 'פסוק', 'אות', 'מאמר', 'שער', 'חלק',
  'מצוה', 'מצווה', 'תורה', 'סעיפים', 'סימנים', 'פרקים', 'משניות', 'עמ׳', 'דפים', 'יום', 'שיעור', 'מספר',
]);
const VALUES: Record<string, number> = {
  א: 1, ב: 2, ג: 3, ד: 4, ה: 5, ו: 6, ז: 7, ח: 8, ט: 9, י: 10, כ: 20, ל: 30, מ: 40, נ: 50,
  ס: 60, ע: 70, פ: 80, צ: 90, ק: 100, ר: 200, ש: 300, ת: 400,
};

interface Numeral { value: number; marked: boolean; hebrew: boolean }

/** The number a token spells (Hebrew numeral or digits), or null. */
export function parseNumeral(token: string, afterCounter = false): Numeral | null {
  if (/^\d{1,4}$/.test(token)) return { value: Number(token), marked: false, hebrew: false };
  const marked = /["״׳']/.test(token);
  const letters = token.replace(/["״׳']/g, '');
  if (!/^[א-ת]{1,4}$/.test(letters) || (!marked && !afterCounter)) return null;
  let value = 0;
  for (const ch of letters) {
    const v = VALUES[ch];
    if (!v) return null; // final letters never spell a number
    value += v;
  }
  return toHebrewNumeral(value) === letters ? { value, marked, hebrew: true } : null;
}

/** A number written the way the original was (marks kept: ז׳ / רל״ז). */
export function formatNumeral(value: number, like: Numeral): string {
  if (!like.hebrew) return String(value);
  const h = toHebrewNumeral(value);
  if (!like.marked) return h;
  return h.length === 1 ? `${h}׳` : `${h.slice(0, -1)}״${h.slice(-1)}`;
}

const SEP = /^[–\-־,:;()]$/;
const DASH = /^[–\-־]$/;
const blank = (t: string) => !t.trim();
// Abbreviations that spell a number but never count: ה׳ (the Name), ע״א / ע״ב (a page's side).
const NOT_COUNTED = new Set(['ה׳', "ה'", 'ע״א', 'ע״ב', 'ע"א', 'ע"ב']);

/** Index of the nearest non-blank token before `i` (separators included), or -1. */
function prevIndex(tokens: string[], i: number): number {
  for (let j = i - 1; j >= 0; j--) if (!blank(tokens[j])) return j;
  return -1;
}

/**
 * The text with its last number moved on by one; null when it holds none.
 * A range continues from its end ("עמוד 7–10" → "עמוד 11"), and the subtitle
 * after the number belongs to the old one ("סימן רל״ז – ברכות" → "סימן רל״ח – ").
 */
export function nextInSequence(text: string): string | null {
  const tokens = text.trim().split(/(\s+|[–\-־,:;()])/);
  const words = tokens.filter(t => !blank(t) && !SEP.test(t));
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (blank(tokens[i]) || SEP.test(tokens[i]) || NOT_COUNTED.has(tokens[i])) continue;
    let p = prevIndex(tokens, i);
    while (p >= 0 && SEP.test(tokens[p])) p = prevIndex(tokens, p);
    const counter = p >= 0 && COUNTERS.has(tokens[p]);
    const n = parseNumeral(tokens[i], counter || words.length === 1);
    if (!n || (n.hebrew && !n.marked && !counter && words.length > 1)) continue;
    const next = formatNumeral(n.value + 1, n);
    const sep = prevIndex(tokens, i);
    const rangeStart = sep >= 0 && DASH.test(tokens[sep]) ? prevIndex(tokens, sep) : -1;
    if (rangeStart >= 0 && parseNumeral(tokens[rangeStart], true)) {
      return [...tokens.slice(0, rangeStart), next].join('').trim();
    }
    const tail = tokens.slice(i + 1);
    const dash = tail.findIndex(t => DASH.test(t));
    if (dash >= 0) return `${[...tokens.slice(0, i), next].join('').trim()} – `;
    return [...tokens.slice(0, i), next, ...tail].join('').trim();
  }
  return null;
}

/** "וירא – חיי עולם הזה" → "וירא – " (several summaries on one parasha / topic). */
export function topicPrefix(title: string): string | null {
  const m = title.match(/^(.{2,40}?)\s[–\-]\s\S/);
  return m ? `${m[1]} – ` : null;
}

interface Written { title: string | null; location: string | null; createdAt: string }

export interface NextSuggestions { titles: string[]; location: string | null }

/** Chips for a new summary, from the one written last in the book. */
export function suggestNext(entries: Written[]): NextSuggestions {
  const last = [...entries].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))[0];
  if (!last) return { titles: [], location: null };
  const titles: string[] = [];
  const title = last.title?.trim() ?? '';
  const seq = title && nextInSequence(title);
  if (seq) titles.push(seq);
  const prefix = !seq && title ? topicPrefix(title) : null;
  if (prefix) titles.push(prefix);
  const location = last.location?.trim() ? nextInSequence(last.location.trim()) : null;
  return { titles, location };
}
