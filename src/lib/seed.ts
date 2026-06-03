import { PrismaClient } from '@prisma/client';
import { getMasechetSeder } from './hebrewData';

const prisma = new PrismaClient();

interface SeedEntry {
  content: string;
  masechet: string;
  daf: string;
  amud: string | null;
}

function parseSeedLine(line: string, masechet: string): SeedEntry | null {
  const trimmed = line.replace(/^-\s*/, '').trim();
  if (!trimmed) return null;

  const dashIdx = trimmed.indexOf(' - ');
  if (dashIdx === -1) return null;

  const locationPart = trimmed.substring(0, dashIdx).trim();
  const content = trimmed.substring(dashIdx + 3).trim();

  const amudMatch = locationPart.match(/^(.+?)\s+עמוד\s+([אב])$/);
  if (amudMatch) {
    return { content, masechet, daf: amudMatch[1].trim(), amud: amudMatch[2] };
  }

  return { content, masechet, daf: locationPart, amud: null };
}

const SEED_DATA: SeedEntry[] = [
  // ברכות
  ...([
    '- ד - תמניא אפין זה מזמור קיט בתהילים (הכי ארוך) כלומר 8 לכל אות באלפא ביתא וסה"כ קע״ו פסוקים',
    '- ד עמוד א - ראויין היו ישראל לעשות להם נס בימי עזרא כמו בימי יהושע בן נון. למה לא נעשה? נשאו נשים נכריות ולכן לא היו ראויים',
    '- ה עמוד א - התורה משולה למכר... יש אדם מוכר והוא עצב אבל ה׳ שמח: "לקח טוב נתתי לכם תורתי אל תעזובו"',
    '- ה - אדם שיכול ללמוד תורה ולא לומד מקבל יסורים מכוערים שעוכרים אותו',
    '- ח - חייב אדם לבקש רחמים אפילו על הכף חול האחרונה ששמים עליו שתבוא בשלום',
    '- ח עמוד א - מיום שחרב בית המקדש אין לו להקב״ה בעולמו אלא ארבע אמות של הלכה',
    '- י״ב עמוד ב - "ולא תתורו אחרי לבבכם" זה מינות, "ואחרי עיניכם" זה זנות',
    '- ט״ז - תאנה מלאה בענפים וזה עץ נמוך כלומר נחשב צנוע/מכסה',
    '- י״ז - כל העולם ניזון בשביל חנינא בני וחנינא בני די לו בכף חרובים',
    '- י״ט עמוד א - קודשא בריך הוא תובע את יקריה (עלבונו)',
    '- כ״ה עמוד א - ערוה בעששית אסור לקרות ק״ש כנגדה',
    '- ל״א עמוד א - אל יפטר אדם מחברו אלא מתוך דברי הלכה',
    '- ל״ד עמוד ב - במקום שבעלי תשובה עומדים צדיקים גמורים אינם עומדים',
    '- ס״א - שועל ודגים: השועל אומר לצאו מהמים - והדגים עונים לו "בחוץ נמות"',
    '- נ - "הרחב פיך ואמלאהו"',
    '- נ״ח עמוד ב - כשם שפרצופיהם שונים כך דעותיהם שונות',
    '- ס״ד עמוד ב - אבישי היה שקול כרובה של סנהדרין',
    '- מ״ג עמוד א - אורחים נוטלים יד אחת בלבד',
    '- מ״ז עמוד ב - לעולם ישכים אדם לבית כנסת כדי שיזכה לעשרה ראשונים',
  ].map((l) => parseSeedLine(l, 'ברכות')).filter(Boolean) as SeedEntry[]),

  // שבת
  ...([
    '- כ״ג - נחשים = סטרא אחרא',
    '- ל״א עמוד א - ענוותנותו של הלל מקרב גרים',
    '- פ״ט עמוד א - משה והכתרים על האותיות (אגדה על מתן תורה)',
    '- נ״ז עמוד ב - כבלא דעבדא = חותם המלך',
  ].map((l) => parseSeedLine(l, 'שבת')).filter(Boolean) as SeedEntry[]),

  // עירובין
  ...([
    '- י״ג - הרודף אחר הכבוד, הכבוד בורח ממנו',
    '- כ״ב עמוד א - היום לעשותם ומחר לקבל שכרם',
    '- ס״ה - נכנס יין יצא סוד',
    '- י״ג עמוד ב - הלכה כבית הלל כי היו מקדימים דברי בית שמאי',
  ].map((l) => parseSeedLine(l, 'עירובין')).filter(Boolean) as SeedEntry[]),

  // פסחים
  ...([
    '- נ״ד עמוד ב - תשובה נבראה לפני העולם',
    '- ס״ו עמוד ב - גאווה גורמת לשכחת חכמה',
    '- פ״ז עמוד ב - רבנות מקברת את בעליה',
  ].map((l) => parseSeedLine(l, 'פסחים')).filter(Boolean) as SeedEntry[]),

  // יומא
  ...([
    '- ט - בית המקדש חרב בגלל שנאת חינם',
    '- י״ט - כהנים שלוחי דרחמנא',
    '- ע״ז עמוד א - תשמיש נקרא עינוי',
    '- פ״ו - תשובה מאהבה הופכת זדונות לזכויות',
  ].map((l) => parseSeedLine(l, 'יומא')).filter(Boolean) as SeedEntry[]),

  // סוכה
  ...([
    '- ה - שכינה לא יורדת מתחת לעשרה טפחים',
    '- נ״ב - הקב״ה שוחט את יצר הרע לעתיד לבוא',
    '- נ״ו עמוד ב - אוי לרשע ואוי לשכנו',
  ].map((l) => parseSeedLine(l, 'סוכה')).filter(Boolean) as SeedEntry[]),

  // ביצה
  ...([
    '- ב עמוד ב - כח דהיתרא עדיף',
  ].map((l) => parseSeedLine(l, 'ביצה')).filter(Boolean) as SeedEntry[]),

  // ראש השנה
  ...([
    '- כ״ח עמוד א - מצוות לאו להנות ניתנו',
  ].map((l) => parseSeedLine(l, 'ראש השנה')).filter(Boolean) as SeedEntry[]),

  // תענית
  ...([
    '- ז - תורה נמשלה למים',
    '- כ״ג עמוד א - נחום איש גמזו וסיפור הייסורים',
  ].map((l) => parseSeedLine(l, 'תענית')).filter(Boolean) as SeedEntry[]),

  // מגילה
  ...([
    '- ג - מה שלא רואה האדם, מזלו רואה',
    '- כ״ח עמוד ב - שמעתתא בעי צילותא',
    '- ל״א עמוד ב - ניצבים לפני ראש השנה כדי להפסיק קללות',
  ].map((l) => parseSeedLine(l, 'מגילה')).filter(Boolean) as SeedEntry[]),

  // מועד קטן
  ...([
    '- ט״ז עמוד ב - "משונה במעשיו" (כמו כושי בעורו)',
    '- כ״ז - אין מרחמים על הנפטר יותר מהקב״ה',
  ].map((l) => parseSeedLine(l, 'מועד קטן')).filter(Boolean) as SeedEntry[]),

  // חגיגה
  ...([
    '- ג - נחשים = סטרא אחרא',
    '- י״א עמוד ב - אין דורשים בעריות בשלושה',
    '- י״ב - מרכבת הקודש (אריה שור נשר אדם)',
    '- ט״ז עמוד א - המסתכל בקשת עיניו קהות',
  ].map((l) => parseSeedLine(l, 'חגיגה')).filter(Boolean) as SeedEntry[]),

  // יבמות
  ...([
    '- ס״ב עמוד ב - יביא ילדים בילדותו ובזקנותו',
    '- ע״ט עמוד א - ישראל רחמנים ביישנים וגומלי חסדים',
    '- קכ״ב עמוד ב - הקב״ה מדקדק עם צדיקים כחוט השערה',
  ].map((l) => parseSeedLine(l, 'יבמות')).filter(Boolean) as SeedEntry[]),

  // כתובות
  ...([
    '- ע״ה - חכם ארץ ישראל שווה לשניים',
    '- קי״ב - החכמים מנשקים אדמת ארץ ישראל',
  ].map((l) => parseSeedLine(l, 'כתובות')).filter(Boolean) as SeedEntry[]),

  // נדרים
  ...([
    '- כ עמוד א - בושת פנים = לא חוטא',
    '- פ״א - חורבן בא על עזיבת התורה',
  ].map((l) => parseSeedLine(l, 'נדרים')).filter(Boolean) as SeedEntry[]),

  // סוטה
  ...([
    '- י״ז - איש ואישה זכו שכינה ביניהם',
    '- מ״ט עמוד ב - פני הדור כפני הכלב',
  ].map((l) => parseSeedLine(l, 'סוטה')).filter(Boolean) as SeedEntry[]),

  // גיטין
  ...([
    '- ז עמוד א - מי שמזונותיו מצומצמים יתן צדקה',
    '- נ״ב - רבי מאיר והשכנים והשלום',
  ].map((l) => parseSeedLine(l, 'גיטין')).filter(Boolean) as SeedEntry[]),

  // קידושין
  ...([
    '- ל״א - גדול המצווה ועושה',
    '- מ״א עמוד א - טב למיתב טן דו',
    '- מ״א עמוד א - שלוחו של אדם כמותו',
  ].map((l) => parseSeedLine(l, 'קידושין')).filter(Boolean) as SeedEntry[]),

  // בבא קמא
  ...([
    '- נ - הקב״ה מדקדק עם חסידיו כחוט השערה',
  ].map((l) => parseSeedLine(l, 'בבא קמא')).filter(Boolean) as SeedEntry[]),

  // בבא מציעא
  ...([
    '- נ״ח - לאברהם היטיב בעבורה',
    '- נ״ט עמוד ב - לא בשמיים היא',
    '- פ״ה - איסתרא בלגינא קיש קיש קריא',
  ].map((l) => parseSeedLine(l, 'בבא מציעא')).filter(Boolean) as SeedEntry[]),

  // בבא בתרא
  ...([
    '- כ״ה עמוד ב - הרוצה שיחכים ידרים',
    '- קנ״ח - אווירה דארץ ישראל מחכים',
  ].map((l) => parseSeedLine(l, 'בבא בתרא')).filter(Boolean) as SeedEntry[]),

  // סנהדרין
  ...([
    '- כ״ז - דיין לא ידון אוהב או שונא',
    '- ע״ט עמוד ב - אדם לעמל יולד',
    '- צ״ט עמוד ב - אפיקורס = "מה אהנו רבנן"',
  ].map((l) => parseSeedLine(l, 'סנהדרין')).filter(Boolean) as SeedEntry[]),

  // מכות
  ...([
    '- י עמוד ב - בדרך שאדם רוצה לילך מוליכין אותו',
  ].map((l) => parseSeedLine(l, 'מכות')).filter(Boolean) as SeedEntry[]),

  // עבודה זרה
  ...([
    '- ג עמוד א - מי שטרח בערב שבת יאכל בשבת',
  ].map((l) => parseSeedLine(l, 'עבודה זרה')).filter(Boolean) as SeedEntry[]),

  // זבחים
  ...([
    '- קט״ז עמוד א - מה שמע יתרו? קריעת ים סוף / עמלק / מתן תורה',
  ].map((l) => parseSeedLine(l, 'זבחים')).filter(Boolean) as SeedEntry[]),

  // מנחות
  ...([
    '- כ״ט - רבי עקיבא: על כל קוץ וקוץ תילין הלכות',
    '- מ״ג עמוד ב - תכלת = חותם המלך',
  ].map((l) => parseSeedLine(l, 'מנחות')).filter(Boolean) as SeedEntry[]),

  // חולין
  ...([
    '- ז - אין אדם נוקף אצבע מלמטה אלא אם כן נגזר מלמעלה',
    '- צ״ד עמוד א - אסור לגנוב דעת גוי',
  ].map((l) => parseSeedLine(l, 'חולין')).filter(Boolean) as SeedEntry[]),
];

async function main() {
  console.log('Seeding database...');

  const existing = await prisma.citation.count();
  if (existing > 0) {
    console.log('Database already has data, skipping seed.');
    return;
  }

  for (const entry of SEED_DATA) {
    const seder = getMasechetSeder(entry.masechet);
    await prisma.citation.create({
      data: {
        content: entry.content,
        locations: {
          create: {
            masechet: entry.masechet,
            seder,
            daf: entry.daf,
            amud: entry.amud,
          },
        },
      },
    });
  }

  console.log(`Seeded ${SEED_DATA.length} citations.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
