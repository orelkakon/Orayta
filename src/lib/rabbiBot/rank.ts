import { skeleton, tokenize, wordForms } from './text';

/**
 * Passage ranking for רבי־בוט. Pure — unit-tested.
 * A plain count of shared words lets common words decide ("ברכת", "המזון",
 * "תפילת" are in half the candidates); here each word weighs by how rare it is
 * among the candidates actually fetched, so the one seif that says "אורז" wins.
 */

export type Score = (text: string) => number;

/**
 * A question word → the word the sources (and the Shulchan Arukh's siman
 * titles) use for it: "עד מתי מדליקים" is "זמן הדלקת נר חנוכה", "כמה" a "שיעור".
 */
const ASKED_AS: Record<string, string[]> = {
  מתי: ['זמן'], כמה: ['שיעור'], איפה: ['מקום'], היכן: ['מקום'], איך: ['סדר'], לחזור: ['מחזירין'],
  // The Shulchan Arukh rules for women in the plural ("נשים חייבות בהבדלה").
  אשה: ['נשים'], האשה: ['נשים'],
};
const ASKED = new Map(Object.entries(ASKED_AS).map(([k, v]) => [skeleton(k), v]));

/** The source-language words a question's wording implies (see ASKED_AS; spelling-tolerant). Pure. */
export function impliedWords(words: string[]): string[] {
  return Array.from(new Set(words.flatMap(w => ASKED.get(skeleton(w)) ?? [])));
}

/** How much a passage's length tempers its score (BM25's b): a long seif shares more words by sheer length. */
const LENGTH_NORM = 0.4;

/** The user's own words count this much more — the plan may drop the subject ("יעלה ויבוא"). */
const QUESTION_BOOST = 1.5;

/** Each word's weight: inverse document frequency over `texts`, boosted for the question's own words. */
export function wordWeights(words: string[], texts: string[], fromQuestion: string[] = []): Map<string, number> {
  const docs = texts.map(wordForms);
  const asked = new Set(fromQuestion.map(skeleton));
  return new Map(words.map(w => {
    const k = skeleton(w);
    const df = docs.filter(d => d.has(k)).length;
    const idf = Math.log(1 + (docs.length + 1) / (df + 1));
    return [w, asked.has(k) ? idf * QUESTION_BOOST : idf];
  }));
}

/**
 * Sum of the weights of the words `text` contains, tempered by its length
 * against `avgLen` (in words; 0 = no tempering). Memoized — rankings call it inside sorts.
 */
export function scorer(weights: Map<string, number>, avgLen = 0): Score {
  const keys = Array.from(weights, ([w, wt]) => [skeleton(w), wt] as const);
  const memo = new Map<string, number>();
  return text => {
    const known = memo.get(text);
    if (known !== undefined) return known;
    const forms = wordForms(text);
    const sum = keys.reduce((acc, [k, wt]) => (forms.has(k) ? acc + wt : acc), 0);
    const len = avgLen > 0 ? tokenize(text).length / avgLen : 1;
    const score = sum / (1 - LENGTH_NORM + LENGTH_NORM * len);
    memo.set(text, score);
    return score;
  };
}

/** The ranking for one question over the candidates fetched for it: rarity-weighted, length-tempered. */
export function ranker(words: string[], texts: string[], fromQuestion: string[]): Score {
  const avgLen = texts.length ? texts.reduce((n, t) => n + tokenize(t).length, 0) / texts.length : 0;
  return scorer(wordWeights(words, texts, fromQuestion), avgLen);
}
