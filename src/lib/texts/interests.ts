import type { Interest, Tile } from '@/lib/interests';

/* Home personalisation by interest — spread into HE (src/lib/hebrewTexts.ts). */
export const INTERESTS_HE = {
  INTERESTS: {
    prayer: { label: 'תפילה ותהילים', sub: 'סידור, ברכות, תהילים', icon: 'sunrise' },
    learning: { label: 'לימוד', sub: 'תלמוד, סיכומים, פרשת השבוע', icon: 'openbook' },
    knowledge: { label: 'ידע ושאלות', sub: 'רבי־בוט, חידונים, גדולי ישראל', icon: 'ask' },
    community: { label: 'קהילה וסביבה', sub: 'מניין, מקווה, קברי צדיקים, שידור חי', icon: 'synagogue' },
  } as Record<Interest, { label: string; sub: string; icon: string }>,
  INTERESTS_CARD_TITLE: 'מה מעניין אותך?',
  INTERESTS_CARD_SUB: 'נסדר את דף הבית בשבילך. אפשר לבחור כמה, ולשנות בכל עת.',
  INTERESTS_SAVE: 'שמירה',
  INTERESTS_LATER: 'לא עכשיו',
  INTERESTS_SAVED_NOTE: 'אפשר לשנות בכל עת ב״עוד״ ← ״תחומי עניין״.',
  INTERESTS_SHEET_TITLE: 'תחומי עניין',
  INTERESTS_SHEET_SUB: 'דף הבית והגישה המהירה יסודרו לפי מה שתבחרו. הבחירה נשמרת במכשיר בלבד.',
  INTERESTS_CLEAR: 'בלי התאמה (דף הבית הרגיל)',
  INTERESTS_MORE_ROW: 'תחומי עניין',
  INTERESTS_GROUP_ARIA: 'תחומי עניין',
  HOME_QUICK_FOR_YOU: 'בשבילך',
  HOME_QUICK_EDIT: 'התאמה',

  ADMIN_HOME_SETTINGS: 'הגדרות דף הבית',
  ADMIN_HOME_PERSONALIZE: 'התאמה אישית לפי תחומי עניין',
  ADMIN_HOME_ON_NOTE: 'פעיל: גולשים חדשים נשאלים פעם אחת מה מעניין אותם, ודף הבית מסודר לפי הבחירה שנשמרה במכשיר שלהם.',
  ADMIN_HOME_OFF_NOTE: 'כבוי: דף הבית מוצג לכולם באותה צורה, והשאלה על תחומי עניין אינה מוצגת. הבחירות שכבר נשמרו במכשירים יחזרו לפעול אם תדליקו שוב.',
  ADMIN_HOME_ERROR: 'השמירה נכשלה. נסו שוב.',

  /** Extra quick-access tiles that interests can bring in (the defaults are HOME_QUICK). */
  HOME_QUICK_POOL: [
    { href: '/tehillim', icon: 'hands', label: 'חלוקת תהילים', tags: ['prayer', 'community'] },
    { href: '/minyan', icon: 'synagogue', label: 'מניין קרוב', tags: ['community', 'prayer'] },
    { href: '/parasha', icon: 'scroll', label: 'פרשת השבוע', tags: ['learning'] },
    { href: '/today#daily', icon: 'books', label: 'לימוד יומי', tags: ['learning'] },
    { href: '/play', icon: 'users', label: 'חידון קבוצתי', tags: ['knowledge', 'community'] },
    { href: '/gematria', icon: 'sparkle', label: 'גימטריה', tags: ['knowledge'] },
    { href: '/chidushim', icon: 'bulb', label: 'חידושים', tags: ['learning'] },
    { href: '/mikveh', icon: 'droplet', label: 'מקווה', tags: ['community'] },
    { href: '/kivrei', icon: 'tomb', label: 'קברי צדיקים', tags: ['community'] },
    { href: '/live', icon: 'live', label: 'שידור חי', tags: ['community'] },
  ] as Tile[],
};
