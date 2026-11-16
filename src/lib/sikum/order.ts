import { COUNTERS, parseNumeral } from '@/lib/sikum/suggest';
import { INTRO_WORDS, MARKERS, MAX_PHRASE, isAbbreviation, placeOf } from '@/lib/sikum/sequences';

/**
 * "Smart" ordering of summaries inside a book (pure, tested). A title is read
 * as parts: numbers ("סימן י״א" = 11, "עמוד 12"), names with a known place
 * (parashot, Tanakh, tractates, Shulchan Arukh parts — `sequences.ts`) and
 * words. A Hebrew word counts as a number only when marked (י״א, ז׳), after
 * a counter word (סימן יא) or alone — the same rule as the next-title
 * suggestions, so "וירא" stays a word (a parasha, in fact).
 */
type Part = { num: number; counted: boolean } | { place: number } | { text: string };

const SPLIT = /(\s+|[–\-־,:;().!?])/;
const SEP = /^[–\-־,:;().!?]$/;
// Abbreviations that spell a number but are words here: ה׳ (the Name), ע״א / ע״ב (a page's side).
const NOT_COUNTED = new Set(['ה׳', "ה'", 'ע״א', 'ע״ב', 'ע"א', 'ע"ב']);

interface Word { w: string; sepAfter: boolean }

function wordsOf(text: string): Word[] {
  const out: Word[] = [];
  for (const t of text.trim().split(SPLIT)) {
    if (!t.trim()) continue;
    if (SEP.test(t)) { if (out.length) out[out.length - 1].sepAfter = true; continue; }
    out.push({ w: t, sepAfter: false });
  }
  return out;
}

/** A known name starting at word i: [place, words used], or null. */
function nameAt(words: Word[], i: number): [number, number] | null {
  if (isAbbreviation(words[i].w)) return [placeOf([words[i].w]) ?? 0, 1];
  const marker = i > 0 && MARKERS.has(words[i - 1].w);
  if (i > 0 && !marker) return null;
  for (let len = Math.min(MAX_PHRASE, words.length - i); len >= 1; len--) {
    const slice = words.slice(i, i + len);
    if (slice.slice(0, -1).some(x => x.sepAfter)) continue;
    const next = words[i + len];
    // Without a marker the name must end the title or be followed by a dash / number.
    const ends = marker || !next || slice[len - 1].sepAfter || COUNTERS.has(next.w) || !!parseNumeral(next.w, true);
    const place = ends ? placeOf(slice.map(x => x.w), i > 0 && words[i - 1].w === 'ספר') : null;
    if (place !== null) return [place, len];
  }
  return null;
}

/** The comparable parts of a title or location, in order. */
export function orderKey(text: string): Part[] {
  const words = wordsOf(text);
  const parts: Part[] = [];
  for (let i = 0; i < words.length; i++) {
    const { w } = words[i];
    const counter = i > 0 && COUNTERS.has(words[i - 1].w);
    // A name before a number: "נח" alone is the parasha, not 58.
    const name = counter ? null : nameAt(words, i);
    if (name) {
      // "פרשת בא" / "מסכת שבת" / "בא": the marker word adds nothing to the order.
      if (i > 0 && MARKERS.has(words[i - 1].w)) parts.pop();
      parts.push({ place: name[0] }); i += name[1] - 1; continue;
    }
    const n = NOT_COUNTED.has(w) ? null : parseNumeral(w, counter || words.length === 1);
    if (n) { parts.push({ num: n.value, counted: counter || n.marked || words.length === 1 }); continue; }
    parts.push({ text: w.replace(/["״׳']/g, '') });
  }
  return parts;
}

const collator = new Intl.Collator('he', { numeric: true, sensitivity: 'base' });
const rank = (p: Part) => ('num' in p ? 0 : 'place' in p ? 1 : 2);

/** Compares two keys part by part: number < known name < word; a prefix before its extensions. */
export function compareKeys(a: Part[], b: Part[]): number {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    const x = a[i], y = b[i];
    const r = rank(x) - rank(y);
    if (r) return r;
    const c = 'num' in x && 'num' in y ? x.num - y.num
      : 'place' in x && 'place' in y ? x.place - y.place
      : 'text' in x && 'text' in y ? collator.compare(x.text, y.text) : 0;
    if (c) return c;
  }
  return a.length - b.length;
}

const counted = (k: Part[]) => k.filter(p => 'num' in p && p.counted);
const partId = (p: Part) => ('num' in p ? `${p.num}` : 'place' in p ? `#${p.place}` : p.text);

/** What precedes the first counted number, minus its counter word ("פרשת בא – מצוה" → "פרשת בא"). */
function sectionOf(k: Part[]): string {
  const i = k.findIndex(p => 'num' in p && p.counted);
  const before = k.slice(0, i);
  const last = before[before.length - 1];
  if (last && 'text' in last && COUNTERS.has(last.text)) before.pop();
  return before.map(partId).join(' ');
}

/**
 * True when most summaries carry a number and the book counts on one running
 * sequence whatever precedes it — "פרשת בראשית – מצוה א", "פרשת נח – מצוה ב"
 * (ספר החינוך). False when the count restarts per section ("שבת – סימן ה" and
 * "ברכות – סימן ה"); a summary with no section ("מצוה א") fits either.
 */
export function isRunningCount(keys: Part[][]): boolean {
  const filled = keys.filter(k => k.length);
  const numbered = filled.filter(k => counted(k).length);
  if (!numbered.length || numbered.length * 2 < filled.length) return false;
  const sections = new Map<number, Set<string>>();
  for (const k of numbered) {
    const first = counted(k)[0];
    if (!('num' in first)) continue;
    const s = sectionOf(k);
    if (!s) continue;
    sections.set(first.num, (sections.get(first.num) ?? new Set()).add(s));
  }
  const clashes = Array.from(sections.values()).filter(s => s.size > 1).length;
  return clashes <= Math.floor(sections.size / 10);
}

/** Sort by the date written or by the book's own order; each can run either way. */
export type SikumSortKey = 'date' | 'order';
export const SIKUM_SORT_KEYS: SikumSortKey[] = ['date', 'order'];

interface Sortable { title: string | null; location: string | null; date: string }

const time = (e: Sortable) => Date.parse(e.date) || 0;
const field = (e: Sortable, f: 'title' | 'location') => e[f]?.trim() ?? '';
const intro = (k: Part[]) => !!k.length && 'text' in k[0] && INTRO_WORDS.has(k[0].text);
/** 0 = introduction (in either field), 1 = everything else, 2 = no value to sort by. */
const tier = (k: Part[], k2: Part[]) => (intro(k) || (!k.length && intro(k2)) ? 0 : !k.length ? 2 : 1);
const ordered = (k: Part[]) => k.some(p => ('num' in p && p.counted) || 'place' in p);

/**
 * Entries in the chosen order. "date" = newest first; reversed = oldest first.
 * "order" reads the field that carries the book's order — the title
 * ("סימן י״א") or the location ("פרק ג"), whichever more summaries number or
 * name — and breaks ties with the other one. An introduction goes first.
 * Reversed = the exact mirror (end of the book first, the introduction last),
 * except that summaries with nothing to sort by stay at the bottom both ways.
 */
export function sortEntries<T extends Sortable>(entries: T[], by: SikumSortKey, reverse = false): T[] {
  if (by === 'date') {
    const dir = reverse ? 1 : -1;
    return [...entries].sort((a, b) => dir * (time(a) - time(b)));
  }
  const titles = entries.map(e => orderKey(field(e, 'title')));
  const places = entries.map(e => orderKey(field(e, 'location')));
  const byTitle = titles.filter(ordered).length >= places.filter(ordered).length;
  const keyed = entries.map((e, i) => {
    const k = byTitle ? titles[i] : places[i];
    const k2 = byTitle ? places[i] : titles[i];
    return { e, k, n: counted(k), k2, t: tier(k, k2) };
  });
  const running = isRunningCount(keyed.map(x => x.k));
  const sorted = keyed.sort((a, b) =>
    a.t - b.t
    || (running ? (b.n.length ? 1 : 0) - (a.n.length ? 1 : 0) || compareKeys(a.n, b.n) : 0)
    || compareKeys(a.k, b.k)
    || compareKeys(a.k2, b.k2)
    || time(a.e) - time(b.e),
  );
  const out = reverse
    ? [...sorted.filter(x => x.t < 2).reverse(), ...sorted.filter(x => x.t === 2)]
    : sorted;
  return out.map(x => x.e);
}
