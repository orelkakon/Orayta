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
