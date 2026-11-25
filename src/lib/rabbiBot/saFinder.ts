import { excerpt } from './match';
import { localSaText, saIndex } from './saCorpus';
import { SaIndex, seifBody } from './saIndex';
import { QueryWord, SaHit, searchSa, searchSeifim } from './saSearch';
import { contentWords, saQuery } from './saQuery';
import TITLES from './data/sa-toc.json';

// Server-only: the Shulchan Arukh search (saSearch.ts over saCorpus.ts) as
// the planner and the retrieval use it.

/** Seifim shown to the planner, and how much of each. */
const CANDIDATES = 8;
const SNIPPET_CHARS = 110;

const titleOf = (siman: string) => {
  const m = siman.match(/^Shulchan Arukh, (.+) (\d+)$/);
  return m ? (TITLES as Record<string, string[]>)[m[1]]?.[Number(m[2]) - 1] ?? '' : '';
};

/**
 * "Shulchan Arukh, Orach Chayim 204:7 — דיני הברכות ליתר מאכלים — «השותה מים
 * לצמאו מברך שהכל…»": the seif a hit found best, its siman's title and the
 * seif's own words around the question's, so the planner names a real seif
 * instead of recalling a number. Pure given the text lookup.
 */
export function candidateLine(hit: SaHit, text: (ref: string) => string, words: string[]): string {
  const ref = hit.seifim[0] ?? hit.siman;
  const seif = Number(ref.match(/:(\d+)$/)?.[1] ?? 0);
  const body = seifBody(text(ref), seif).replace(/[⟦⟧]/g, '');
  const snippet = body ? ` — «${excerpt(body, words, SNIPPET_CHARS)}»` : '';
  const title = titleOf(hit.siman);
  return `${ref}${title ? ` — ${title}` : ''}${snippet}`;
}

/** The planner's list for a question (and, for a follow-up, the earlier turn): '' when nothing matched or no index. */
export async function planCandidates(basis: string): Promise<string> {
  const index = await saIndex();
  if (!index) return '';
  const query = saQuery(basis);
  const words = query.map(q => q.word);
  const text = (ref: string) => localSaText(ref)?.segments[0]?.text ?? '';
  return searchSa(index, query, CANDIDATES).map(h => candidateLine(h, text, words)).join('\n');
}

/** The simanim a question is about once planned (the question's words + the plan's), best first. */
export function findSimanim(index: SaIndex, question: string, planWords: string[], limit: number): SaHit[] {
  return searchSa(index, saQuery(question, planWords), limit);
}

/** Phrase hits considered before the question's context re-ranks them. */
const PHRASE_POOL = 40;
const RRF_K = 2;

/**
 * Seifim holding every content word of a phrase ("השותה מים לצמאו"), best
 * first — the local stand-in for a Sefaria search inside the Shulchan Arukh,
 * spelling-, prefix- and inflection-tolerant (stem.ts). `context` = the
 * simanim the whole question is about (findSimanim), best first: a phrase
 * found in many places ("הכותב שתי אותיות" — Shabbat, a Sefer Torah, a get)
 * keeps the places the question is about first (reciprocal-rank fusion).
 */
export function phraseSeifim(index: SaIndex, phrase: string, limit: number, context: string[] = []): string[] {
  const query: QueryWord[] = contentWords(phrase).map(word => ({ word, weight: 1 }));
  if (!query.length) return [];
  const hits = searchSeifim(index, query, PHRASE_POOL, 1).map(h => h.ref);
  const at = new Map(context.map((siman, i) => [siman, i]));
  const fused = (ref: string, i: number) => 1 / (RRF_K + i) + 1 / (RRF_K + (at.get(ref.replace(/:\d+$/, '')) ?? PHRASE_POOL));
  return hits.map((ref, i) => ({ ref, f: fused(ref, i) })).sort((a, b) => b.f - a.f).slice(0, limit).map(x => x.ref);
}
