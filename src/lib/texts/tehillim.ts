/* חלוקת תהילים (/tehillim) — spread into HE (src/lib/hebrewTexts.ts). */
import type { TehillimMode, TehillimPurpose } from '@/types/tehillim';

export interface PurposeText { label: string; prefix: string; namesLabel: string; namesHint: string }

export const TEHILLIM_HE = {
  TH_NAV: 'חלוקת תהילים',
  TH_PAGE_TITLE: 'חלוקת תהילים',
  TH_PAGE_DESC: 'קוראים יחד את כל ספר תהילים — לרפואה, לעילוי נשמה, לישועה. פותחים קישור, משתפים, וכל אחד מקבל פרק משלו לקריאה באתר, עם התקדמות חיה.',

  /* Landing */
  TH_HERO_KICKER: 'חלוקת תהילים',
  TH_HERO_TITLE: 'כל ספר תהילים, ביחד, תוך דקות',
  TH_HERO_SUB: 'פותחים חלוקה, שולחים קישור לקבוצה — וכל מי שנכנס מקבל פרק משלו וקורא אותו כאן. רואים בזמן אמת כמה נקרא ומי מצטרף.',
  TH_HERO_CTA: 'פתיחת חלוקה חדשה',
  TH_MINE_TITLE: 'החלוקות שלי',
  TH_MINE_ORGANIZER: 'פתחתם',
  TH_MINE_EMPTY: 'חלוקות שתפתחו או תצטרפו אליהן יופיעו כאן.',
  TH_STEPS_TITLE: 'איך זה עובד',
  TH_STEPS: [
    { title: 'פותחים', text: 'בוחרים למה קוראים ולמי — שני שדות, וזהו.' },
    { title: 'משתפים', text: 'הודעת וואטסאפ מוכנה עם הקישור והתמונה.' },
    { title: 'קוראים', text: 'כל אחד מקבל פרק פנוי וקורא אותו כאן, בניקוד מלא.' },
    { title: 'מסיימים', text: 'ספר שלם נגמר? הבא נפתח מעצמו, ואפשר לקרוא עוד.' },
  ],
  TH_PERKS_TITLE: 'מה מיוחד כאן',
  TH_PERKS: [
    'פרק קי״ט מחולק ל־22 אותיות, כמו בכל ספר תהילים — אף אחד לא מקבל חצי שעה של קריאה במקרה.',
    'רוצים פרק מסוים? בוחרים אותו במפת הפרקים.',
    'אפשר לחלק לפי פרקים, לפי ימי החודש או לפי חמשת הספרים.',
    'בלי הרשמה ובלי אפליקציה. עובד מכל טלפון.',
  ],

  /* Create */
  TH_NEW_TITLE: 'פתיחת חלוקת תהילים',
  TH_NEW_SUB: 'ממלאים, פותחים, ומשתפים את הקישור.',
  TH_PURPOSE_LABEL: 'למה קוראים?',
  TH_PURPOSES: {
    refua: { label: 'רפואה שלמה', prefix: 'לרפואת', namesLabel: 'שם החולה', namesHint: 'שם + בן/בת + שם האם — למשל: משה בן שרה' },
    neshama: { label: 'עילוי נשמת', prefix: 'לעילוי נשמת', namesLabel: 'שם הנפטר', namesHint: 'שם + בן/בת + שם האב — למשל: שרה בת אברהם' },
    hatzlacha: { label: 'הצלחה', prefix: 'להצלחת', namesLabel: 'למי', namesHint: 'שם + בן/בת + שם האם' },
    zivug: { label: 'זיווג הגון', prefix: 'לזיווג הגון של', namesLabel: 'למי', namesHint: 'שם + בן/בת + שם האם' },
    banim: { label: 'זרע של קיימא', prefix: 'לזרע של קיימא עבור', namesLabel: 'למי', namesHint: 'שם + בן/בת + שם האם' },
    yeshua: { label: 'ישועה', prefix: 'לישועת', namesLabel: 'למי', namesHint: 'שם + בן/בת + שם האם' },
    shmira: { label: 'שמירה', prefix: 'לשמירת', namesLabel: 'על מי', namesHint: 'למשל: חיילי צה״ל, או שם + בן/בת + שם האם' },
    other: { label: 'כוונה אחרת', prefix: '', namesLabel: 'הכוונה', namesHint: 'למשל: לשלום עם ישראל' },
  } satisfies Record<TehillimPurpose, PurposeText>,
  TH_NAME_ADD: 'הוספת שם',
  TH_NAME_REMOVE: (n: number) => `הסרת שם ${n}`,
  TH_MODE_LABEL: 'כל משתתף מקבל',
  TH_MODES: {
    chapter: { label: 'פרק', hint: 'הכי קל לשתף — 2–3 דקות לפרק' },
    day: { label: 'יום בחודש', hint: '30 חלקים, כמו תהילים לפי ימי החודש' },
    book: { label: 'ספר', hint: '5 חלקים — למי שקורא הרבה' },
  } satisfies Record<TehillimMode, { label: string; hint: string }>,
  TH_GOAL_LABEL: 'כמה ספרים לסיים',
  TH_GOAL: (n: number) => (n === 0 ? 'בלי הגבלה' : n === 1 ? 'ספר אחד' : `${n} ספרים`),
  TH_MORE_OPTIONS: 'עוד אפשרויות',
  TH_TITLE_LABEL: 'כותרת (לא חובה)',
  TH_TITLE_PH: 'למשל: תהילים לרפואת סבא',
  TH_NOTE_LABEL: 'הודעה למשתתפים (לא חובה)',
  TH_NOTE_PH: 'למשל: הניתוח מחר בבוקר — כל פרק חשוב 🙏',
  TH_ENDS_LABEL: 'עד תאריך (לא חובה)',
  TH_PREVIEW: 'כך זה ייראה',
  TH_CREATE: 'פתיחת החלוקה',
  TH_CREATING: 'פותחים…',
  TH_CREATE_ERRORS: {
    names: 'כתבו לפחות שם אחד (2–40 תווים, בלי קישורים).',
    rate_limited: 'פתחתם הרבה חלוקות בשעה האחרונה — נסו שוב מאוחר יותר.',
    other: 'הפתיחה לא הצליחה — נסו שוב.',
  },
  TH_PRIVACY_NOTE: 'השמות יוצגו לכל מי שמקבל את הקישור. אל תכתבו פרטים מזהים נוספים.',
} as const;
