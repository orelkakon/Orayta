/** /legal — terms of use, privacy policy and accessibility statement. */

export type LegalDocId = 'terms' | 'privacy' | 'accessibility';

/**
 * A paragraph, or a bullet list when an array. Inline links are written as
 * `[label](href)`; a paragraph may open with a bold lead ending in `: ` when
 * it starts with `**lead**`.
 */
export type LegalBlock = string | string[];

export interface LegalSection {
  title: string;
  blocks: LegalBlock[];
}

export interface LegalDoc {
  id: LegalDocId;
  title: string;
  /** Plain-language bullets shown before the full text. */
  summary: string[];
  sections: LegalSection[];
}
