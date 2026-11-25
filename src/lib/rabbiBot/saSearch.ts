import { conceptsOf, queryKeys } from './stem';
import { Field, SaIndex, simanKey } from './saIndex';

/**
 * Full-text search over the whole Shulchan Arukh (index: saIndex.ts), so a
 * question finds its siman by what the seifim say, not by a title or a
 * model's memory of a number: "מה מברכים על מים" finds OC 204:7 ("השותה מים
 * לצמאו מברך שהכל") though no title mentions water with a blessing. BM25 over
 * seifim (rare words weigh most, long seifim are tempered), each query word
 * scored by its best key (stem.ts), plus the siman's title and hilchot as
 * fields of their own; a siman is scored by its best seifim. Pure — measured
 * by tests/saFinder.test.ts against questions as people ask them.
 */

export interface QueryWord { word: string; weight: number }

export interface SaHit {
  /** "Shulchan Arukh, Orach Chayim 204" */
  siman: string;
  /** Its best seifim ("…204:7"), best first. */
  seifim: string[];
  score: number;
}

/**
 * The ranking's few knobs, set on the benchmark (tests/saFinder.test.ts):
 * BM25's k1 and length tempering b; how much the siman's title and its
 * hilchot count next to its best seif; how much the second-best seif adds (a
 * siman about the subject has several).
 */
export const SA_TUNING = { k1: 1.2, b: 0.5, title: 0.5, section: 0.6, second: 0.5 };
export type SaTuning = typeof SA_TUNING;

const idf = (n: number, df: number) => Math.log(1 + (n - df + 0.5) / (df + 0.5));

/**
 * Sums per-word scores, each concept once: words sharing a stem ("מברכים",
 * "ברכת") are one subject, so a document gets the best of them, not their sum.
 */
function byConcept<K>(query: QueryWord[], score: (q: QueryWord) => Map<K, number>): Map<K, number> {
  // Words join a concept when any of their stems meet ("מברכים" and "ברכת" share "ברכ").
  const concepts: { stems: Set<string>; best: Map<K, number> }[] = [];
  query.forEach(q => {
    const stems = conceptsOf(q.word);
    let c = concepts.find(x => stems.some(s => x.stems.has(s)));
    if (!c) concepts.push(c = { stems: new Set<string>(), best: new Map<K, number>() });
    stems.forEach(s => c!.stems.add(s));
    score(q).forEach((s, k) => { if (s > (c!.best.get(k) ?? 0)) c!.best.set(k, s); });
  });
  const total = new Map<K, number>();
  concepts.forEach(c => c.best.forEach((s, k) => total.set(k, (total.get(k) ?? 0) + s)));
  return total;
}

/** Each document's score: over the query's concepts, the best key match of their words. */
function seifScores(index: SaIndex, query: QueryWord[], { k1, b }: SaTuning = SA_TUNING): Map<number, number> {
  const n = index.docs.length;
  return byConcept(query, ({ word, weight }) => {
    const best = new Map<number, number>();
    for (const { key, weight: kw } of queryKeys(word)) {
      const entry = index.vocab.get(key);
      if (!entry) continue;
      const w = weight * kw * idf(n, entry.df);
      for (const form of entry.words) {
        const list = index.postings.get(form)!;
        for (let i = 0; i < list.length; i += 2) {
          const doc = list[i];
          const tf = list[i + 1];
          const s = w * tf * (k1 + 1) / (tf + k1 * (1 - b + b * index.docs[doc].len / index.avgLen));
          if (s > (best.get(doc) ?? 0)) best.set(doc, s);
        }
      }
    }
    return best;
  });
}

/** A short field's score per id: each query word's best key, weighted by rarity among the field's entries. */
function fieldScores(f: Field, query: QueryWord[]): Map<string, number> {
  return byConcept(query, ({ word, weight }) => {
    const best = new Map<string, number>();
    for (const { key, weight: kw } of queryKeys(word)) {
      const ids = f.keys.get(key);
      if (!ids) continue;
      const w = weight * kw * idf(f.count, ids.size);
      ids.forEach(id => { if (w > (best.get(id) ?? 0)) best.set(id, w); });
    }
    return best;
  });
}

/** The simanim a query is about, best first, each with its best seifim. */
export function searchSa(index: SaIndex, query: QueryWord[], limit: number, t: SaTuning = SA_TUNING): SaHit[] {
  if (query.length === 0) return [];
  const bySiman = new Map<string, { seif: number; s: number }[]>();
  seifScores(index, query, t).forEach((s, doc) => {
    const d = index.docs[doc];
    const key = simanKey(d.part, d.siman);
    const list = bySiman.get(key);
    if (list) list.push({ seif: d.seif, s }); else bySiman.set(key, [{ seif: d.seif, s }]);
  });
  const titles = fieldScores(index.titles, query);
  titles.forEach((_, key) => { if (!bySiman.has(key)) bySiman.set(key, []); });
  const sections = fieldScores(index.sections, query);
  const section = (siman: string) => Math.max(0, ...(index.sectionOf.get(siman) ?? []).map(id => sections.get(id) ?? 0));
  const hits = Array.from(bySiman, ([siman, list]) => {
    const top = list.sort((a, b) => b.s - a.s).slice(0, 2);
    const seif = (top[0]?.s ?? 0) + t.second * (top[1]?.s ?? 0);
    const score = seif + t.title * (titles.get(siman) ?? 0) + t.section * section(siman);
    return { siman, seifim: top.map(x => `${siman}:${x.seif}`), score };
  });
  return hits.sort((a, b) => b.score - a.score).slice(0, limit);
}

/**
 * Seifim alone, best first, holding at least `minCover` of the query's weight
 * — for a phrase that should sit in one seif ("השותה מים לצמאו").
 */
export function searchSeifim(index: SaIndex, query: QueryWord[], limit: number, minCover = 0): { ref: string; score: number }[] {
  const total = query.reduce((s, q) => s + q.weight, 0) || 1;
  const ranked = Array.from(seifScores(index, query)).sort((a, b) => b[1] - a[1]);
  const out: { ref: string; score: number }[] = [];
  // Coverage is checked best-first, and only as far as needed.
  for (const [doc, score] of ranked.slice(0, 400)) {
    if (out.length >= limit) break;
    if (covers(index, doc, query) / total < minCover - 1e-9) continue;
    const d = index.docs[doc];
    out.push({ ref: `${simanKey(d.part, d.siman)}:${d.seif}`, score });
  }
  return out;
}

/** The query weight a document holds (any key of the word). */
function covers(index: SaIndex, doc: number, query: QueryWord[]): number {
  return query.reduce((sum, { word, weight }) => (queryKeys(word).some(({ key }) =>
    (index.vocab.get(key)?.words ?? []).some(w => holds(index.postings.get(w), doc))) ? sum + weight : sum), 0);
}

function holds(list: number[] | undefined, doc: number): boolean {
  if (!list) return false;
  let lo = 0;
  let hi = list.length / 2 - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const d = list[mid * 2];
    if (d === doc) return true;
    if (d < doc) lo = mid + 1; else hi = mid - 1;
  }
  return false;
}
