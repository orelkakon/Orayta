/**
 * The halachic literature's common abbreviations (ר״ח, יו״ט, ק״ש, בהמ״ז…) and
 * the words they stand for, so a question that says "ראש חודש" meets a seif
 * that writes "בר״ח". Only unambiguous ones (ר״ה is both ראש השנה and רשות הרבים).
 * Keys are in comparison form (no quote marks). Pure.
 */
const ABBREV: Record<string, string[]> = {
  רח: ['ראש', 'חודש'], יוט: ['יום', 'טוב'], קש: ['קריאת', 'שמע'], בהמז: ['ברכת', 'המזון'],
  חוהמ: ['חול', 'המועד'], שץ: ['שליח', 'ציבור'], סת: ['ספר', 'תורה'], תח: ['תלמיד', 'חכם'],
  ערש: ['ערב', 'שבת'], מוצש: ['מוצאי', 'שבת'], יוהכ: ['יום', 'הכיפורים'], נטי: ['נטילת', 'ידיים'],
  עכום: ['גוי'], עובכ: ['גוי'], שמע: ['שמונה', 'עשרה'],
};

const PREFIX = /^[בהולמשכד]/;

/** The words an abbreviation (comparison form, written with a quote mark) stands for — also behind a one-letter prefix ("בר״ח"). */
export function expandAbbrev(norm: string): string[] {
  return ABBREV[norm] ?? (PREFIX.test(norm) ? ABBREV[norm.slice(1)] ?? [] : []);
}

/** Was this word written as an abbreviation (with ״ or ")? */
export const isAbbrev = (raw: string) => /[״"]/.test(raw.slice(1, -1)) || /[״"]./.test(raw);
