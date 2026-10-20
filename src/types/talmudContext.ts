/** One amud side, in Sefaria's latin notation. */
export type AmudSide = 'a' | 'b';

export interface AmudRef {
  daf: number;
  amud: AmudSide;
}

/** One segment of an amud: the vocalized Aramaic and its aligned Steinsaltz explanation. */
export interface TalmudSegment {
  he: string;
  ex: string;
}

/** GET /api/talmud/context response — one amud of the Bavli, sanitized. */
export interface TalmudPage {
  masechet: string;
  ref: string;
  daf: number;
  amud: AmudSide;
  sefariaUrl: string;
  segments: TalmudSegment[];
  prev: AmudRef | null;
  next: AmudRef | null;
}

/** Best-effort location of a paraphrased citation inside a page. */
export interface ContextMatch {
  index: number;
  score: number;
}
