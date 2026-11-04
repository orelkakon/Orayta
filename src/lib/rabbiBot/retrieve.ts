import type { RabbiBotKind, RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, searchRefs, SefariaText } from './sefaria';
import { searchSikumim } from './sikumim';
import { excerpt, keywords, overlap } from './text';
import { best, Candidate, fromSefaria, linkedCommentaries, searchPhrase, searchTerms, wikisource } from './sources';

export interface RetrievalPlan {
  kind: RabbiBotKind;
  refs: string[];
  searches: string[];
  /** The subject's name as the classical sources call it (כחל, not עטין). */
  terms: string[];
  /** A saying the user wants located ("where is it written / who said"). */
  quote: string;
  /** The question restated in the sources' language ("המסופק אם הטביל כלי…"). */
  rewrite: string;
  /** Refs of the rule or parallel case that decides it when nothing addresses it explicitly. */
  parallels: string[];
  /** The deciding general rule, as the sources word it ("ספק דאורייתא לחומרא"). */
  principles: string[];
}

const MAX_PASSAGES = 18;
const PASSAGE_CHARS = 1100;
const MAX_ANCHORS = 2;
/** A hit found only by a shortened phrase must share this many of the plan's words. */
const LOOSE_MIN_OVERLAP = 2;

/** Where full-text search looks, by question kind. */
const SEARCH_PATHS: Record<RabbiBotKind, { path: string; size: number }[]> = {
  halacha: [{ path: 'Halakhah', size: 4 }],
  torah: [{ path: 'Tanakh', size: 3 }, { path: 'Mishnah', size: 2 }, { path: 'Talmud', size: 3 }, { path: 'Midrash', size: 2 }],
};

/**
 * Gathers the passages the answer may draw on: the refs the planner named
 * (dropped when they don't exist or, for halacha, share no words with the
 * question), Shulchan Arukh seifim found by the sources' term, their linked
 * commentaries, the rule / parallel cases that decide an unwritten case, the
 * site's own summaries, Sefaria full-text hits (exact for a quote being
 * located; shortened phrases when a phrase finds nothing), and Hebrew Wikisource.
 */
export async function retrieve(question: string, plan: RetrievalPlan): Promise<RabbiBotPassage[]> {
  // `core` = the plan's source-language words; `words` adds the user's own wording.
  const core = keywords(`${plan.rewrite} ${plan.searches.join(' ')} ${plan.terms.join(' ')} ${plan.quote}`);
  const words = keywords(`${question} ${plan.rewrite} ${plan.searches.join(' ')} ${plan.terms.join(' ')} ${plan.quote} ${plan.principles.join(' ')}`);
  const phrases = plan.searches.slice(0, 4);
  const halacha = plan.kind === 'halacha';
  const searches = [
    ...phrases.flatMap(q => SEARCH_PATHS[plan.kind].map(s => searchPhrase(q, s.path, s.size))),
    ...(halacha ? [searchRefs(phrases[0] ?? question, 'Talmud', 2).then(refs => ({ refs, loose: false }))] : []),
  ];

  const [planned, parallels, quoteHits, searchHits, ruleHits, termTexts, wiki, sikumim] = await Promise.all([
    Promise.all(plan.refs.slice(0, 8).map(fetchText)),
    Promise.all(plan.parallels.filter(r => !plan.refs.includes(r)).slice(0, 4).map(fetchText)),
    plan.quote ? searchRefs(plan.quote, null, 5, 'exact') : Promise.resolve([]),
    Promise.all(searches),
    halacha ? Promise.all(plan.principles.slice(0, 2).map(p => searchRefs(p, 'Halakhah', 2))) : [],
    halacha ? searchTerms(plan.terms) : [],
    wikisource([plan.quote || plan.rewrite || question, ...phrases.slice(0, 1)], words),
    searchSikumim(words, 2, core),
  ]);

  // A planned ref that exists can still be the wrong siman — for halacha, keep
  // only the ones that share words with the question, most relevant first.
  const score = (t: SefariaText) => overlap(t.segments.map(x => x.text).join(' '), words);
  const relevant = (list: (SefariaText | null)[]) => list.filter((t): t is SefariaText => t !== null && (!halacha || score(t) > 0))
    .sort((a, b) => (halacha ? score(b) - score(a) : 0));
  const valid = relevant(planned);
  const decide = relevant(parallels);
  // The seifim the commentaries hang on: planned or found by the sources' own term.
  const known = new Set(valid.map(t => t.ref));
  const anchors = [...valid.filter(t => t.ref.startsWith('Shulchan Arukh')), ...termTexts.filter(t => !known.has(t.ref))]
    .sort((a, b) => score(b) - score(a)).slice(0, MAX_ANCHORS);
  const strict = searchHits.filter(h => !h.loose).flatMap(h => h.refs);
  const loose = searchHits.filter(h => h.loose).flatMap(h => h.refs);
  const hitRefs = Array.from(new Set([...quoteHits, ...strict])).slice(0, 8);
  const looseRefs = Array.from(new Set(loose)).filter(r => !hitRefs.includes(r)).slice(0, 4);
  const ruleRefs = Array.from(new Set(ruleHits.flat())).slice(0, 3);

  const [linked, hits, looseTexts, ruleTexts] = await Promise.all([
    Promise.all(anchors.map(t => linkedCommentaries(t.segments.length === 1 ? t.ref : best(fromSefaria(t), words, 1)[0].ref, words))),
    Promise.all(hitRefs.map(fetchText)),
    Promise.all(looseRefs.map(fetchText)),
    Promise.all(ruleRefs.map(fetchText)),
  ]);
  const top = (list: (SefariaText | null)[]) => list.flatMap(t => (t ? best(fromSefaria(t), words, 1) : []));

  const ordered: Candidate[] = [
    ...anchors.flatMap(t => best(fromSefaria(t), words, 2)),
    ...valid.flatMap(t => best(fromSefaria(t), words, valid.length > 4 ? 1 : valid.length > 2 ? 2 : 3)),
    ...decide.flatMap(t => best(fromSefaria(t), words, 2)),
    ...sikumim.map(s => ({ ref: `sikum:${s.id}`, heRef: s.heRef, book: s.book, text: s.text, url: s.url, origin: 'sikum' as const })),
    ...linked.flat(),
    ...top(hits),
    ...top(ruleTexts),
    ...top(looseTexts).filter(c => overlap(c.text, core.length ? core : words) >= LOOSE_MIN_OVERLAP),
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
