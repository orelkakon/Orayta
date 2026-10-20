import type { LearnKind } from '@/types/dailyLearning';
import { HE } from '@/lib/hebrewTexts';

/** Word before a block number ("פרק ה׳"); 'amud' labels Talmud amudim. */
export type HeadingKind = 'amud' | 'perek' | 'siman' | 'halacha';

export interface LearnKindDef {
  kind: LearnKind;
  /** Exact `title.en` of the item in Sefaria's calendar. */
  sefariaTitle: string;
  label: string;
  icon: string;
  numbered: boolean;
  heading: HeadingKind;
  /** Steinsaltz Hebrew explanation is available (Sefaria "Steinsaltz on …"). */
  explain: boolean;
  /** Listed up front on /today; the rest sit behind "עוד לימודים". */
  primary: boolean;
}

export const LEARN_KINDS: LearnKindDef[] = [
  { kind: 'daf', sefariaTitle: 'Daf Yomi', label: HE.LEARN_KIND.daf, icon: 'openbook', numbered: false, heading: 'amud', explain: true, primary: true },
  { kind: 'mishnah', sefariaTitle: 'Daily Mishnah', label: HE.LEARN_KIND.mishnah, icon: 'scroll', numbered: true, heading: 'perek', explain: false, primary: true },
  { kind: 'halakhah', sefariaTitle: 'Halakhah Yomit', label: HE.LEARN_KIND.halakhah, icon: 'book', numbered: true, heading: 'siman', explain: false, primary: true },
  { kind: 'rambam', sefariaTitle: 'Daily Rambam', label: HE.LEARN_KIND.rambam, icon: 'books', numbered: true, heading: 'perek', explain: false, primary: true },
  { kind: 'yerushalmi', sefariaTitle: 'Yerushalmi Yomi', label: HE.LEARN_KIND.yerushalmi, icon: 'openbook', numbered: false, heading: 'halacha', explain: false, primary: true },
  { kind: 'rambam3', sefariaTitle: 'Daily Rambam (3 Chapters)', label: HE.LEARN_KIND.rambam3, icon: 'books', numbered: true, heading: 'perek', explain: false, primary: false },
  { kind: 'tanakh', sefariaTitle: 'Tanakh Yomi', label: HE.LEARN_KIND.tanakh, icon: 'scroll', numbered: true, heading: 'perek', explain: false, primary: false },
  { kind: 'perek929', sefariaTitle: '929', label: HE.LEARN_KIND.perek929, icon: 'scroll', numbered: true, heading: 'perek', explain: false, primary: false },
  { kind: 'tanya', sefariaTitle: 'Tanya Yomi', label: HE.LEARN_KIND.tanya, icon: 'quill', numbered: false, heading: 'perek', explain: false, primary: false },
];

export function isLearnKind(v: unknown): v is LearnKind {
  return typeof v === 'string' && LEARN_KINDS.some(k => k.kind === v);
}

export function learnKind(kind: LearnKind): LearnKindDef {
  return LEARN_KINDS.find(k => k.kind === kind) ?? LEARN_KINDS[0];
}

/** Israel calendar date, YYYY-MM-DD — the key for "today" across devices. */
export function israelDateKey(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(d);
}

export const isDateKey = (s: unknown): s is string => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
