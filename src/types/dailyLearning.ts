/** Daily learning cycles read in-app (texts from Sefaria's learning calendar). */
export type LearnKind =
  | 'daf' | 'mishnah' | 'halakhah' | 'rambam' | 'rambam3'
  | 'yerushalmi' | 'tanakh' | 'perek929' | 'tanya';

/** One of today's portions — GET /api/learn. */
export interface LearnItem {
  kind: LearnKind;
  /** Hebrew display value from the calendar ("בכורות ל״ב"). */
  he: string;
  /** Sefaria ref ("Bekhorot 32"). */
  ref: string;
  /** sefaria.org path for the "open in Sefaria" link. */
  url: string;
}

export interface LearnToday {
  /** Israel date the calendar is for, YYYY-MM-DD. */
  date: string;
  parasha: string | null;
  items: LearnItem[];
}

export interface LearnSegment {
  /** Position within its block (verse / halacha / seif number). */
  n: number;
  /** Sanitized presentational HTML. */
  html: string;
  /** Steinsaltz explanation for the same segment (Talmud only, on request). */
  explain?: string;
}

export interface LearnBlock {
  /** "פרק ה׳", "עמוד ב׳"… — null when the portion is a single unit. */
  heading: string | null;
  segments: LearnSegment[];
}

/** GET /api/learn/[kind] — today's portion as text. */
export interface LearnText {
  kind: LearnKind;
  ref: string;
  heRef: string;
  url: string;
  version: string | null;
  license: string | null;
  /** Show segment numbers (not for Talmud). */
  numbered: boolean;
  explained: boolean;
  blocks: LearnBlock[];
}
