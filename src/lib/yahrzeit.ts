import type { Rabbi } from '@/types';

export interface HebDateParts { hd: number; hm: string; }

export const HEB_DAY_GEMATRIA = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'י״א', 'י״ב', 'י״ג', 'י״ד', 'ט״ו', 'ט״ז', 'י״ז', 'י״ח', 'י״ט', 'כ',
  'כ״א', 'כ״ב', 'כ״ג', 'כ״ד', 'כ״ה', 'כ״ו', 'כ״ז', 'כ״ח', 'כ״ט', 'ל'];

export const HEB_MONTHS_HE: Record<string, string> = {
  'Nisan': 'ניסן', 'Iyyar': 'אייר', 'Sivan': 'סיון', 'Tamuz': 'תמוז',
  'Av': 'אב', 'Elul': 'אלול', 'Tishrei': 'תשרי', 'Cheshvan': 'חשוון',
  'Kislev': 'כסלו', 'Tevet': 'טבת', 'Shvat': 'שבט', 'Adar': 'אדר',
  'Adar I': 'אדר א׳', 'Adar II': 'אדר ב׳',
};

export function normalizeHebDate(s: string): string {
  return s.replace(/[״׳"']/g, '').replace(/\s+/g, ' ').trim();
}

/** Rabbis whose deathDate matches today's Hebrew date (hebcal converter parts). */
export function matchYahrzeitRabbis(rabbis: Rabbi[], hd: HebDateParts): Rabbi[] {
  const todayKey = normalizeHebDate(`${HEB_DAY_GEMATRIA[hd.hd] ?? ''} ${HEB_MONTHS_HE[hd.hm] ?? hd.hm}`);
  return rabbis.filter(r => r.deathDate && normalizeHebDate(r.deathDate) === todayKey);
}
