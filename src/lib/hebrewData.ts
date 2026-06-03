import { MasechetInfo } from '@/types';

export const SEDARIM = [
  'סדר זרעים',
  'סדר מועד',
  'סדר נשים',
  'סדר נזיקין',
  'סדר קדשים',
  'סדר טהרות',
] as const;

export const MASECHTOT: MasechetInfo[] = [
  { name: 'ברכות', seder: 'סדר זרעים' },
  { name: 'שבת', seder: 'סדר מועד' },
  { name: 'עירובין', seder: 'סדר מועד' },
  { name: 'פסחים', seder: 'סדר מועד' },
  { name: 'יומא', seder: 'סדר מועד' },
  { name: 'סוכה', seder: 'סדר מועד' },
  { name: 'ביצה', seder: 'סדר מועד' },
  { name: 'ראש השנה', seder: 'סדר מועד' },
  { name: 'תענית', seder: 'סדר מועד' },
  { name: 'מגילה', seder: 'סדר מועד' },
  { name: 'מועד קטן', seder: 'סדר מועד' },
  { name: 'חגיגה', seder: 'סדר מועד' },
  { name: 'יבמות', seder: 'סדר נשים' },
  { name: 'כתובות', seder: 'סדר נשים' },
  { name: 'נדרים', seder: 'סדר נשים' },
  { name: 'נזיר', seder: 'סדר נשים' },
  { name: 'סוטה', seder: 'סדר נשים' },
  { name: 'גיטין', seder: 'סדר נשים' },
  { name: 'קידושין', seder: 'סדר נשים' },
  { name: 'בבא קמא', seder: 'סדר נזיקין' },
  { name: 'בבא מציעא', seder: 'סדר נזיקין' },
  { name: 'בבא בתרא', seder: 'סדר נזיקין' },
  { name: 'סנהדרין', seder: 'סדר נזיקין' },
  { name: 'מכות', seder: 'סדר נזיקין' },
  { name: 'שבועות', seder: 'סדר נזיקין' },
  { name: 'עבודה זרה', seder: 'סדר נזיקין' },
  { name: 'הוריות', seder: 'סדר נזיקין' },
  { name: 'זבחים', seder: 'סדר קדשים' },
  { name: 'מנחות', seder: 'סדר קדשים' },
  { name: 'חולין', seder: 'סדר קדשים' },
  { name: 'בכורות', seder: 'סדר קדשים' },
  { name: 'ערכין', seder: 'סדר קדשים' },
  { name: 'תמורה', seder: 'סדר קדשים' },
  { name: 'כריתות', seder: 'סדר קדשים' },
  { name: 'מעילה', seder: 'סדר קדשים' },
  { name: 'תמיד', seder: 'סדר קדשים' },
  { name: 'נידה', seder: 'סדר טהרות' },
];

export const getMasechetSeder = (masechet: string): string => {
  return MASECHTOT.find((m) => m.name === masechet)?.seder ?? '';
};

export const getMasechtotBySeder = (seder: string): string[] => {
  return MASECHTOT.filter((m) => m.seder === seder).map((m) => m.name);
};

const LETTER_VALUES: Record<string, number> = {
  'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
  'י': 10, 'כ': 20, 'ל': 30, 'מ': 40, 'נ': 50, 'ס': 60, 'ע': 70, 'פ': 80, 'צ': 90,
  'ק': 100, 'ר': 200, 'ש': 300, 'ת': 400,
};

export const dafToNumber = (daf: string): number => {
  const clean = daf.replace(/[״׳"']/g, '');
  return clean.split('').reduce((sum, ch) => sum + (LETTER_VALUES[ch] ?? 0), 0);
};

export const sederIndex = (seder: string): number =>
  SEDARIM.findIndex((s) => s === seder);

export const masechetIndex = (masechet: string): number =>
  MASECHTOT.findIndex((m) => m.name === masechet);
