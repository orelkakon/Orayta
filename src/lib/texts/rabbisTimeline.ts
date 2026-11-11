/* ציר הדורות (the rabbis timeline) and the printable notice-board page. */

const years = (n: number) => n.toLocaleString('en-US');

export const RABBIS_TIMELINE_HE = {
  RABBIS_TL_ARIA: 'ציר הדורות — כל הדמויות לפי סדר הזמן',
  RABBIS_TL_OPEN_TITLE: 'ציר הדורות',
  RABBIS_TL_OPEN_SUB: (n: number, first: string, last: string) =>
    n === 1 ? first : `${n} דמויות · מ${first} ועד ${last}`,
  RABBIS_TL_SCROLL: 'גוללים מטה — והדורות חולפים',
  RABBIS_TL_CENTURY: (n: number, bce: boolean) => `המאה ה־${n}${bce ? ' לפנה״ס' : ''}`,
  RABBIS_TL_YEARS: (from: number, to: number, bce: boolean) => `${from}–${to}${bce ? ' לפנה״ס' : ''}`,
  RABBIS_TL_GAP: (centuries: number) => {
    if (centuries === 1) return 'חולפת כמאה שנה';
    if (centuries === 2) return 'חולפות כמאתיים שנה';
    if (centuries === 10) return 'חולפות כאלף שנה';
    return `חולפות כ־${years(centuries * 100)} שנה`;
  },
  RABBIS_TL_ALIVE: 'שליט״א',
  RABBIS_TL_MORE: 'לכרטיס המלא',
  RABBIS_TL_CLOSE_VERSE: 'דּוֹר הֹלֵךְ וְדוֹר בָּא',
  RABBIS_TL_CLOSE_SUB: 'והשלשלת נמשכת',
  RABBIS_TL_TOP: 'חזרה לראשית הציר',
} as const;
