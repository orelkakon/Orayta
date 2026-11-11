/* דף לבית הכנסת — the printable notice-board page (/poster). */

export const POSTER_HE = {
  NAV_POSTER: 'דף לבית הכנסת',
  POSTER_TITLE: 'דף לבית הכנסת',
  POSTER_SUBTITLE: 'דף A4 מעוצב ללוח המודעות: מכוונים את המצלמה אל הקוד — ומגיעים ישר למניין, לסידור ולחלוקת התהילים.',
  POSTER_NAME_LABEL: 'שם בית הכנסת או הקהילה (לא חובה)',
  POSTER_NAME_PLACEHOLDER: 'למשל: בית הכנסת אהבת ישראל',
  POSTER_PRINT: 'הדפסה / שמירה כ־PDF',
  POSTER_TIP: 'בחלון ההדפסה בוחרים גודל A4, שוליים ״ללא״ והדפסת רקעים. באייפון: שיתוף ← הדפסה.',
  POSTER_NOTE: 'השם שמקלידים נשאר במכשיר בלבד ואינו נשלח לשום מקום. הקודים מובילים לכתובת האתר הנוכחית.',
  POSTER_PREVIEW_ARIA: 'תצוגה מקדימה של הדף',
  POSTER_FOR: (name: string) => `לציבור מתפללי ${name}`,
  POSTER_BRAND_LINE: 'תפילה, לימוד והלכה — במקום אחד',
  POSTER_HEAD: 'מכוונים את המצלמה — ונכנסים',
  POSTER_HEAD_SUB: 'חינם · בלי הרשמה · בלי להתקין דבר',
  POSTER_TILES: [
    { path: '/minyan', title: 'מניין קרוב', text: 'בתי הכנסת שסביבכם על המפה, עם זמני התפילות שפורסמו.' },
    { path: '/siddur', title: 'סידור', text: 'שחרית, מנחה וערבית בנוסח עדות המזרח — עם מה שאומרים היום.' },
    { path: '/tehillim', title: 'חלוקת תהילים', text: 'קוראים יחד את כל ספר התהילים — לרפואה, להצלחה או לעילוי נשמה.' },
  ],
  POSTER_MORE_TITLE: 'ועוד באורייתא',
  POSTER_MORE: ['הלימוד היומי', 'רבי־בוט — שאלות בהלכה', 'רגע של תורה', 'מקוואות', 'קברי צדיקים', 'חידון קבוצתי'],
  POSTER_HOME: 'כל האתר',
  POSTER_QR_ARIA: (title: string) => `קוד QR אל ${title}`,
} as const;
