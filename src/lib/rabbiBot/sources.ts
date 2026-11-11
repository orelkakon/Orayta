import type { RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, fetchLinks, searchRefs, sefariaUrl, SefariaText } from './sefaria';
import { searchTitles, fetchPage } from './wikisource';
import { HE } from '@/lib/hebrewTexts';
import { fallbackPhrases, keywords, overlap, splitRema } from './text';

// Server-only: the individual source lookups retrieve() combines.

export interface Candidate { ref: string; heRef: string; book: string; text: string; url: string; origin: RabbiBotPassage['origin'] }

export const fromSefaria = (t: SefariaText): Candidate[] =>
  t.segments.map(s => ({ ref: s.ref, heRef: s.heRef, book: t.book, text: s.text, url: sefariaUrl(s.ref), origin: 'sefaria' }));

export const best = <T extends { text: string }>(cands: T[], words: string[], n: number) =>
  [...cands].sort((a, b) => overlap(b.text, words) - overlap(a.text, words)).slice(0, n);

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

/** Seifim before / after a term hit fetched with it: the term often sits in the siman's opening seif, the case asked about in the next one. */
const NEIGHBOURS = { before: 1, after: 3 };

/**
 * Seif hits → one range per siman, from the first hit's previous seif to three
 * past the last ("…672:1", "…672:2" → "…672:1-5"; Sefaria clamps it to the
 * siman). Other refs pass through. Order of first appearance. Pure.
 */
export function seifWindows(refs: string[]): string[] {
  const simanim = new Map<string, number[]>();
  refs.forEach(r => {
    const m = r.match(/^(.* \d+):(\d+)$/);
    const key = m ? m[1] : r;
    simanim.set(key, [...(simanim.get(key) ?? []), ...(m ? [Number(m[2])] : [])]);
  });
  return Array.from(simanim, ([siman, ns]) => (ns.length === 0 ? siman
    : `${siman}:${Math.max(1, Math.min(...ns) - NEIGHBOURS.before)}-${Math.max(...ns) + NEIGHBOURS.after}`));
}

/** Shulchan Arukh seifim (with their neighbours) that use the sources' own term for the subject. */
export async function searchTerms(terms: string[]): Promise<SefariaText[]> {
  const refs = seifWindows((await Promise.all(terms.slice(0, 4).map(t => searchRefs(t, SA_PATHS, 4)))).flat());
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
