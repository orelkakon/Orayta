/**
 * Hebrew typography for summaries (pure, tested). Applied by the API on every
 * save and to each dictated piece, so what's stored is clean however it was
 * typed: no invisible direction marks (iOS and copied text add RLMs), real
 * gershayim / geresh instead of keyboard quotes, single spaces, no space
 * before punctuation, a space after it, a dash for a spaced hyphen. Words are
 * never changed.
 */
const INVISIBLE = /[​‎‏‪-‮⁦-⁩﻿]/g;
const HEB = 'א-ת';

/** One line (title, location, a dictated piece): typography without touching line breaks. */
export function tidyInline(s: string): string {
  return s
    .replace(INVISIBLE, '')
    .replace(/[\t  ]+/g, ' ')
    // ר"ח / רל"ז → ר״ח / רל״ז;  '' or ׳׳ → ״
    .replace(new RegExp(`([${HEB}])(?:"|''|׳׳|”|“)(?=[${HEB}])`, 'g'), '$1״')
    // ר' יוחנן / א' → ׳ (a geresh always follows a letter)
    .replace(new RegExp(`([${HEB}])['’‘]`, 'g'), '$1׳')
    // a spaced hyphen is a dash
    .replace(/ (?:-|--|—) /g, ' – ')
    // no space before closing punctuation
    .replace(/ +([,.;:?!)\]])/g, '$1')
    // no space after an opening bracket
    .replace(/([(\[]) +/g, '$1')
    // a space after punctuation that runs straight into a Hebrew word
    .replace(new RegExp(`([,;:?!])(?=[${HEB}])`, 'g'), '$1 ')
    .replace(new RegExp(`([${HEB}״׳)]\\.)(?=[${HEB}])`, 'g'), '$1 ')
    .trim();
}

/** A whole summary: every line tidied, at most one empty line between paragraphs. */
export function tidySikumText(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(tidyInline)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function countWords(text: string): number {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/** Reading time in whole minutes (≈200 Hebrew words a minute), at least 1 for any text. */
export const readingMinutes = (words: number) => (words ? Math.max(1, Math.round(words / 200)) : 0);
