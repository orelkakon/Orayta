import type { AmudRef, AmudSide } from '@/types/talmudContext';
import { dafToNumber } from '@/lib/hebrewData';
import { toHebrewNumeral } from '@/lib/hebrewNumerals';

// Hebrew masechet name (as stored in CitationLocation) → Sefaria index title.
// Every entry was checked against sefaria.org/api/v2/index/<title>.
const TRACTATES: Record<string, string> = {
  'ברכות': 'Berakhot', 'שבת': 'Shabbat', 'עירובין': 'Eruvin', 'פסחים': 'Pesachim',
  'יומא': 'Yoma', 'סוכה': 'Sukkah', 'ביצה': 'Beitzah', 'ראש השנה': 'Rosh Hashanah',
  'תענית': 'Taanit', 'מגילה': 'Megillah', 'מועד קטן': 'Moed Katan', 'חגיגה': 'Chagigah',
  'יבמות': 'Yevamot', 'כתובות': 'Ketubot', 'נדרים': 'Nedarim', 'נזיר': 'Nazir',
  'סוטה': 'Sotah', 'גיטין': 'Gittin', 'קידושין': 'Kiddushin', 'בבא קמא': 'Bava Kamma',
  'בבא מציעא': 'Bava Metzia', 'בבא בתרא': 'Bava Batra', 'סנהדרין': 'Sanhedrin',
  'מכות': 'Makkot', 'שבועות': 'Shevuot', 'עבודה זרה': 'Avodah Zarah', 'הוריות': 'Horayot',
  'זבחים': 'Zevachim', 'מנחות': 'Menachot', 'חולין': 'Chullin', 'בכורות': 'Bekhorot',
  'ערכין': 'Arakhin', 'תמורה': 'Temurah', 'כריתות': 'Keritot', 'מעילה': 'Meilah',
  'תמיד': 'Tamid', 'נידה': 'Niddah', 'נדה': 'Niddah',
};

export function tractateFor(masechet: string): string | null {
  return TRACTATES[masechet.trim()] ?? null;
}

/** Accepts a daf as Hebrew letters (ל״ב) or digits (32); null when unusable. */
export function parseDaf(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const n = /^\d+$/.test(s) ? Number(s) : dafToNumber(s);
  return Number.isInteger(n) && n >= 2 && n <= 200 ? n : null;
}

/** 'א' / 'a' → 'a', 'ב' / 'b' → 'b', anything else → null. */
export function parseAmud(raw: string | null | undefined): AmudSide | null {
  const s = (raw ?? '').trim();
  if (s === 'א' || s === 'a') return 'a';
  if (s === 'ב' || s === 'b') return 'b';
  return null;
}

/** Parses a Sefaria amud ref such as "Bava Kamma 4b"; null for anything else. */
export function parseSefariaRef(ref: string | null | undefined): AmudRef | null {
  const m = /\s(\d+)([ab])$/.exec(ref ?? '');
  return m ? { daf: Number(m[1]), amud: m[2] as AmudSide } : null;
}

export function sefariaRef(tractate: string, at: AmudRef): string {
  return `${tractate} ${at.daf}${at.amud}`;
}

/** "ברכות ד׳ ע״א" */
export function hebrewAmudLabel(masechet: string, at: AmudRef): string {
  const n = toHebrewNumeral(at.daf);
  const daf = n.length > 1 ? `${n.slice(0, -1)}״${n.slice(-1)}` : `${n}׳`;
  return `${masechet} ${daf} ע״${at.amud === 'a' ? 'א' : 'ב'}`;
}
