import { keywords, tokenize } from './text';
import { skeleton } from './match';
import { impliedWords } from './rank';
import { classicalWords } from './vocab';
import type { QueryWord } from './saSearch';

/**
 * A question (and, once planned, the plan's own source-language words) as a
 * weighted query for the Shulchan Arukh index: the asker's words count most,
 * the plan's next, the classical names of the asker's modern words (vocab.ts)
 * a little less, and words merely implied ("כמה" → "שיעור") least. Pure — unit-tested.
 */
export const QUERY_WEIGHT = { asked: 1, plan: 1, classical: 0.8, implied: 0.5 } as const;

/** Two-letter words that carry no subject (the subject ones — נר, חג, דג, גט — stay). */
const SHORT_STOP = new Set(['יש', 'אז', 'כי', 'רק', 'פה', 'לי', 'לו', 'לה', 'בו', 'בה', 'הם', 'הן', 'אך', 'עד', 'אל', 'מי', 'כן', 'אי', 'אם', 'או', 'גם', 'לא', 'מה', 'זה', 'זו', 'על', 'את', 'של', 'עם', 'כל']);

/** The content words of a text, two-letter subjects included. */
export function contentWords(text: string): string[] {
  const short = tokenize(text).map(t => t.norm).filter(w => w.length === 2 && !SHORT_STOP.has(w));
  return Array.from(new Set([...keywords(text), ...short]));
}

export function saQuery(question: string, planWords: string[] = []): QueryWord[] {
  const asked = contentWords(question);
  const out = new Map<string, QueryWord>();
  const add = (list: string[], weight: number) => list.forEach(word => {
    const k = skeleton(word);
    if ((out.get(k)?.weight ?? 0) < weight) out.set(k, { word, weight });
  });
  add(impliedWords(asked), QUERY_WEIGHT.implied);
  add(keywords(asked.flatMap(classicalWords).join(' ')), QUERY_WEIGHT.classical);
  add(planWords, QUERY_WEIGHT.plan);
  add(asked, QUERY_WEIGHT.asked);
  return Array.from(out.values());
}
