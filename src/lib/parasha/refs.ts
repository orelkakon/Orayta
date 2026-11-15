import { dayToLetters } from '@/lib/hebrewDate';

/**
 * The weekly parasha from Sefaria's calendar (pure, tested): Torah refs in
 * Hebrew and the aliyot named the way they're called up.
 */
export const TORAH_BOOKS: Record<string, string> = {
  Genesis: 'בראשית', Exodus: 'שמות', Leviticus: 'ויקרא', Numbers: 'במדבר', Deuteronomy: 'דברים',
};

const ALIYA_NAMES = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי'];

/** "Genesis 29:18-30:13" → "בראשית כ״ט:י״ח – ל׳:י״ג"; null for anything else. */
export function heTorahRef(ref: string): string | null {
  const m = /^([A-Za-z]+) (\d+):(\d+)(?:-(?:(\d+):)?(\d+))?$/.exec(ref.trim());
  if (!m || !TORAH_BOOKS[m[1]]) return null;
  const [, book, c1, v1, c2, v2] = m;
  const from = `${dayToLetters(+c1)}:${dayToLetters(+v1)}`;
  if (!v2) return `${TORAH_BOOKS[book]} ${from}`;
  const to = c2 && c2 !== c1 ? `${dayToLetters(+c2)}:${dayToLetters(+v2)}` : dayToLetters(+v2);
  return `${TORAH_BOOKS[book]} ${from} – ${to}`;
}

/** The book a Torah ref is in, in Hebrew. */
export function heTorahBook(ref: string): string | null {
  return TORAH_BOOKS[ref.split(' ')[0]] ?? null;
}

/**
 * Names for the calendar's aliyot: seven, then the last listed is the maftir
 * (Sefaria lists 7 + maftir). Any other count is just numbered.
 */
export function aliyaLabels(count: number): string[] {
  if (count === ALIYA_NAMES.length + 1) return [...ALIYA_NAMES, 'מפטיר'];
  return Array.from({ length: count }, (_, i) => ALIYA_NAMES[i] ?? `${i + 1}`);
}

/** Which part of the week a reader asks for: an aliya index, the haftara, or the whole parasha. */
export type ParashaPart = number | 'h' | 'all';

export function parsePart(v: string | null | undefined, aliyot: number): ParashaPart | null {
  if (v === 'h' || v === 'all') return v;
  if (v && /^\d$/.test(v) && +v < aliyot) return +v;
  return null;
}
