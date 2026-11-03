/* /today ("יומי") — spread into HE (src/lib/hebrewTexts.ts). */
export const TODAY_HE = {
  TODAY_DAY_LINE: (weekday: string, parasha: string) => (parasha ? `${weekday} · ${parasha}` : weekday),
  TODAY_SHABBAT: 'שבת קודש',
  TODAY_WEEKDAY: (day: string) => `יום ${day}`,
  TODAY_DAYS: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'] as string[],
  TODAY_SECTION_ORAYTA: 'היום באורייתא',
  TODAY_COMPASS_DIRS: { n: 'צ', e: 'מז', s: 'ד', w: 'מע' } as Record<string, string>,
  TODAY_COMPASS_JERUSALEM: 'ירושלים',
};
