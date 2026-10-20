import type { ContextMatch, TalmudSegment } from '@/types/talmudContext';

// Citations in the DB are paraphrased summaries in modern Hebrew, not exact
// quotes — so this only *guesses* where on the amud a citation sits. Each
// segment is scored by how much of the citation's distinctive vocabulary it
// shares (Aramaic + its Steinsaltz explanation, which is modern Hebrew), and
// a guess is returned only when it is clearly better than the rest.

/** Minimum share of the citation's (page-present, idf-weighted) vocabulary. */
export const MIN_SCORE = 0.34;
/** Minimum number of distinct citation words found in the winning segment. */
export const MIN_WORDS = 3;
/** The winner must beat the runner-up by this factor. */
export const MIN_LEAD = 1.25;
/** This many quoted word pairs are convincing on their own. */
export const MIN_PAIRS = 2;

const STOPWORDS = new Set([
  'של', 'את', 'על', 'אם', 'כי', 'לא', 'הוא', 'היא', 'הם', 'הן', 'זה', 'זו', 'זאת', 'אלא',
  'אמר', 'אומר', 'רבי', 'רב', 'מה', 'כל', 'גם', 'או', 'אבל', 'יש', 'אין', 'עם', 'אל', 'מן',
  'כמו', 'כך', 'לו', 'לה', 'להם', 'אותו', 'אותה', 'היה', 'היו', 'יהיה', 'אשר', 'שהוא', 'שהיא',
  'כלומר', 'דבר', 'דברים', 'אחד', 'אחת', 'עוד', 'רק', 'למה', 'מדוע', 'איך', 'כאשר', 'בין',
  'אדם', 'ולכן', 'לכן', 'מכיון', 'כיון', 'אמרו', 'שנאמר', 'דכתיב', 'איתמר', 'תניא', 'הכי',
  'האי', 'ההוא', 'מאי', 'איכא', 'ליה', 'להו', 'נמי', 'אית', 'הוה', 'הות', 'קא', 'לי', 'אנא',
]);

const PREFIX = new Set(['ו', 'ה', 'ב', 'כ', 'ל', 'מ', 'ש', 'ד']);
const FINALS: Record<string, string> = { 'ך': 'כ', 'ם': 'מ', 'ן': 'נ', 'ף': 'פ', 'ץ': 'צ' };

/** Plain consonantal Hebrew words: no HTML, nikud, cantillation, punctuation or final forms. */
export function normalizeHebrew(s: string): string {
  return s
    .replace(/<[^>]*>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[\u05BE\u05C0\u05C3\u05C6]/g, ' ') // maqaf, paseq, sof pasuq, nun hafukha
    .replace(/[\u0591-\u05C7]/g, '')             // remaining points and cantillation
    .replace(/[\u05F3\u05F4'"`]/g, '')           // geresh / gershayim inside acronyms
    .replace(/[ךםןףץ]/g, ch => FINALS[ch])
    .replace(/[^\u05D0-\u05EA]+/g, ' ')
    .trim();
}

/** Spelling-insensitive skeleton: no inner matres lectionis, no Aramaic/Hebrew suffix vowel. */
function skeleton(w: string): string {
  let s = w[0] + w.slice(1).replace(/[וי]/g, '');
  if (s.length >= 4 && /[אה]$/.test(s)) s = s.slice(0, -1);
  return s;
}

/** Comparable keys for one word: itself and up to two stripped prefix letters. */
export function wordKeys(w: string): string[] {
  const out = new Set<string>();
  let cur = w;
  for (let i = 0; i <= 2 && cur.length >= 3; i++) {
    const k = skeleton(cur);
    if (k.length >= 3) out.add(k);
    if (!PREFIX.has(cur[0])) break;
    cur = cur.slice(1);
  }
  return Array.from(out);
}

/** Each segment as an ordered list of per-word key sets (for phrase checks). */
function segmentWords(seg: TalmudSegment): Set<string>[] {
  return normalizeHebrew(`${seg.he} ${seg.ex}`).split(' ')
    .filter(w => w.length >= 3)
    .map(w => new Set(wordKeys(w)));
}

const matches = (keys: string[], set: Set<string>) => keys.some(k => set.has(k));

/** Does `b` follow `a` within the segment (one inserted gloss word allowed)? */
function hasPair(a: string[], b: string[], words: Set<string>[]): boolean {
  for (let i = 0; i < words.length; i++) {
    if (!matches(a, words[i])) continue;
    if ((words[i + 1] && matches(b, words[i + 1])) || (words[i + 2] && matches(b, words[i + 2]))) return true;
  }
  return false;
}

export interface SegmentScore {
  /** Share of the citation's page-present vocabulary, idf-weighted, in [0, 1]. */
  score: number;
  /** Distinct citation words found in the segment. */
  words: number;
  /** Adjacent citation word pairs found (near-)adjacent in the segment — a quote signal. */
  pairs: number;
}

/**
 * Per-segment scores. Words are weighted by inverse segment frequency, so
 * vocabulary shared by the whole amud (the topic itself) counts less than a
 * phrase only one segment has.
 */
export function scoreSegments(citation: string, segments: TalmudSegment[]): SegmentScore[] {
  const query = normalizeHebrew(citation).split(' ')
    .filter(w => w.length >= 3).map(w => ({ w, keys: wordKeys(w) })).filter(x => x.keys.length > 0);
  const distinct = Array.from(new Map(query.filter(x => !STOPWORDS.has(x.w)).map(x => [x.w, x.keys])).values());
  const segWords = segments.map(segmentWords);
  const segKeys = segWords.map(ws => new Set(ws.flatMap(set => Array.from(set))));
  const hits = distinct.map(keys => segKeys.map(set => keys.some(k => set.has(k))));
  const n = segments.length;
  const weights = hits.map(row => {
    const df = row.filter(Boolean).length;
    return df === 0 ? 0 : Math.log(1 + n / df);
  });
  const total = weights.reduce((a, b) => a + b, 0);
  return segments.map((_, si) => {
    let got = 0;
    let count = 0;
    hits.forEach((row, wi) => { if (row[si]) { got += weights[wi]; count++; } });
    let pairs = 0;
    for (let i = 0; i + 1 < query.length; i++) {
      if (STOPWORDS.has(query[i].w) && STOPWORDS.has(query[i + 1].w)) continue;
      if (hasPair(query[i].keys, query[i + 1].keys, segWords[si])) pairs++;
    }
    return { score: total > 0 ? got / total : 0, words: count, pairs };
  });
}

/** Ranking value: vocabulary share plus a bonus for quoted phrases. */
const rank = (s: SegmentScore) => s.score + 0.15 * s.pairs;

/** Clears the bar on its own: enough shared vocabulary, or a recognisable quote. */
function convincing(s: SegmentScore): boolean {
  if (s.pairs >= MIN_PAIRS) return true;
  if (s.pairs >= 1 && s.words >= 2 && s.score >= 0.9) return true; // short sayings
  return s.score >= MIN_SCORE && s.words >= MIN_WORDS;
}

/**
 * The segment the citation most likely paraphrases, or null when nothing is
 * convincing. Talmud often repeats a saying in two adjacent segments (mishna →
 * gemara, statement → restatement); a near-tie between at most two such
 * segments resolves to the earlier one, a wider tie means "no idea".
 */
export function findCitationSegment(citation: string, segments: TalmudSegment[]): ContextMatch | null {
  if (segments.length === 0) return null;
  const scored = scoreSegments(citation, segments).map((s, index) => ({ ...s, index, r: rank(s) }));
  const best = scored.reduce((a, b) => (b.r > a.r ? b : a));
  if (!convincing(best)) return null;
  const close = scored.filter(s => s.r * MIN_LEAD > best.r);
  if (close.length > 2 || !close.every(convincing)) return null;
  const pick = close.reduce((a, b) => (b.index < a.index ? b : a));
  return { index: pick.index, score: pick.score };
}
