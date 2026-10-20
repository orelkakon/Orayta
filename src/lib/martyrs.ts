/**
 * עשרה הרוגי מלכות — as listed in the Yom Kippur piyyut "אלה אזכרה", by
 * their display names in the Rabbi table. Shown with a flame mark wherever
 * a rabbi appears (directory, stories, רגע של תורה).
 */
const MARTYRS: ReadonlySet<string> = new Set([
  'רבן שמעון בן גמליאל',
  'רבי ישמעאל בן אלישע',
  'רבי עקיבא',
  'רבי חנינא בן תרדיון',
  'רבי חוצפית המתורגמן',
  'רבי ישבב הסופר',
  'רבי יהודה בן בבא',
  'רבי יהודה בן דמא',
  'רבי חנינא בן חכינאי',
  'רבי אלעזר בן שמוע',
]);

export const isMartyr = (name: string): boolean => MARTYRS.has(name.trim());
