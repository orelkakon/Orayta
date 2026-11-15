import type { TrafficSource } from '@/lib/audience/source';

/** Admin dashboard: traffic sources, new vs returning devices, group quiz, new sections. */
export const ADMIN_AUDIENCE_HE = {
  // KPI row
  ADMIN_DEVICES_WEEK: 'מכשירים ייחודיים · 7 ימים',
  ADMIN_USERS_WEEK_SUM: (n: string) => `סכום יומי (המדד הישן): ${n}`,

  // New section rows
  ADMIN_SECTION_HOME: 'דף הבית',
  ADMIN_SECTION_PLAY: 'חידון קבוצתי',
  ADMIN_SECTION_HILULA: 'הילולות',
  ADMIN_SECTION_DEDICATIONS: 'הקדשות',
  ADMIN_SECTION_TEHILLIM: 'חלוקת תהילים',
  ADMIN_SECTION_MINYAN: 'מניין קרוב',
  ADMIN_SECTION_MIKVEH: 'מקווה בסביבה',
  ADMIN_SECTION_KIVREI: 'קברי צדיקים',
  ADMIN_SECTION_ABOUT: 'אודות',
  ADMIN_SECTION_CONTACT: 'צור קשר',
  ADMIN_SECTION_ASK: 'רבי־בוט',
  ADMIN_TELEGRAM_SHARES: 'טלגרם',

  // Traffic sources
  SRC_TITLE: 'מקורות תנועה',
  SRC_SUB: 'העמוד הראשון בכל ביקור · סיכומים יומיים בלבד',
  SRC_LABEL: {
    instagram: 'אינסטגרם',
    whatsapp: 'וואטסאפ',
    telegram: 'טלגרם',
    facebook: 'פייסבוק',
    google: 'גוגל',
    'other-search': 'מנוע חיפוש אחר',
    direct: 'ישיר / לא ידוע',
    internal: 'מתוך האתר',
    other: 'אתר אחר',
  } as Record<TrafficSource, string>,
  SRC_COL_SOURCE: 'מקור',
  SRC_COL_TODAY: 'היום',
  SRC_COL_WEEK: '7 ימים',
  SRC_COL_MONTH: '30 ימים',
  SRC_CAMPAIGNS: 'קמפיינים מובילים (UTM)',
  SRC_COL_UTM: 'utm_source',
  SRC_COL_CAMPAIGN: 'קמפיין',
  SRC_NONE: '—',
  SRC_SHARE: 'שיתוף (אפליקציה לא ידועה)',
  SRC_NO_CAMPAIGNS: 'עוד לא הגיעו כניסות מקישורים מתויגים.',
  SRC_EMPTY: 'עוד אין נתונים.',
  SRC_NOTE: 'וואטסאפ ואפליקציות באייפון לרוב לא מוסרים מאיפה הגיעו, ולכן כניסות כאלה נספרות כ"ישיר" — אלא אם הגיעו מקישור ששיתפו מהאתר (מתויג UTM).',

  // New vs returning
  DEV_TITLE: 'חדשים מול חוזרים',
  DEV_SUB: 'לפי מכשיר',
  DEV_NEW_TODAY: 'חדשים היום',
  DEV_RET_TODAY: 'חוזרים היום',
  DEV_UNIQ7: 'מכשירים · 7 ימים',
  DEV_UNIQ30: 'מכשירים · 30 ימים',
  DEV_D1: 'חזרו למחרת (D1)',
  DEV_D7: 'חזרו תוך שבוע (D7)',
  DEV_COHORT: (returned: number, cohort: number) => `${returned} מתוך ${cohort}`,
  DEV_NA: '—',
  DEV_CHART: 'חדשים וחוזרים ליום',
  DEV_CHART_SUB: '30 יום',
  DEV_FRESH: 'חדשים',
  DEV_RETURNING: 'חוזרים',
  DEV_EMPTY: 'עוד אין נתונים.',
  DEV_NO_SALT: 'משתנה הסביבה STATS_SALT לא מוגדר, ולכן לא נאסף דבר.',
  DEV_NOTE: 'מזהה אקראי לכל מכשיר נשמר בגרסה מגובבת ונמחק אחרי 90 יום. אין IP ואין רשימת עמודים. מכשירים שהיו כאן לפני שהמדד נוסף נספרים כחוזרים.',

  // Shared
  AUD_SINCE: (d: string) => `נאסף מ־${d}`,
  AUD_NO_TABLE: 'הטבלה עוד לא קיימת במסד הנתונים. הנתונים יופיעו אחרי שתוחל.',
  AUD_ERROR: 'שגיאה בקריאת הנתונים ממסד הנתונים. הפרטים נרשמו ביומן השרת (Vercel).',

  // Group quiz
  PLAYC_TITLE: 'חידון קבוצתי',
  PLAYC_TODAY: 'משחקים היום',
  PLAYC_WEEK: '7 ימים',
  PLAYC_MONTH: '30 ימים',
  PLAYC_TOTAL: 'סה״כ',
  PLAYC_NOTE: 'משחקים שנפתחו (בלי המשחקים של מנהל האתר). משחקים נמחקים אחרי 3 ימים, ולכן הספירה נשמרת בנפרד.',
} as const;
