/**
 * Pure Hebrew text helpers for רבי־בוט: HTML → plain text, comparison
 * normalization, and locating a model-supplied quote inside a source.
 * No I/O — unit-tested in tests/rabbiBot.test.ts.
 */

const ENTITIES: Record<string, string> = { nbsp: ' ', quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", thinsp: ' ' };

/** Sefaria/Wikisource HTML → plain text (footnotes and commentator markers dropped). */
export function stripHtml(html: string): string {
  return html
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<i[^>]*class="footnote"[^>]*>[\s\S]*?<\/i>/gi, '')
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

/** Split into words, keeping each original word (and where it sits) next to its normalized form. */
export function tokenize(text: string): { raw: string; norm: string; start: number; end: number }[] {
  const out: { raw: string; norm: string; start: number; end: number }[] = [];
  for (const m of Array.from(text.matchAll(/[^\s\u05BE\-–—/]+/g))) {
    const norm = normWord(m[0]);
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
      while (i + k < src.length && j + k < q.length && src[i + k].norm === q[j + k]) k++;
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

/** Words worth matching on (≥ 3 letters, not the commonest function words). */
const STOP = new Set(['את', 'של', 'על', 'עם', 'אם', 'או', 'גם', 'כל', 'לא', 'מה', 'זה', 'זו', 'הוא', 'היא', 'אני', 'אפשר', 'מותר', 'צריך', 'האם', 'איך', 'למה', 'כאשר', 'אחרי', 'לפני']);

export function keywords(text: string): string[] {
  return Array.from(new Set(tokenize(text).map(t => t.norm).filter(w => w.length >= 3 && !STOP.has(w))));
}

/** How many of `words` occur in `text` (prefix-tolerant: ב/ה/ו/ל/מ/ש/כ prefixes). */
export function overlap(text: string, words: string[]): number {
  const toks = new Set(tokenize(text).map(t => t.norm));
  return words.filter(w => toks.has(w) || Array.from(toks).some(t => t.length === w.length + 1 && t.endsWith(w))).length;
}

/** Trim a long passage to a window around its best keyword hit. */
export function excerpt(text: string, words: string[], max: number): string {
  if (text.length <= max) return text;
  const toks = tokenize(text);
  let bestAt = 0;
  let bestScore = -1;
  const span = Math.max(20, Math.floor(max / 6));
  for (let i = 0; i < toks.length; i += 5) {
    const window = toks.slice(i, i + span).map(t => t.raw).join(' ');
    const s = overlap(window, words);
    if (s > bestScore) { bestScore = s; bestAt = i; }
  }
  const start = Math.max(0, bestAt - 10);
  let out = '';
  let end = start;
  for (; end < toks.length && out.length + toks[end].raw.length < max; end++) out += (out ? ' ' : '') + toks[end].raw;
  return `${start > 0 ? '… ' : ''}${out}${end < toks.length ? ' …' : ''}`;
}
