import { toHebrewNumeral } from '@/lib/hebrewNumerals';

/** Last daf of each Bavli tractate (Vilna) — keeps "which daf" distractors real. */
const LAST_DAF: Record<string, number> = {
  'ברכות': 64, 'שבת': 157, 'עירובין': 105, 'פסחים': 121, 'יומא': 88, 'סוכה': 56, 'ביצה': 40,
  'ראש השנה': 35, 'תענית': 31, 'מגילה': 32, 'מועד קטן': 29, 'חגיגה': 27, 'יבמות': 122,
  'כתובות': 112, 'נדרים': 91, 'נזיר': 66, 'סוטה': 49, 'גיטין': 90, 'קידושין': 82,
  'בבא קמא': 119, 'בבא מציעא': 119, 'בבא בתרא': 176, 'סנהדרין': 113, 'מכות': 24,
  'שבועות': 49, 'עבודה זרה': 76, 'הוריות': 14, 'זבחים': 120, 'מנחות': 110, 'חולין': 142,
  'בכורות': 61, 'ערכין': 34, 'תמורה': 34, 'כריתות': 28, 'מעילה': 22, 'תמיד': 33, 'נידה': 73, 'נדה': 73,
};

export const lastDaf = (masechet: string): number | null => LAST_DAF[masechet] ?? null;

/** 32 → "ל״ב", 4 → "ד׳". */
export function dafLabel(n: number): string {
  const s = toHebrewNumeral(n);
  return s.length > 1 ? `${s.slice(0, -1)}״${s.slice(-1)}` : `${s}׳`;
}
