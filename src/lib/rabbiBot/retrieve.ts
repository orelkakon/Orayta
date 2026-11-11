import type { RabbiBotKind, RabbiBotPassage } from '@/types/rabbiBot';
import { fetchText, searchRefs, SefariaText } from './sefaria';
import { searchSikumim } from './sikumim';
import { quotedAuthorities } from './authorities';
import { measureTexts } from './measures';
import { excerpt, keywords, overlap, simanTitle } from './text';
import { best, Candidate, fromSefaria, linkedCommentaries, searchPhrase, splitRemaCandidate, wikisource } from './sources';
import { arukhHaShulchanRef, shulchanArukhSimanim, spellings } from './anchors';
import { impliedWords, ranker } from './rank';

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
/** Simanim whose best seifim go to the model; the first LINKED of them also bring their commentaries. */
const MAX_ANCHORS = 3;
const LINKED = 2;
/** A word in a siman's title counts this much more than one in its seifim (the title names the subject). */
const TITLE_WEIGHT = 2;
/** A hit found only by a shortened phrase must share this many of the plan's words. */
const LOOSE_MIN_OVERLAP = 2;
const isSA = (ref: string) => ref.startsWith('Shulchan Arukh, ');

/** Where full-text search looks, by question kind. */
const SEARCH_PATHS: Record<RabbiBotKind, { path: string; size: number }[]> = {
  halacha: [{ path: 'Halakhah', size: 4 }],
  torah: [{ path: 'Tanakh', size: 3 }, { path: 'Mishnah', size: 2 }, { path: 'Talmud', size: 3 }, { path: 'Midrash', size: 2 }],
};

/**
 * Gathers the passages the answer may draw on. For halacha the core is the
 * Shulchan Arukh (anchors.ts): the whole simanim of the seifim the plan
 * names, the plan's phrases and the sources' term, ranked by their best seif and
 * the siman's title; the best simanim bring their linked commentaries and the
 * same siman in the Arukh HaShulchan. Then the
 * site's own summaries, the other refs the plan named (dropped when they don't
 * exist or, for halacha, share no words with the question), books quoting a
 * posek the question names whose own works aren't online (authorities.ts), a
 * measure's modern size (measures.ts), the rule / parallel cases that decide an
 * unwritten case, Sefaria full-text hits (exact for a quote being located;
 * shortened phrases when a phrase finds nothing), and Hebrew Wikisource.
 * Passages are ranked by rarity-weighted shared words (rank.ts). A Shulchan
 * Arukh seif reaches the model as Maran's words and, separately, the Rema's glosses.
 */
export async function retrieve(question: string, plan: RetrievalPlan): Promise<RabbiBotPassage[]> {
  // `core` = the plan's source-language words; `words` adds the user's own wording.
  const core = keywords(`${plan.rewrite} ${plan.searches.join(' ')} ${plan.terms.join(' ')} ${plan.quote}`);
  const implied = impliedWords(keywords(question));
  const asked = [...keywords(question), ...implied];
  const words = [...keywords(`${question} ${plan.rewrite} ${plan.searches.join(' ')} ${plan.terms.join(' ')} ${plan.quote} ${plan.principles.join(' ')}`), ...implied];
  const phrases = plan.searches.slice(0, 4);
  const halacha = plan.kind === 'halacha';
  // The subject with the word the question implies ("יעלה ויבא" + "מחזירין") — how the ruling reads.
  const pairs = plan.terms.slice(0, 2).flatMap(t => implied.slice(0, 1).flatMap(w => spellings(`${t} ${w}`))).slice(0, 3);
  const searches = [
    ...phrases.flatMap(q => SEARCH_PATHS[plan.kind].map(s => searchPhrase(q, s.path, s.size))),
    ...(halacha ? [searchRefs(phrases[0] ?? question, 'Talmud', 2).then(refs => ({ refs, loose: false }))] : []),
  ];

  const [planned, parallels, quoteHits, searchHits, ruleHits, simanim, wiki, sikumim, quoting, measures] = await Promise.all([
    Promise.all(plan.refs.filter(r => !(halacha && isSA(r))).slice(0, 8).map(fetchText)),
    Promise.all(plan.parallels.filter(r => !plan.refs.includes(r)).slice(0, 4).map(fetchText)),
    plan.quote ? searchRefs(plan.quote, null, 5, 'exact') : Promise.resolve([]),
    Promise.all(searches),
    halacha ? Promise.all(plan.principles.slice(0, 2).map(p => searchRefs(p, 'Halakhah', 2))) : [],
    halacha ? shulchanArukhSimanim(plan.refs, phrases, plan.terms, pairs) : [],
    wikisource([plan.quote || plan.rewrite || question, ...phrases.slice(0, 1)], words),
    searchSikumim(words, 2, core),
    quotedAuthorities(question, keywords(plan.terms.join(' ')), core),
    measureTexts(question, plan.terms),
  ]);

  const segs = (list: (SefariaText | null)[]) => list.flatMap(t => (t ? t.segments.map(x => x.text) : []));
  const rank = ranker(words, [...segs(simanim), ...segs(planned), ...segs(parallels)], asked);
  // A planned ref that exists can still be the wrong siman — for halacha, keep
  // only the ones that share words with the question, most relevant first.
  const whole = (t: SefariaText) => t.segments.map(x => x.text).join(' ');
  const relevant = (list: (SefariaText | null)[]) => list.filter((t): t is SefariaText => t !== null && (!halacha || overlap(whole(t), words) > 0))
    .sort((a, b) => (halacha ? rank(whole(b)) - rank(whole(a)) : 0));
  const valid = relevant(planned);
  const decide = relevant(parallels);
  // Sibling simanim share the vocabulary (671 "סדר הדלקת נר חנוכה" vs 672 "זמן הדלקת נר חנוכה"): the title decides.
  const anchorScore = (t: SefariaText) => Math.max(...t.segments.map(x => rank(x.text)))
    + TITLE_WEIGHT * Math.max(0, ...t.segments.map(x => rank(simanTitle(x.text))));
  // The plan's own seifim: a well-known ruling may share few words with the
  // question (89:1 "לא יאכל גבינה… שש שעות"), so at least one of the plan's
  // simanim is kept, and a seif it names always goes in with its siman.
  const named = new Set(plan.refs);
  const ranked = simanim.map(t => ({ t, s: anchorScore(t), named: t.segments.some(x => named.has(x.ref)) }))
    .filter(x => x.s > 0).sort((a, b) => b.s - a.s);
  const plannedSiman = ranked.find(x => x.named);
  const anchors = (plannedSiman && !ranked.slice(0, MAX_ANCHORS).includes(plannedSiman)
    ? [ranked[0], plannedSiman, ...ranked.slice(1, MAX_ANCHORS - 1)] : ranked.slice(0, MAX_ANCHORS)).map(x => x.t);
  // Within a siman, rarity is measured among its own seifim: which one is about the question.
  const seifim = (t: SefariaText) => {
    const own = fromSefaria(t);
    const local = ranker(words, own.map(c => c.text), asked);
    return Array.from(new Set([...own.filter(c => named.has(c.ref)), ...best(own, local, 2)])).slice(0, 3);
  };
  const strict = searchHits.filter(h => !h.loose).flatMap(h => h.refs);
  const loose = searchHits.filter(h => h.loose).flatMap(h => h.refs);
  const hitRefs = Array.from(new Set([...quoteHits, ...strict])).slice(0, 8);
  const looseRefs = Array.from(new Set(loose)).filter(r => !hitRefs.includes(r)).slice(0, 4);
  const ruleRefs = Array.from(new Set(ruleHits.flat())).slice(0, 3);

  const [linked, explained, hits, looseTexts, ruleTexts] = await Promise.all([
    Promise.all(anchors.slice(0, LINKED).map(t => linkedCommentaries(best(fromSefaria(t), rank, 1)[0].ref, rank))),
    // The same siman in the Arukh HaShulchan — plain Hebrew, abbreviations spelled out.
    Promise.all(anchors.slice(0, LINKED).map(t => arukhHaShulchanRef(t.ref)).filter((r): r is string => r !== null).map(fetchText)),
    Promise.all(hitRefs.map(fetchText)),
    Promise.all(looseRefs.map(fetchText)),
    Promise.all(ruleRefs.map(fetchText)),
  ]);
  const top = (list: (SefariaText | null)[]) => list.flatMap(t => (t ? best(fromSefaria(t), rank, 1) : []));

  const ordered: Candidate[] = [
    ...anchors.flatMap(seifim),
    ...sikumim.map(s => ({ ref: `sikum:${s.id}`, heRef: s.heRef, book: s.book, text: s.text, url: s.url, origin: 'sikum' as const })),
    ...valid.flatMap(t => best(fromSefaria(t), rank, valid.length > 4 ? 1 : valid.length > 2 ? 2 : 3)),
    ...quoting.flatMap(t => best(fromSefaria(t), rank, 1)),
    ...measures.flatMap(t => best(fromSefaria(t), rank, 1)),
    ...decide.flatMap(t => best(fromSefaria(t), rank, 2)),
    ...explained.flatMap(t => (t ? best(fromSefaria(t), ranker(words, t.segments.map(x => x.text), asked), 1) : [])),
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
