/* Prayers hub (/content) + siddur landing — spread into HE. */
export const PRAYERS_HE = {
  PRAYERS_TITLE: 'תפילות',
  PRAYERS_SUB: 'סידור, ברכות, תהילים ותנ״ך — מה שצריך, ברגע שצריך',
  PRAYERS_NOW_EYEBROW: 'התפילה של עכשיו',
  PRAYERS_OPEN_SERVICE: (name: string) => `לפתוח את ${name}`,
  PRAYERS_TODAY_INSERTS: 'נאמר היום',
  PRAYERS_OTHER_SERVICES: 'תפילות היום',
  PRAYERS_QUICK_TITLE: 'שימושי ביום־יום',
  PRAYERS_QUICK: [
    { id: 'birkhat-hamazon', icon: 'bread', label: 'ברכת המזון' },
    { id: 'brachot-nehenin', icon: 'cup', label: 'ברכות הנהנין' },
    { id: 'asher-yatzar', icon: 'droplet', label: 'אשר יצר' },
    { id: 'tefilat-haderech', icon: 'road', label: 'תפילת הדרך' },
    { id: 'bedtime-shema', icon: 'moon', label: 'ק״ש על המיטה' },
    { id: 'tehillim', icon: 'scroll', label: 'תהילים' },
    { id: 'kaddish', icon: 'candle', label: 'קדיש' },
    { id: 'brachot-reiya', icon: 'eye', label: 'ברכות הראייה' },
  ] as { id: string; icon: string; label: string }[],
  PRAYERS_SIDDUR_MORE: 'עוד מהסידור',
  PRAYERS_TANAKH_TITLE: 'תהילים ותנ״ך',
  PRAYERS_READER_ARIA: (title: string) => `קריאה: ${title}`,
};
