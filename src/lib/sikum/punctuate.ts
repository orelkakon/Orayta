import { tidySikumText } from './typography';

/**
 * "סדר פיסוק" (pure, tested): a model adds punctuation and paragraph breaks
 * to a dictated or hastily typed summary. Its output is accepted only when
 * the words are exactly the writer's — same words, same order — so a model
 * that "improves" the wording is rejected, never applied.
 */
export const PUNCTUATE_MAX_CHARS = 6000;

export const PUNCTUATE_SYSTEM =
  'אתה מגיה טקסטים תורניים בעברית. תפקידך היחיד: להוסיף סימני פיסוק (נקודה, פסיק, נקודתיים, סימן שאלה, ' +
  'מירכאות סביב ציטוט) ולחלק לפסקאות במקומות שהעניין מתחלף. אסור לשנות, להוסיף, למחוק או להחליף אף מילה, ' +
  'גם לא לתקן כתיב או דקדוק, וגם לא לפתוח ראשי תיבות. שמור על הסדר המדויק של המילים. ' +
  'החזר JSON בלבד: {"text": "<הטקסט המפוסק>"}.';

export const PUNCTUATE_SCHEMA = {
  type: 'object',
  properties: { text: { type: 'string' } },
  required: ['text'],
};

/** The words alone: letters and digits, quote marks and gershayim ignored. */
export function wordsOf(text: string): string[] {
  return text
    .replace(/[״׳"'`]/g, '')
    .split(/[^0-9A-Za-zא-תְ-ׇ]+/)
    .filter(Boolean);
}

export function sameWords(a: string, b: string): boolean {
  const x = wordsOf(a);
  const y = wordsOf(b);
  return x.length === y.length && x.every((w, i) => w === y[i]);
}

/** The model's text when it kept every word, tidied; null when it changed any. */
export function acceptPunctuation(original: string, value: unknown): string | null {
  const text = (value as { text?: unknown } | null)?.text;
  if (typeof text !== 'string' || !text.trim()) return null;
  const tidy = tidySikumText(text);
  return sameWords(original, tidy) ? tidy : null;
}
