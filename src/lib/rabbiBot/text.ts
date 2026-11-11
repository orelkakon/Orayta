/**
 * Pure Hebrew text helpers for רבי־בוט: HTML → plain text, comparison
 * normalization, and locating a model-supplied quote inside a source.
 * No I/O — unit-tested in tests/rabbiBot.test.ts.
 */
import { expandAbbrev, isAbbrev } from './abbrev';

const ENTITIES: Record<string, string> = { nbsp: ' ', quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", thinsp: ' ' };

/** Sefaria/Wikisource HTML → plain text (footnotes and commentator markers dropped). */
export function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    // A footnote stays (Peninei Halakhah gives the poskim's views there), fenced
    // by gaps so no quote runs from the text into it.
    .replace(/<i[^>]*class="footnote"[^>]*>([\s\S]*?)<\/i>/gi, ' … $1 … ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, (m, e: string) => {
      if (e.startsWith('#')) return String.fromCharCode(Number(e.slice(1)));
      return ENTITIES[e.toLowerCase()] ?? m;
    })
    .replace(/\s+/g, ' ')
    .trim();
}

/** One word in comparison form: no nikud/teamim, no punctuation, final letters kept. */
export function normWord(w: string): string {
  return w
    .replace(/[֑-ׇ]/g, '')
    .replace(/[^א-תa-zA-Z0-9]/g, '');
}

/** "…" marks a cut in a passage (an excerpt's edge, a removed Rema gloss): a quote never runs across it. */
const GAP = '…';

/** Split into words, keeping each original word (and where it sits) next to its normalized form. */
export function tokenize(text: string): { raw: string; norm: string; start: number; end: number }[] {
  const out: { raw: string; norm: string; start: number; end: number }[] = [];
  for (const m of Array.from(text.matchAll(/[^\s\u05BE\-–—/]+/g))) {
    const norm = m[0] === GAP ? GAP : normWord(m[0]);
    if (norm) out.push({ raw: m[0], norm, start: m.index ?? 0, end: (m.index ?? 0) + m[0].length });
  }
  return out;
}

export const MIN_QUOTE_WORDS = 3;

/**
 * Finds `quote` in `source`, tolerant of nikud, punctuation and a stray word.
 * Returns the matching span *exactly as it appears in the source* — so whatever the
 * UI shows is verbatim source text — or null when the quote isn't there.
 * A match is the longest run of consecutive quote words found consecutively
 * in the source, and it must cover ≥ 80% of the quote (and ≥ 3 words).
 */
export function findQuote(source: string, quote: string): string | null {
  const src = tokenize(source);
  const q = tokenize(quote).map(t => t.norm);
  if (q.length < MIN_QUOTE_WORDS || src.length === 0) return null;
  const need = Math.max(MIN_QUOTE_WORDS, Math.ceil(q.length * 0.8));

  let best = { len: 0, at: -1 };
  for (let i = 0; i < src.length; i++) {
    for (let j = 0; j < q.length; j++) {
      let k = 0;
      while (i + k < src.length && j + k < q.length && src[i + k].norm !== GAP && src[i + k].norm === q[j + k]) k++;
      if (k > best.len) best = { len: k, at: i };
    }
  }
  if (best.len < need) return null;
  return source.slice(src[best.at].start, src[best.at + best.len - 1].end);
}

/** Normalized question text — the cache key for repeated questions. */
export function questionKey(q: string): string {
  return tokenize(q).map(t => t.norm).join(' ');
}

/**
 * Words worth matching on (≥ 3 letters): not the commonest function words, nor
 * the everyday filler of a spoken question ("במידה ואני…", "רציתי לשאול").
 */
const STOP = new Set([
  'את', 'של', 'על', 'עם', 'אם', 'או', 'גם', 'כל', 'לא', 'מה', 'זה', 'זו', 'הוא', 'היא', 'אני', 'אפשר', 'מותר', 'צריך', 'האם', 'איך', 'למה', 'כאשר', 'אחרי', 'לפני',
  'במידה', 'ואני', 'שאני', 'אנחנו', 'אתה', 'רציתי', 'לשאול', 'לדעת', 'בבקשה', 'יכול', 'צריכים', 'עושים', 'ללכת', 'שאינו', 'אינו', 'שהוא', 'שהיא', 'היה',
]);

const isKeyword = (w: string) => w.length >= 3 && !STOP.has(w);

/** The words worth matching on; an abbreviation ("ר״ח") counts as the words it stands for. */
export function keywords(text: string): string[] {
  const words = tokenize(text).flatMap(t => (isAbbrev(t.raw) ? [t.norm, ...expandAbbrev(t.norm)] : [t.norm]));
  return Array.from(new Set(words.filter(isKeyword)));
}

/**
 * Shorter phrasings to retry when a planned search phrase finds nothing
 * (Sefaria's search needs every word): the phrase's content words in
 * overlapping pairs, as written. A phrase of two content words has nothing shorter.
 */
export function fallbackPhrases(phrase: string, max = 2): string[] {
  // Two-letter words count here (נר, חג, גט) — only the function words go.
  const words = tokenize(phrase).filter(t => t.norm.length >= 2 && !STOP.has(t.norm)).map(t => t.raw.replace(/[^\u05D0-\u05EA\u0591-\u05C7"'״׳]/g, ''));
  if (words.length < 3) return [];
  const pairs = words.slice(0, -1).map((w, i) => `${w} ${words[i + 1]}`);
  return Array.from(new Set(pairs)).slice(0, max);
}

/** A Shulchan Arukh siman's own title, as its first seif opens ("זמן הדלקת נר חנוכה. ובו ב סעיפים: …"); '' when absent. */
export function simanTitle(seif: string): string {
  return seif.match(/^(.{3,80}?)\.? ובו [א-ת"״׳']{1,4} סעיפים:/)?.[1] ?? '';
}

// ── The Rema inside a Shulchan Arukh seif ────────────────────────────────
// Sefaria's Shulchan Arukh interleaves the Rema's glosses (הגה) with Maran's
// words, wrapping each gloss in <small>. markRema keeps those bounds through
// stripHtml; splitRema then separates the two, so no model reads a gloss as Maran.

const REMA_OPEN = '⟦';
const REMA_CLOSE = '⟧';

/** Seif HTML with each Rema gloss (<small>…</small>) bracketed by markers that survive stripHtml. */
export function markRema(html: string): string {
  return html.replace(/<small\b[^>]*>/gi, ` ${REMA_OPEN}`).replace(/<\/small>/gi, `${REMA_CLOSE} `);
}

const tidy = (s: string) => s.replace(/\s+/g, ' ').replace(/(…\s*){2,}/g, '… ').replace(/^[\s…]+|[\s…]+$/g, '').trim();

/**
 * Maran's words (each gloss replaced by "…", so no quote spans the gap) and the
 * Rema's glosses joined by "…". Text without markers is all Maran. Pure.
 */
export function splitRema(text: string): { main: string; rema: string } {
  if (!text.includes(REMA_OPEN)) return { main: text, rema: '' };
  const glosses: string[] = [];
  const main = text.replace(new RegExp(`${REMA_OPEN}([^${REMA_CLOSE}]*)${REMA_CLOSE}?`, 'g'), (_m, inner: string) => {
    glosses.push(tidy(inner));
    return ' … ';
  });
  return { main: tidy(main), rema: glosses.filter(Boolean).join(' … ') };
}
