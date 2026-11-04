import type { RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, fetchLinks, searchRefs, sefariaUrl, SefariaText } from './sefaria';
import { searchTitles, fetchPage } from './wikisource';
import { fallbackPhrases, overlap } from './text';

// Server-only: the individual source lookups retrieve() combines.

export interface Candidate { ref: string; heRef: string; book: string; text: string; url: string; origin: RabbiBotPassage['origin'] }

export const fromSefaria = (t: SefariaText): Candidate[] =>
  t.segments.map(s => ({ ref: s.ref, heRef: s.heRef, book: t.book, text: s.text, url: sefariaUrl(s.ref), origin: 'sefaria' }));

export const best = <T extends { text: string }>(cands: T[], words: string[], n: number) =>
  [...cands].sort((a, b) => overlap(b.text, words) - overlap(a.text, words)).slice(0, n);

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

/** The four parts of the Shulchan Arukh itself (not its commentaries), for searching by term. */
const SA_PATHS = ['Orach Chayim', "Yoreh De'ah", 'Even HaEzer', 'Choshen Mishpat']
  .map(part => `Halakhah/Shulchan Arukh/Shulchan Arukh, ${part}`);

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

export async function linkedCommentaries(ref: string, words: string[]): Promise<Candidate[]> {
  const links = await fetchLinks(ref);
  const picked = await Promise.all(LINKED_BOOKS.map(async def => {
    const refs = links.filter(l => def.match(l.book, l.category)).map(l => l.ref);
    if (refs.length === 0) return [];
    const texts = await Promise.all(rangeRefs(refs).map(fetchText));
    return best(texts.flatMap(t => (t ? fromSefaria(t) : [])), words, def.keep);
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

/** Shulchan Arukh seifim that use the sources' own term for the subject. */
export async function searchTerms(terms: string[]): Promise<SefariaText[]> {
  const refs = Array.from(new Set((await Promise.all(terms.slice(0, 3).map(t => searchRefs(t, SA_PATHS, 4)))).flat()));
  const texts = await Promise.all(refs.slice(0, 4).map(fetchText));
  return texts.filter((t): t is SefariaText => t !== null);
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
