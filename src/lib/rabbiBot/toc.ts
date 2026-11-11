import TOC from './data/sa-toc.json';
import { keysOf, wordForms } from './match';

/**
 * The Shulchan Arukh's table of contents (data/sa-toc.json, built by
 * scripts/sa-toc.ts): every siman by its title, so a siman is found by its
 * subject and not only by a model's memory of its number. Matching is the
 * same spelling- and abbreviation-tolerant one as the passages, weighted by
 * how rare each word is among the titles ("דין", "הלכות" weigh nothing).
 * Server-only data; the matching is pure.
 */

export interface TocEntry { ref: string; title: string }
interface Indexed extends TocEntry { forms: Set<string> }

/** A title must share at least this much (≈ one fairly rare word) to count. */
const MIN_SCORE = 3;
/** How much a word counts by where it came from: the user's own words most, words merely implied by them ("כמה" → "שיעור") least. */
const WEIGHT = { asked: 1.5, plan: 1, implied: 0.5 } as const;

export interface TocQuery { asked: string[]; plan?: string[]; implied?: string[] }

let index: { entries: Indexed[]; idf: Map<string, number> } | null = null;

function build() {
  const entries = Object.entries(TOC as Record<string, string[]>).flatMap(([part, titles]) =>
    titles.flatMap((title, i) => (title ? [{ ref: `Shulchan Arukh, ${part} ${i + 1}`, title, forms: wordForms(title) }] : [])));
  const df = new Map<string, number>();
  entries.forEach(e => e.forms.forEach(f => df.set(f, (df.get(f) ?? 0) + 1)));
  const idf = new Map(Array.from(df, ([f, n]) => [f, Math.log(1 + entries.length / n)] as const));
  return { entries, idf };
}

/** Simanim whose title shares the question's subject, best first. */
export function tocMatches(q: TocQuery, limit: number): (TocEntry & { score: number })[] {
  const { entries, idf } = (index ??= build());
  // One weight per query word (its strongest source); a word scores once, by its rarest matching form.
  const weight = new Map<string, number>();
  const add = (words: string[] | undefined, w: number) => words?.forEach(x => weight.set(x, Math.max(weight.get(x) ?? 0, w)));
  add(q.implied, WEIGHT.implied);
  add(q.plan, WEIGHT.plan);
  add(q.asked, WEIGHT.asked);
  const words = Array.from(weight, ([word, w]) => ({ keys: keysOf(word), w }));
  const scoreOf = (forms: Set<string>) => words.reduce((s, { keys, w }) => {
    const hit = keys.filter(k => forms.has(k)).map(k => idf.get(k) ?? 0);
    return hit.length ? s + Math.max(...hit) * w : s;
  }, 0);
  return entries
    .map(e => ({ e, score: scoreOf(e.forms) }))
    .filter(x => x.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ e, score }) => ({ ref: e.ref, title: e.title, score }));
}

/** Matches as lines for a model ("Shulchan Arukh, Orach Chayim 672 — זמן הדלקת נר חנוכה"). */
export const tocLines = (matches: TocEntry[]) => matches.map(m => `${m.ref} — ${m.title}`).join('\n');
