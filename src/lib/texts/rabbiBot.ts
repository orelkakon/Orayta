/* רבי־בוט — answer extras, sharing, history and the admin's knowledge gaps. Spread into HE (src/lib/hebrewTexts.ts). */
export const RABBI_BOT_HE = {
  RB_UNDERSTOOD: 'הבנתי שהשאלה היא:',
  RB_BY_RULE_TITLE: 'אין מקור שעוסק במקרה הזה במפורש',
  RB_BY_RULE_TEXT: 'התשובה נלמדת מכלל הלכתי או ממקרה דומה שבמקורות. כדאי לוודא עם רב.',
  RB_RULE_BADGE: 'נלמד מכלל או ממקרה דומה',
  RB_RULE_TAG: 'מסקנה מכלל הלכתי',
  RB_RULE_HINT: 'אין מקור שעוסק במקרה הזה במפורש — המסקנה נלמדת מכלל או ממקרה דומה במקורות המצוטטים',

  RB_SHARE: 'שיתוף',
  RB_COPY: 'העתקה',
  RB_COPIED: 'הועתק',
  RB_SHARE_Q: (q: string) => `❓ ${q}`,
  RB_SHARE_RULE: '(אין מקור מפורש למקרה — נלמד מכלל הלכתי)',
  RB_SHARE_SOURCES: 'מקורות:',
  RB_SHARE_SIG: '— רבי־בוט באורייתא · אינו תחליף לשאלת רב',

  RB_HISTORY_TITLE: 'השאלות האחרונות שלך',
  RB_HISTORY_CLEAR: 'ניקוי',
  RB_HISTORY_OPEN: (q: string) => `פתיחת התשובה לשאלה: ${q}`,
  RB_HISTORY_STATUS: {
    answered: 'נענתה', not_found: 'לא נמצא מקור', sensitive: 'לשאול רב', other: 'לא בתחום',
  } as Record<string, string>,

  RB_ADMIN_GAPS: 'פערי ידע — שאלות שלא נמצא להן מקור',
  RB_ADMIN_GAPS_SUB: (n: number) => `${n.toLocaleString('he-IL')} ב-10 הימים האחרונים. סיכום בנושא באתר יאפשר לבוט לענות עליהן.`,
  RB_ADMIN_GAPS_BOOKS: 'חיפשנו ב:',
  RB_ADMIN_GAPS_WRITE: 'לכתיבת סיכום',
};
