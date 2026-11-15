import { tidyInline } from './typography';

/**
 * Dictating a summary (pure, tested): the Whisper prompt, spoken line
 * breaks, and how a transcribed piece joins the text around the cursor.
 */

/** Longest single piece sent for transcription (seconds) — dictation itself is unlimited. */
export const SEGMENT_MAX_SEC = 40;
/** Context sent with each piece: the end of what's written so far. */
const CONTEXT_CHARS = 160;

/**
 * Whisper's prompt: Torah vocabulary, then the book, the title and the last
 * words before the cursor — so it spells the book's terms and keeps the
 * sentence going. A punctuated prompt also gets a punctuated transcript.
 */
const VOCAB =
  'סיכום לימוד: הלכה, גמרא, משנה, שולחן ערוך, משנה ברורה, כף החיים, הרמב״ם, ספר החינוך, ' +
  'חסידות, הצדיק, הקדוש ברוך הוא, עבודת ה׳, יראת שמיים, קדושה, מצווה, תפילה, ברכה, קריאת שמע.';

export function dictationPrompt(ctx: { book?: string; title?: string; before?: string }): string {
  const parts = [VOCAB];
  if (ctx.book) parts.push(`ספר ${ctx.book}.`);
  if (ctx.title?.trim()) parts.push(`${ctx.title.trim()}.`);
  const before = ctx.before?.replace(/\s+/g, ' ').trim().slice(-CONTEXT_CHARS);
  if (before) parts.push(before.replace(/^\S*\s/, '')); // start on a whole word
  return parts.join(' ');
}

/** "…פסקה חדשה…" / "שורה חדשה" spoken → a line break. */
const NEW_LINE = /[\s,]*(?:פסקה|שורה) חדשה[\s,.]*/g;

/**
 * A transcribed piece made ready to insert between `before` and `after`:
 * typography, spoken line breaks, a space where words would touch.
 * '' when nothing is left (or Whisper only echoed the prompt's context).
 */
export function joinDictation(raw: string, before: string, after: string, context = ''): string {
  let text = raw.replace(NEW_LINE, '\n').split('\n').map(tidyInline).join('\n');
  if (!text.replace(/\n/g, '').trim() && !text.includes('\n')) return '';
  if (text.length > 12 && context.includes(text)) return '';
  const prev = before.slice(-1);
  const next = after.slice(0, 1);
  if (prev && !/\s/.test(prev) && !text.startsWith('\n')) text = ` ${text}`;
  if (next && !/\s/.test(next) && !/^[,.;:?!)]/.test(next) && !text.endsWith('\n')) text = `${text} `;
  return text;
}
