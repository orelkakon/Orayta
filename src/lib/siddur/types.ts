export type ServiceId = 'shacharit' | 'mincha' | 'arvit';

/**
 * When a seasonal/conditional part is said. Parts with a condition render
 * collapsed unless it applies today ('optional' is always collapsed).
 */
export type PartCondition = 'mon-thu' | 'aseret' | 'motzash' | 'optional';

/**
 * A contiguous slice of one Sefaria node of Siddur Edot HaMizrach.
 * `node` is the path under the index, e.g. "Weekday_Shacharit, Amida";
 * `from`/`to` are 1-based inclusive segment numbers (segment 1 is usually
 * the node's own title, which we replace with our section heading).
 */
export interface PrayerPart {
  node: string;
  from: number;
  to: number;
  /** Sub-anchor listed under the section in the contents sheet. */
  mark?: string;
  when?: PartCondition;
  /** Short explanation shown on a collapsed conditional part. */
  note?: string;
  /** Song of the day: 0 = Sunday … 5 = Friday. */
  weekday?: number;
}

export interface PrayerSection {
  id: string;
  title: string;
  /** Label for the compact navigation chip (defaults to title). */
  chip?: string;
  /** One-line context under the heading ("אין אומרים בימים שאין בהם תחנון"). */
  note?: string;
  parts: PrayerPart[];
}

export interface PrayerService {
  id: ServiceId;
  title: string;
  icon: string;
  /** Highlights shown on the service card. */
  highlights: string;
  sections: PrayerSection[];
}

/** GET /api/siddur/[service] — raw (sanitized) segments per Sefaria node. */
export interface SiddurServiceText {
  nodes: Record<string, string[]>;
  failed: string[];
}
