/* /about — spread into HE (src/lib/hebrewTexts.ts). */

export interface AboutFeature { icon: string; title: string; text: string; href: string; big?: boolean }

export const ABOUT_HE = {
  ABOUT_HERO_KICKER: 'מיזם תורני פתוח לכולם',
  ABOUT_HERO_LEAD: 'לימוד, תפילה וחזרה על מקורות ישראל — במקום אחד, בכל יום, מכל מכשיר.',
  ABOUT_VERSE_SOURCE: 'משלי ד, ב',
  ABOUT_SCROLL_CUE: 'גללו לסיפור',
  ABOUT_ORBIT_LETTERS: 'אבגדהוזחטיכלמנסעפצקרשת',

  ABOUT_MANIFESTO_KICKER: 'למה אורייתא',
  ABOUT_MANIFESTO: 'אורייתא נולדה מרצון פשוט: שכל אחד יוכל לפתוח את הטלפון ולמצוא בו רגע של תורה. ציטוט מהגמרא, גדול מגדולי הדורות, תפילה בנוסח של היום או שאלה בהלכה — ערוכים, נגישים ומחכים לכם.',

  ABOUT_CHAIN_KICKER: 'שרשרת הדורות',
  ABOUT_CHAIN_TITLE: 'מסיני ועד ימינו',
  ABOUT_CHAIN_SUB: 'מאגר הרבנים מסודר לפי הדורות — כל דור מקבל מזה שלפניו ומוסר לזה שאחריו.',
  ABOUT_CHAIN_CTA: 'למאגר הרבנים',

  ABOUT_FEATURES_KICKER: 'מה מחכה לכם',
  ABOUT_FEATURES_TITLE: 'כל עולם התורה, בכיס',
  ABOUT_FEATURES_LIST: [
    { icon: 'reels', title: 'רגע של תורה', href: '/feed', big: true,
      text: 'פיד אישי של ציטוטים, גדולי ישראל, חידושים וסרטוני תורה קצרים — גוללים ולומדים.' },
    { icon: 'ask', title: 'רבי־בוט', href: '/ask', big: true,
      text: 'שאלה בהלכה או בתורה? תשובה שכל משפט בה מצוטט ממקור — ונבדק מולו לפני שהיא מוצגת.' },
    { icon: 'sunrise', title: 'סידור ותפילות', href: '/content',
      text: 'שחרית, מנחה וערבית בנוסח עדות המזרח, מותאמים ללוח של היום. תהילים, ברכות ועוד.' },
    { icon: 'calendar', title: 'לימוד יומי', href: '/today',
      text: 'דף יומי, משנה, הלכה, רמב״ם וירושלמי — בקורא נוח עם מעקב רצף.' },
    { icon: 'openbook', title: 'תלמוד בבלי', href: '/study',
      text: 'מאגר ציטוטים מהבבלי, מסודר לפי סדר, מסכת, דף ועמוד.' },
    { icon: 'users', title: 'רבנים וספרים', href: '/rabbis',
      text: 'מאות דמויות לפי הדורות — ציר זמן, מפה וספרי קודש.' },
    { icon: 'play', title: 'חידון קבוצתי', href: '/play',
      text: 'משחק חי לשיעור או לשולחן שבת — כולם עונים מהטלפון.' },
    { icon: 'target', title: 'תרגול', href: '/quiz',
      text: 'חידונים, כרטיסיות בחזרה חכמה וסידור כרונולוגי של הדורות.' },
    { icon: 'pin', title: 'בסביבתך', href: '/minyan',
      text: 'מניין, מקווה וקברי צדיקים קרובים — על מפה, מנתונים פתוחים.' },
    { icon: 'live', title: 'שידור חי', href: '/live',
      text: 'שיעורים בשידור חי מערוצי תורה, צופים בלי לצאת מהאתר.' },
    { icon: 'quill', title: 'סיכומים וחידושים', href: '/sikumim',
      text: 'תיעוד לימוד לפי ספר וחידושי תורה פתוחים לכולם.' },
  ] as AboutFeature[],
  ABOUT_EXTRAS: ['גימטריה', 'ספירת העומר', 'הילולות צדיקים', 'התראות יומיות', 'הקדשות', 'מצב לילה', 'התאמות נגישות'] as string[],

  ABOUT_CREATOR_KICKER: 'מאחורי אורייתא',
  ABOUT_CREATOR_LINE: 'פיתוח, עיצוב ותוכן — מיזם עצמאי שנבנה כדי להנגיש את התורה לכל אחד.',
  ABOUT_CREATOR_CONTACT: 'כתבו לי',
};
