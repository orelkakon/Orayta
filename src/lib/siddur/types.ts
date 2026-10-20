export type ServiceId = 'shacharit' | 'mincha' | 'arvit';

/**
 * When a conditional part (or section) is said. It renders folded unless it
 * applies to the prayer-day ('optional' is always folded). Rules live in
 * calendar.ts → CONDITIONS.
 */
export type ChanukahDay = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type PartCondition =
  | 'tachanun' | 'no-tachanun' | 'mon-thu' | 'not-mon-thu' | 'torah-reading'
  | 'rosh-chodesh' | 'hallel' | 'full-hallel' | 'yaale' | 'al-hanisim'
  | 'chanukah' | `chanukah-${ChanukahDay}` | 'purim'
  | 'fast' | 'public-fast' | 'tisha-bav' | 'not-tisha-bav' | 'fast-gedalia-tevet' | 'fast-esther-purim' | 'fast-tammuz'
  | 'aseret' | 'after-yk' | 'motzash' | 'friday' | 'not-friday' | 'summer' | 'winter' | 'optional';

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
  /** Hide entirely (not just fold) on days it doesn't apply — e.g. one of eight Chanukah readings. */
  only?: boolean;
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
  /** Whole-section condition (הלל, מוסף…): folded and dropped from the chips when it doesn't apply. */
  when?: PartCondition;
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
