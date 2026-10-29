import type { RabbiBotKind, RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, fetchLinks, searchRefs, sefariaUrl, SefariaText } from './sefaria';
import { searchTitles, fetchPage } from './wikisource';
import { searchSikumim } from './sikumim';
import { excerpt, keywords, overlap } from './text';

export interface RetrievalPlan {
  kind: RabbiBotKind;
  refs: string[];
  searches: string[];
  /** The subject's name as the classical sources call it (כחל, not עטין). */
  terms: string[];
  /** A saying the user wants located ("where is it written / who said"). */
  quote: string;
}

const MAX_PASSAGES = 16;
const PASSAGE_CHARS = 1100;

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

/** Where full-text search looks, by question kind. */
const SEARCH_PATHS: Record<RabbiBotKind, { path: string; size: number }[]> = {
  halacha: [{ path: 'Halakhah', size: 4 }],
  torah: [{ path: 'Tanakh', size: 3 }, { path: 'Mishnah', size: 2 }, { path: 'Talmud', size: 3 }, { path: 'Midrash', size: 2 }],
};

/** The four parts of the Shulchan Arukh itself (not its commentaries), for searching by term. */
const SA_PATHS = ['Orach Chayim', "Yoreh De'ah", 'Even HaEzer', 'Choshen Mishpat']
  .map(part => `Halakhah/Shulchan Arukh/Shulchan Arukh, ${part}`);
const MAX_ANCHORS = 2;

interface Candidate { ref: string; heRef: string; book: string; text: string; url: string; origin: RabbiBotPassage['origin'] }

const fromSefaria = (t: SefariaText): Candidate[] =>
  t.segments.map(s => ({ ref: s.ref, heRef: s.heRef, book: t.book, text: s.text, url: sefariaUrl(s.ref), origin: 'sefaria' }));

const best = (cands: Candidate[], words: string[], n: number) =>
  [...cands].sort((a, b) => overlap(b.text, words) - overlap(a.text, words)).slice(0, n);

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

async function linkedCommentaries(ref: string, words: string[]): Promise<Candidate[]> {
  const links = await fetchLinks(ref);
  const picked = await Promise.all(LINKED_BOOKS.map(async def => {
    const refs = links.filter(l => def.match(l.book, l.category)).map(l => l.ref);
    if (refs.length === 0) return [];
    const texts = await Promise.all(rangeRefs(refs).map(fetchText));
    return best(texts.flatMap(t => (t ? fromSefaria(t) : [])), words, def.keep);
  }));
  return picked.flat();
}

async function wikisource(queries: string[], words: string[]): Promise<Candidate[]> {
  const titles = Array.from(new Set((await Promise.all(queries.map(q => searchTitles(q, 3)))).flat())).slice(0, 4);
  const pages = await Promise.all(titles.map(fetchPage));
  return pages.flatMap(p => {
    if (!p) return [];
    const para = best(p.paragraphs.map(text => ({ ref: p.title, heRef: p.title, book: p.title.split('/')[0], text, url: p.url, origin: 'wikisource' as const })), words, 1);
    return para.filter(c => overlap(c.text, words) >= 2);
  });
}

/** Shulchan Arukh seifim that use the sources' own term for the subject. */
async function searchTerms(terms: string[]): Promise<SefariaText[]> {
  const refs = Array.from(new Set((await Promise.all(terms.slice(0, 3).map(t => searchRefs(t, SA_PATHS, 4)))).flat()));
  const texts = await Promise.all(refs.slice(0, 4).map(fetchText));
  return texts.filter((t): t is SefariaText => t !== null);
}

/**
 * Gathers the passages the answer may draw on: the refs the planner named
 * (dropped when they don't exist or, for halacha, share no words with the
 * question), Shulchan Arukh seifim found by the sources' term, their linked commentaries, the site's own
 * summaries, Sefaria full-text hits (exact for a quote being located), and
 * Hebrew Wikisource.
 */
export async function retrieve(question: string, plan: RetrievalPlan): Promise<RabbiBotPassage[]> {
  const words = keywords(`${question} ${plan.searches.join(' ')} ${plan.terms.join(' ')} ${plan.quote}`);
  const phrases = plan.searches.slice(0, 3);
  const halacha = plan.kind === 'halacha';
  const searches = [
    ...(plan.quote ? [searchRefs(plan.quote, null, 5, 'exact')] : []),
    ...phrases.flatMap(q => SEARCH_PATHS[plan.kind].map(s => searchRefs(q, s.path, s.size))),
    ...(halacha ? [searchRefs(phrases[0] ?? question, 'Talmud', 2)] : []),
  ];

  const [planned, searchHits, termTexts, wiki, sikumim] = await Promise.all([
    Promise.all(plan.refs.slice(0, 6).map(fetchText)),
    Promise.all(searches),
    halacha ? searchTerms(plan.terms) : [],
    wikisource([plan.quote || question, ...phrases.slice(0, 1)], words),
    searchSikumim(words, 2),
  ]);

  // A planned ref that exists can still be the wrong siman — for halacha, keep
  // only the ones that share words with the question, most relevant first.
  const score = (t: SefariaText) => overlap(t.segments.map(x => x.text).join(' '), words);
  const valid = planned.filter((t): t is SefariaText => t !== null && (!halacha || score(t) > 0))
    .sort((a, b) => (halacha ? score(b) - score(a) : 0));
  // The seifim the commentaries hang on: planned or found by the sources' own term.
  const known = new Set(valid.map(t => t.ref));
  const anchors = [...valid.filter(t => t.ref.startsWith('Shulchan Arukh')), ...termTexts.filter(t => !known.has(t.ref))]
    .sort((a, b) => score(b) - score(a)).slice(0, MAX_ANCHORS);
  const hitRefs = Array.from(new Set(searchHits.flat())).slice(0, 8);

  const [linked, hits] = await Promise.all([
    Promise.all(anchors.map(t => linkedCommentaries(t.segments.length === 1 ? t.ref : best(fromSefaria(t), words, 1)[0].ref, words))),
    Promise.all(hitRefs.map(fetchText)),
  ]);

  const ordered: Candidate[] = [
    ...anchors.flatMap(t => best(fromSefaria(t), words, 2)),
    ...valid.flatMap(t => best(fromSefaria(t), words, valid.length > 4 ? 2 : 3)),
    ...sikumim.map(s => ({ ref: `sikum:${s.id}`, heRef: s.heRef, book: s.book, text: s.text, url: s.url, origin: 'sikum' as const })),
    ...linked.flat(),
    ...hits.flatMap(t => (t ? best(fromSefaria(t), words, 1) : [])),
    ...wiki,
  ];

  const seen = new Set<string>();
  const out: RabbiBotPassage[] = [];
  for (const c of ordered) {
    if (seen.has(c.ref) || !c.text) continue;
    seen.add(c.ref);
    out.push({ id: `S${out.length + 1}`, ref: c.ref, heRef: c.heRef, book: c.book, url: c.url, origin: c.origin, text: excerpt(c.text, words, PASSAGE_CHARS) });
    if (out.length >= MAX_PASSAGES) break;
  }
  return out;
}
