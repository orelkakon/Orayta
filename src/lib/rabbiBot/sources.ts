import type { RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, fetchLinks, searchRefs, sefariaUrl, SefariaText } from './sefaria';
import { searchTitles, fetchPage } from './wikisource';
import { HE } from '@/lib/hebrewTexts';
import { fallbackPhrases, keywords, overlap, splitRema } from './text';
import type { Score } from './rank';

// Server-only: the individual source lookups retrieve() combines.

export interface Candidate { ref: string; heRef: string; book: string; text: string; url: string; origin: RabbiBotPassage['origin'] }

export const fromSefaria = (t: SefariaText): Candidate[] =>
  t.segments.map(s => ({ ref: s.ref, heRef: s.heRef, book: t.book, text: s.text, url: sefariaUrl(s.ref), origin: 'sefaria' }));

/** The `n` candidates that score best — by a ranking (rank.ts) or by plain shared-word count. */
export function best<T extends { text: string }>(cands: T[], by: string[] | Score, n: number): T[] {
  const score = typeof by === 'function' ? by : (t: string) => overlap(t, by);
  return cands.map(c => ({ c, s: score(c.text) })).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.c);
}

/** A gloss shorter than this many content words is just a source note ("(טור בשם סה״מ)"). */
const MIN_REMA_WORDS = 3;

/**
 * A Shulchan Arukh seif becomes two passages: Maran's words under the seif's
 * own heading, and the Rema's glosses under "הגהת הרמ״א" — so the answer can
 * never present a gloss as Maran's ruling. Other candidates pass through.
 */
export function splitRemaCandidate(c: Candidate): Candidate[] {
  const { main, rema } = splitRema(c.text);
  if (!rema) return [{ ...c, text: main }];
  const out: Candidate[] = keywords(main).length > 0 ? [{ ...c, text: main }] : [];
  if (keywords(rema).length >= MIN_REMA_WORDS) {
    out.push({ ...c, ref: `${c.ref}|rema`, heRef: HE.RB_REMA_REF(c.heRef), book: HE.RB_REMA_BOOK, text: rema });
  }
  return out;
}

/**
 * Commentaries pulled in through Sefaria's links when the plan names a seif of
 * the Shulchan Arukh — Sephardi poskim first, then the Ashkenazi view, then
 * the Rambam / Gemara behind the ruling. Value = how many segments to keep.
 */
const LINKED_BOOKS: { match: (book: string, category: string) => boolean; keep: number }[] = [
  { match: b => b.startsWith('Kaf HaChayim'), keep: 2 },
  { match: b => b === 'Ben Ish Hai', keep: 1 },
  { match: b => b === 'Mishnah Berurah', keep: 2 },
  { match: b => b.startsWith('Siftei Kohen'), keep: 1 },
  { match: b => b.startsWith('Peninei Halakhah'), keep: 1 },
  { match: b => b.startsWith('Mishneh Torah'), keep: 1 },
  { match: (_b, c) => c === 'Talmud', keep: 1 },
];

/** Collapse linked refs of one book into as few range requests as possible. */
function rangeRefs(refs: string[]): string[] {
  const groups = new Map<string, number[]>();
  const singles: string[] = [];
  refs.forEach(r => {
    // "<book> 671:31" or "<book> 671:55:1" → group "<book> 671", item 31 / 55
    const m = r.match(/^(.*\d):(\d+)(?::\d+)?$/);
    if (!m) { singles.push(r); return; }
    groups.set(m[1], [...(groups.get(m[1]) ?? []), Number(m[2])]);
  });
  const ranged = Array.from(groups, ([base, ns]) => {
    const lo = Math.min(...ns);
    const hi = Math.min(Math.max(...ns), lo + 30);
    return lo === hi ? `${base}:${lo}` : `${base}:${lo}-${hi}`;
  });
  return [...ranged, ...singles].slice(0, 2);
}

export async function linkedCommentaries(ref: string, rank: Score): Promise<Candidate[]> {
  const links = await fetchLinks(ref);
  const picked = await Promise.all(LINKED_BOOKS.map(async def => {
    const refs = links.filter(l => def.match(l.book, l.category)).map(l => l.ref);
    if (refs.length === 0) return [];
    const texts = await Promise.all(rangeRefs(refs).map(fetchText));
    return best(texts.flatMap(t => (t ? fromSefaria(t) : [])), rank, def.keep);
  }));
  return picked.flat();
}

export async function wikisource(queries: string[], words: string[]): Promise<Candidate[]> {
  const titles = Array.from(new Set((await Promise.all(queries.map(q => searchTitles(q, 3)))).flat())).slice(0, 4);
  const pages = await Promise.all(titles.map(fetchPage));
  return pages.flatMap(p => {
    if (!p) return [];
    const para = best(p.paragraphs.map(text => ({ ref: p.title, heRef: p.title, book: p.title.split('/')[0], text, url: p.url, origin: 'wikisource' as const })), words, 1);
    return para.filter(c => overlap(c.text, words) >= 2);
  });
}

export interface PhraseHits {
  refs: string[];
  /** Found only by a shortened phrase — kept only when relevant enough (see retrieve). */
  loose: boolean;
}

/**
 * Full-text search for one planned phrase. Sefaria needs every word of it, so
 * a phrase that finds nothing is retried as shorter pairs of its content words.
 */
export async function searchPhrase(phrase: string, path: string, size: number): Promise<PhraseHits> {
  const refs = await searchRefs(phrase, path, size);
  if (refs.length > 0) return { refs, loose: false };
  const retries = await Promise.all(fallbackPhrases(phrase).map(p => searchRefs(p, path, Math.min(size, 3))));
  return { refs: retries.flat(), loose: true };
}
