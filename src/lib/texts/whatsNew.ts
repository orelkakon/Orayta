/* "חדש באורייתא" one-time announcement — spread into HE (src/lib/hebrewTexts.ts). */
export const WHATS_NEW_HE = {
  WN_EYEBROW: 'חדש באורייתא',
  WN_CLOSE: 'סגירה',
  WN_LATER: 'אולי אחר כך',

  /* Current announcement: רבי־בוט */
  WN_RB_TITLE: 'הכירו את רבי־בוט',
  WN_RB_LEAD: 'שואלים שאלה בהלכה או בתורה — ומקבלים תשובה שכל מילה בה נשענת על מקור אמיתי.',
  WN_RB_DEMO_Q: 'מי אמר "אם אין אני לי, מי לי"?',
  WN_RB_DEMO_A: 'הלל הזקן — כך שנינו במשנה.',
  WN_RB_DEMO_SRC: 'משנה, אבות א, יד',
  WN_RB_DEMO_VERIFIED: 'הציטוט אומת מול המקור',
  WN_RB_POINTS: [
    { icon: 'check', title: 'רק ממקורות מאומתים', text: 'כל ציטוט נבדק מול הטקסט המקורי לפני שהוא מוצג. מה שלא נמצא — לא נכתב.' },
    { icon: 'books', title: 'הלכה ותורה במקום אחד', text: 'שולחן ערוך, כף החיים, בן איש חי, משנה ברורה, תנ״ך, משנה, גמרא — וגם הסיכומים באתר.' },
    { icon: 'ask', title: 'תמיד בהישג יד', text: 'הכפתור של רבי־בוט מחכה בפינת כל מסך.' },
  ] as { icon: string; title: string; text: string }[],
  WN_RB_NOTE: 'רבי־בוט אינו פוסק הלכה. בשאלה אישית — פנו לרב.',
  WN_RB_CTA: 'לשאול את רבי־בוט',
};
