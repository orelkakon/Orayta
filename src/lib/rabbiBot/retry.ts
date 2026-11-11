import type { RabbiBotAnswer, RabbiBotPassage } from '@/types/rabbiBot';
import { keywords } from './text';
import { overlap } from './match';
import { impliedWords } from './rank';

/** A passage holding this share of the question's own words makes the sources look on topic. */
const ON_TOPIC = 0.75;

/**
 * Whether a "not found" earns one more try on the next model in the chain —
 * only when the miss looks like the model's, not the library's: it wrote
 * points but none of their quotes are in the passages, or it found nothing
 * although one passage holds most of the question's own words. A question
 * whose sources simply aren't there costs no second call. Pure — unit-tested.
 */
export function worthSecondTry(answer: RabbiBotAnswer, passages: RabbiBotPassage[], question: string): boolean {
  if (answer.status !== 'not_found') return false;
  if (answer.total > 0) return true;
  const asked = keywords(question);
  const words = [...asked, ...impliedWords(asked)];
  if (words.length < 2) return false;
  return passages.some(p => {
    const n = overlap(p.text, words);
    return n >= 2 && n / words.length >= ON_TOPIC;
  });
}
