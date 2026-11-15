import { sederIndex, masechetIndex, dafToNumber } from '@/lib/hebrewData';

interface Located { locations: { seder: string; masechet: string; daf: string }[] }

/** Citations in Talmud order (seder → masechet → daf of the first location).
 *  The list order is what /today's "ציטוט יומי" index picks from. */
export function sortCitations<T extends Located>(list: T[]): T[] {
  return [...list].sort((a, b) => {
    const la = a.locations[0];
    const lb = b.locations[0];
    if (!la || !lb) return 0;
    const sd = sederIndex(la.seder) - sederIndex(lb.seder);
    if (sd !== 0) return sd;
    const md = masechetIndex(la.masechet) - masechetIndex(lb.masechet);
    if (md !== 0) return md;
    return dafToNumber(la.daf) - dafToNumber(lb.daf);
  });
}
