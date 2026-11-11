import type { RabbiBotKind, RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, searchRefs, SefariaText } from './sefaria';
import { searchSikumim } from './sikumim';
import { quotedAuthorities } from './authorities';
import { measureTexts } from './measures';
import { excerpt, keywords, overlap, simanTitle } from './text';
import { best, Candidate, fromSefaria, linkedCommentaries, searchPhrase, searchTerms, splitRemaCandidate, wikisource } from './sources';

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
/** The site's own summaries are dense and reviewed — a whole short entry usually fits. */
const SIKUM_CHARS = 1600;
const MAX_ANCHORS = 2;
/** A word in a siman's title counts this much more than one in its seifim (the title names the subject). */
const TITLE_WEIGHT = 2;
/** "Shulchan Arukh, Orach Chayim 672:1-4" / "…672:2" → "…672". */
const simanOf = (ref: string) => ref.replace(/:[\d:-]+$/, '');
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
 * site's own summaries, books quoting a posek the question names whose own
 * works aren't online (authorities.ts), a measure's modern size (measures.ts),
 * Sefaria full-text hits (exact for a quote being
 * located; shortened phrases when a phrase finds nothing), and Hebrew Wikisource.
 * A Shulchan Arukh seif reaches the model as Maran's words and, separately, the Rema's glosses.
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

  const [planned, parallels, quoteHits, searchHits, ruleHits, termTexts, wiki, sikumim, quoting, measures] = await Promise.all([
    Promise.all(plan.refs.slice(0, 8).map(fetchText)),
    Promise.all(plan.parallels.filter(r => !plan.refs.includes(r)).slice(0, 4).map(fetchText)),
    plan.quote ? searchRefs(plan.quote, null, 5, 'exact') : Promise.resolve([]),
    Promise.all(searches),
    halacha ? Promise.all(plan.principles.slice(0, 2).map(p => searchRefs(p, 'Halakhah', 2))) : [],
    halacha ? searchTerms(plan.terms) : [],
    wikisource([plan.quote || plan.rewrite || question, ...phrases.slice(0, 1)], words),
    searchSikumim(words, 2, core),
    quotedAuthorities(question, keywords(plan.terms.join(' ')), core),
    measureTexts(question, plan.terms),
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
  // Ranked by their best seif plus the siman's title (sibling simanim share the
  // vocabulary — 671 "סדר הדלקת נר חנוכה" vs 672 "זמן הדלקת נר חנוכה"), one per siman.
  const anchorScore = (t: SefariaText) => Math.max(...t.segments.map(x => overlap(x.text, words)))
    + TITLE_WEIGHT * Math.max(0, ...t.segments.map(x => overlap(simanTitle(x.text), words)));
  const simanim = new Set<string>();
  const anchors = [...valid.filter(t => t.ref.startsWith('Shulchan Arukh')), ...termTexts.filter(t => !known.has(t.ref))]
    .sort((a, b) => anchorScore(b) - anchorScore(a) || b.segments.length - a.segments.length)
    .filter(t => !simanim.has(simanOf(t.ref)) && simanim.add(simanOf(t.ref)))
    .slice(0, MAX_ANCHORS);
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
    ...sikumim.map(s => ({ ref: `sikum:${s.id}`, heRef: s.heRef, book: s.book, text: s.text, url: s.url, origin: 'sikum' as const })),
    ...valid.flatMap(t => best(fromSefaria(t), words, valid.length > 4 ? 1 : valid.length > 2 ? 2 : 3)),
    ...quoting.flatMap(t => best(fromSefaria(t), words, 1)),
    ...measures.flatMap(t => best(fromSefaria(t), words, 1)),
    ...decide.flatMap(t => best(fromSefaria(t), words, 2)),
    ...linked.flat(),
    ...top(hits),
    ...top(ruleTexts),
    ...top(looseTexts).filter(c => overlap(c.text, core.length ? core : words) >= LOOSE_MIN_OVERLAP),
    ...wiki,
  ];

  const seen = new Set<string>();
  const out: RabbiBotPassage[] = [];
  for (const c of ordered.flatMap(splitRemaCandidate)) {
    if (seen.has(c.ref) || !c.text) continue;
    seen.add(c.ref);
    out.push({ id: `S${out.length + 1}`, ref: c.ref, heRef: c.heRef, book: c.book, url: c.url, origin: c.origin, text: excerpt(c.text, words, c.origin === 'sikum' ? SIKUM_CHARS : PASSAGE_CHARS) });
    if (out.length >= MAX_PASSAGES) break;
  }
  return out;
}
