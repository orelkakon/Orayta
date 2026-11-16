/**
 * Named sequences a book's summaries often follow (pure, tested via order.ts):
 * the parashot in Torah order, the books of Tanakh, the 63 tractates in
 * Mishnah order and the four parts of the Shulchan Arukh. A name maps to its
 * place, so "פרשת בא" sorts after "פרשת שמות" and "שבת" after "ברכות".
 * Spellings are compared by `skeleton` (full / defective spelling alike).
 */
const PARASHOT = [
  'בראשית', 'נח', 'לך לך', 'וירא', 'חיי שרה', 'תולדות', 'ויצא', 'וישלח', 'וישב', 'מקץ', 'ויגש', 'ויחי',
  'שמות', 'וארא', 'בא', 'בשלח', 'יתרו', 'משפטים', 'תרומה', 'תצוה', 'כי תשא', 'ויקהל', 'פקודי',
  'ויקרא', 'צו', 'שמיני', 'תזריע', 'מצורע', 'אחרי מות', 'קדושים', 'אמור', 'בהר', 'בחקתי',
  'במדבר', 'נשא', 'בהעלתך', 'שלח', 'קרח', 'חקת', 'בלק', 'פינחס', 'מטות', 'מסעי',
  'דברים', 'ואתחנן', 'עקב', 'ראה', 'שפטים', 'כי תצא', 'כי תבוא', 'נצבים', 'וילך', 'האזינו', 'וזאת הברכה',
];
// After the Torah (whose books share their first parasha's place).
const TANAKH = [
  'יהושע', 'שופטים', 'שמואל א', 'שמואל ב', 'מלכים א', 'מלכים ב', 'ישעיהו', 'ירמיהו', 'יחזקאל',
  'הושע', 'יואל', 'עמוס', 'עובדיה', 'יונה', 'מיכה', 'נחום', 'חבקוק', 'צפניה', 'חגי', 'זכריה', 'מלאכי',
  'תהילים', 'משלי', 'איוב', 'שיר השירים', 'רות', 'איכה', 'קהלת', 'אסתר', 'דניאל', 'עזרא', 'נחמיה',
  'דברי הימים א', 'דברי הימים ב',
];
const MASECHTOT = [
  'ברכות', 'פאה', 'דמאי', 'כלאים', 'שביעית', 'תרומות', 'מעשרות', 'מעשר שני', 'חלה', 'ערלה', 'ביכורים',
  'שבת', 'עירובין', 'פסחים', 'שקלים', 'יומא', 'סוכה', 'ביצה', 'ראש השנה', 'תענית', 'מגילה', 'מועד קטן', 'חגיגה',
  'יבמות', 'כתובות', 'נדרים', 'נזיר', 'סוטה', 'גיטין', 'קידושין',
  'בבא קמא', 'בבא מציעא', 'בבא בתרא', 'סנהדרין', 'מכות', 'שבועות', 'עדויות', 'עבודה זרה', 'אבות', 'הוריות',
  'זבחים', 'מנחות', 'חולין', 'בכורות', 'ערכין', 'תמורה', 'כריתות', 'מעילה', 'תמיד', 'מידות', 'קינים',
  'כלים', 'אהלות', 'נגעים', 'פרה', 'טהרות', 'מקואות', 'נדה', 'מכשירין', 'זבים', 'טבול יום', 'ידים', 'עוקצים',
];
const SHULCHAN_ARUKH = ['אורח חיים', 'יורה דעה', 'אבן העזר', 'חושן משפט'];
// Written as abbreviations (only with their ״ — "יוד" alone is a word).
const ABBREVIATIONS: Record<string, string> = {
  'או״ח': 'אורח חיים', 'יו״ד': 'יורה דעה', 'אה״ע': 'אבן העזר', 'אבהע״ז': 'אבן העזר', 'חו״מ': 'חושן משפט',
  'ב״ק': 'בבא קמא', 'ב״מ': 'בבא מציעא', 'ב״ב': 'בבא בתרא', 'ע״ז': 'עבודה זרה', 'ר״ה': 'ראש השנה', 'מו״ק': 'מועד קטן',
};

/** Words that put a summary before all the numbered ones. */
export const INTRO_WORDS = new Set(['הקדמה', 'הקדמת', 'פתיחה', 'מבוא']);

/** Words after which a name is surely a parasha / tractate / book. */
export const MARKERS = new Set(['פרשת', 'פרשה', 'פר׳', 'מסכת', 'מס׳', 'ספר', 'חומש', 'מגילת', 'הלכות']);

/** Spelling-blind form: geresh marks dropped, ו / י dropped after the first letter, finals → regular. */
export function skeleton(s: string): string {
  const plain = s.replace(/["״׳'־-]/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/[ךםןףץ]/g, c => ({ ך: 'כ', ם: 'מ', ן: 'נ', ף: 'פ', ץ: 'צ' }[c] ?? c));
  return plain.split(' ').map(w => w[0] + w.slice(1).replace(/[וי]/g, '')).join(' ');
}

const PLACES = new Map<string, number>(); // parashot, tractates, Shulchan Arukh
const BOOKS = new Map<string, number>();  // Tanakh (שופטים the book, not the parasha)
const add = (to: Map<string, number>, names: string[], base: number) =>
  names.forEach((n, i) => { const k = skeleton(n); if (!to.has(k)) to.set(k, base + i); });
add(PLACES, PARASHOT, 1);
add(PLACES, MASECHTOT, 200);
add(PLACES, SHULCHAN_ARUKH, 300);
add(BOOKS, TANAKH, 100);
for (const book of ['בראשית', 'שמות', 'ויקרא', 'במדבר', 'דברים']) BOOKS.set(skeleton(book), PLACES.get(skeleton(book)) ?? 0);
for (const [abbr, name] of Object.entries(ABBREVIATIONS)) {
  const place = PLACES.get(skeleton(name));
  if (place !== undefined) PLACES.set(`#${abbr}`, place);
}

/** Longest phrase in a sequence. */
export const MAX_PHRASE = 3;

const abbrKey = (w: string) => `#${w.replace(/"/g, '״')}`;

/** The place of a name (one to three words), or null; after "ספר" a Tanakh book wins. */
export function placeOf(words: string[], preferBook = false): number | null {
  if (words.length === 1 && PLACES.has(abbrKey(words[0]))) return PLACES.get(abbrKey(words[0])) ?? null;
  const k = skeleton(words.join(' '));
  const [first, second] = preferBook ? [BOOKS, PLACES] : [PLACES, BOOKS];
  return first.get(k) ?? second.get(k) ?? null;
}

/** Abbreviations are unambiguous anywhere in a title. */
export function isAbbreviation(word: string): boolean {
  return PLACES.has(abbrKey(word));
}
