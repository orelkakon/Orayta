/* Home screen — spread into HE (src/lib/hebrewTexts.ts). */
export const HOME_HE = {
  HOME_GREETING_DAWN: 'לילה טוב',
  HOME_GREETING_MORNING: 'בוקר טוב',
  HOME_GREETING_NOON: 'צהריים טובים',
  HOME_GREETING_EVENING: 'ערב טוב',
  HOME_GREETING_NIGHT: 'לילה טוב',
  HOME_TODAY_ARIA: 'היום בלוח העברי',
  HOME_PARASHA: (name: string) => `פרשת ${name}`,
  HOME_SUNRISE_AT: (t: string) => `הנץ ${t}`,
  HOME_SUNSET_AT: (t: string) => `שקיעה ${t}`,
  HOME_SUN_PLACE: 'ירושלים',
  HOME_NOW_PRAY: (service: string) => `עכשיו: ${service}`,
  HOME_NOW_SERVICE: { shacharit: 'שחרית', mincha: 'מנחה', arvit: 'ערבית' } as Record<string, string>,
  HOME_TODAY_CTA: 'הלימוד היומי',

  HOME_FEED_TITLE: 'רגע של תורה',
  HOME_FEED_SUB: 'מנות קצרות של לימוד — לגלול, להתחזק, לשתף',
  HOME_FEED_ALL: 'לפיד המלא',
  HOME_FEED_CONTINUE: 'להמשיך לגלול',
  HOME_FEED_CONTINUE_SUB: 'עוד מאות פריטים מחכים',
  HOME_FEED_ITEM_ARIA: (label: string) => `${label} — פתיחה ברגע של תורה`,
  HOME_FEED_BOOK_BY: (author: string) => `מאת ${author}`,
  HOME_FEED_GEMATRIA: (value: number) => `${value} בגימטריה`,
  HOME_FEED_DAF: (masechet: string, daf: string, amud: string | null) =>
    `${masechet} · דף ${daf}${amud ? ` ${amud}` : ''}`,

  HOME_QUICK_TITLE: 'גישה מהירה',
  HOME_QUICK: [
    { href: '/siddur', icon: 'sunrise', label: 'סידור' },
    { href: '/content?open=birkhat-hamazon', icon: 'bread', label: 'ברכת המזון' },
    { href: '/content?open=tehillim', icon: 'scroll', label: 'תהילים' },
    { href: '/ask', icon: 'ask', label: 'רבי־בוט' },
    { href: '/study', icon: 'openbook', label: 'תלמוד' },
    { href: '/rabbis', icon: 'users', label: 'רבנים' },
    { href: '/sikumim', icon: 'pencil', label: 'סיכומים' },
    { href: '/quiz', icon: 'target', label: 'תרגול' },
  ] as { href: string; icon: string; label: string }[],

  HOME_LEARN_TITLE: 'הלימוד של היום',
  HOME_LEARN_ALL: 'לוח יומי',
  HOME_LEARN_PROGRESS: (done: number, total: number) => `${done} מתוך ${total} הושלמו`,

  HOME_LIVE_NOW: 'בשידור חי עכשיו',

  HOME_DEDICATE_TITLE: 'הקדישו את הלימוד',
  HOME_DEDICATE_SUB: 'לעילוי נשמה, לרפואה, להצלחה או לזיווג — ההקדשה תופיע באתר',
  HOME_DEDICATE_CTA: 'להקדשה',

  /* Chanukah menorah in the home hero */
  CHANUKAH_KICKER: 'חנוכה',
  CHANUKAH_KICKER_LIT: 'חנוכה שמח',
  CHANUKAH_ORDINALS: ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שביעי', 'שמיני'],
  CHANUKAH_LIT: (ord: string) => `נר ${ord} של חנוכה`,
  CHANUKAH_LIT_SUB: 'הנרות הללו קודש הם',
  CHANUKAH_ZOT: 'זאת חנוכה',
  CHANUKAH_WHEN: {
    tonight: (ord: string) => `הערב מדליקים נר ${ord}`,
    'before-shabbat': (ord: string) => `היום מדליקים נר ${ord}`,
    motzash: (ord: string) => `במוצאי שבת מדליקים נר ${ord}`,
  },
  CHANUKAH_BEFORE_SHABBAT: 'לפני הדלקת נרות שבת',

  /* Shabbat candles + times in the home hero (Friday until Shabbat ends) */
  SHABBAT_KICKER_EREV: 'ערב שבת קודש',
  SHABBAT_KICKER: 'שבת קודש',
  SHABBAT_GREETING: 'שבת שלום ומבורך',
  SHABBAT_COUNTDOWN: (h: number, m: number) => {
    const hours = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`;
    const mins = m === 1 ? 'דקה' : `${m} דק׳`;
    if (h === 0) return `הדלקת נרות בעוד ${mins}`;
    return m === 0 ? `הדלקת נרות בעוד ${hours}` : `הדלקת נרות בעוד ${hours} ו־${mins}`;
  },
  SHABBAT_CANDLES: 'הדלקת נרות',
  SHABBAT_ENDS: 'צאת השבת',
  SHABBAT_RT: 'ר״ת',
  SHABBAT_TIMES_ARIA: 'זמני השבת בירושלים',
};
