import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const RABBIS = [
  // ─── זוגות ───
  { name: 'יוסי בן יועזר', fullName: null, sortYear: -160, datePeriod: '~160 לפנה״ס', isAlive: false, bio: 'חי בארץ ישראל. כהן ונשיא.', category: 'zugot' },
  { name: 'יוסי בן יוחנן', fullName: null, sortYear: -150, datePeriod: '~150 לפנה״ס', isAlive: false, bio: 'חי בירושלים. אב בית דין.', category: 'zugot' },
  { name: 'יהושע בן פרחיה', fullName: null, sortYear: -175, datePeriod: 'המאה ה-2 לפנה״ס', isAlive: false, bio: 'נשיא ואב בית דין.', category: 'zugot' },
  { name: 'נתאי הארבלי', fullName: null, sortYear: -174, datePeriod: 'המאה ה-2 לפנה״ס', isAlive: false, bio: 'נשיא.', category: 'zugot' },
  { name: 'יהודה בן טבאי', fullName: null, sortYear: -75, datePeriod: 'המאה ה-1 לפנה״ס', isAlive: false, bio: 'נשיא. (מחלוקת)', category: 'zugot' },
  { name: 'שמעון בן שטח', fullName: null, sortYear: -74, datePeriod: 'המאה ה-1 לפנה״ס', isAlive: false, bio: 'אב בית דין. (מחלוקת)', category: 'zugot' },
  { name: 'שמעיה', fullName: null, sortYear: -73, datePeriod: 'המאה ה-1 לפנה״ס', isAlive: false, bio: 'נשיא. גר ומשושלת סנחריב.', category: 'zugot' },
  { name: 'אבטליון', fullName: null, sortYear: -72, datePeriod: 'המאה ה-1 לפנה״ס', isAlive: false, bio: 'אב בית דין. גר ומשושלת סנחריב.', category: 'zugot' },
  { name: 'הלל', fullName: null, sortYear: -113, datePeriod: '113 לפנה״ס – 8 לספירה', isAlive: false, bio: 'חי בארץ ישראל. מייסד בית הלל. תלמיד של שמעיה ואבטליון. דור חמישי.', category: 'zugot' },
  { name: 'שמאי', fullName: null, sortYear: -50, datePeriod: '50 לפנה״ס – 30 לספירה', isAlive: false, bio: 'חי בארץ ישראל. מייסד בית שמאי. זוגו של הלל ונחשב לקפדן מביניהם. דור חמישי.', category: 'zugot' },

  // ─── תנאים ───
  { name: 'עקביא בן מהללאל', fullName: null, sortYear: -100, datePeriod: '100 לפנה״ס – 1 לספירה', isAlive: false, bio: 'חי בארץ ישראל. דור חמישי.', category: 'tannaim' },
  { name: 'רבן גמליאל הזקן', fullName: null, sortYear: 1, datePeriod: '1–100 לספירה', isAlive: false, bio: 'חי בארץ ישראל. נכד להלל הזקן. דור ראשון.', category: 'tannaim' },
  { name: 'ריב״ז', fullName: 'רבן יוחנן בן זכאי', sortYear: 2, datePeriod: '1–120 לספירה', isAlive: false, bio: 'חי בארץ ישראל. נשיא הסנהדרין ותלמידו של הלל הזקן.', category: 'tannaim' },
  { name: 'רבי טרפון', fullName: null, sortYear: 3, datePeriod: '1–100 לספירה', isAlive: false, bio: 'חי בארץ ישראל. עשיר, כהן ומבית שמאי.', category: 'tannaim' },
  { name: 'רבי אלעזר בן ערך', fullName: 'רבי נהוראי', sortYear: 4, datePeriod: '1–100 לספירה', isAlive: false, bio: 'חי בארץ ישראל. גדול תלמידי ריב״ז. מסופר שאיבד כל תלמודו עד שהתפללו שישוב עבורו. דור שני.', category: 'tannaim' },
  { name: 'רבי אליעזר בן הורקנוס', fullName: null, sortYear: 100, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. תלמידו של ריב״ז. ״בור סוד שאינו מאבד טיפה״. דור שני.', category: 'tannaim' },
  { name: 'רבי שמעון בן נתנאל', fullName: null, sortYear: 101, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. תלמידו של ריב״ז. ״ירא חטא״. דור שני.', category: 'tannaim' },
  { name: 'רבי יוסי הכהן', fullName: null, sortYear: 102, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. תלמידו של ריב״ז. ״חסיד״. דור שני.', category: 'tannaim' },
  { name: 'רבי יהושע בן חנניה', fullName: null, sortYear: 103, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. תלמידו של ריב״ז. ״אשרי יולדתו״. דור שני.', category: 'tannaim' },
  { name: 'רבן גמליאל דיבנה', fullName: null, sortYear: 5, datePeriod: '1–125 לספירה', isAlive: false, bio: 'חי בארץ ישראל. נשיא סנהדרין וסבו של רבי יהודה הנשיא. דור שני.', category: 'tannaim' },
  { name: 'רבי עקיבא', fullName: 'רבי עקיבא בן יוסף', sortYear: 16, datePeriod: '16–132 לספירה', isAlive: false, bio: 'חי בארץ ישראל. אחד מעשרה הרוגי מלכות. דור שלישי.', category: 'tannaim' },
  { name: 'רבי מאיר בעל הנס', fullName: null, sortYear: 110, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. גר מנירון קיסר. דור רביעי.', category: 'tannaim' },
  { name: 'רבי שמעון בר יוחאי', fullName: null, sortYear: 111, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. כתב את הזוהר. דור רביעי.', category: 'tannaim' },
  { name: 'רבי יהודה בר אילעי', fullName: null, sortYear: 112, datePeriod: '100–200 לספירה', isAlive: false, bio: 'חי בארץ ישראל. מופיע במשנה הכי הרבה. דור רביעי.', category: 'tannaim' },
  { name: 'רבי יוסי', fullName: 'רבי יוסי בן חלפתא', sortYear: 113, datePeriod: '100–160 לספירה', isAlive: false, bio: 'חי בארץ ישראל. דור רביעי.', category: 'tannaim' },
  { name: 'רבי', fullName: 'רבי יהודה הנשיא', sortYear: 122, datePeriod: '122–225 לספירה', isAlive: false, bio: 'חי בארץ ישראל. עורך המשנה, נשיא הסנהדרין.', category: 'tannaim' },

  // ─── אמוראים ───
  { name: 'רבי יוחנן', fullName: 'בר נפחא', sortYear: 180, datePeriod: '180–279 לספירה', isAlive: false, bio: 'חי בארץ ישראל. ראש ישיבת טבריה. דור ראשון.', category: 'amoraim' },
  { name: 'רבי ינאי', fullName: null, sortYear: 200, datePeriod: 'המאה ה-3', isAlive: false, bio: 'חי בארץ ישראל. ייסד את בית המדרש בעכברה. דור ראשון.', category: 'amoraim' },
  { name: 'רבי אושעיא בר חמא', fullName: null, sortYear: 201, datePeriod: 'המאה ה-3', isAlive: false, bio: 'חי בארץ ישראל. כהן, תלמידו של רבי חייא, מכונה אבי המשנה. דור ראשון.', category: 'amoraim' },
  { name: 'רבי חלבו', fullName: null, sortYear: 300, datePeriod: 'המאה ה-3–4', isAlive: false, bio: 'חי בבבל ועלה לארץ ישראל. עקר ללא ילדים. דור שלישי.', category: 'amoraim' },
  { name: 'רבה', fullName: 'רבה בר נחמני', sortYear: 280, datePeriod: '280–320 לספירה', isAlive: false, bio: 'חי בבבל. ראש ישיבת פומבדיתא. חברו של רב יוסף. דור שלישי.', category: 'amoraim' },
  { name: 'אביי', fullName: 'נחמני', sortYear: 281, datePeriod: '280–330 לספירה', isAlive: false, bio: 'חי בבבל. ראש ישיבת פומבדיתא. חברו של רבא. דור רביעי.', category: 'amoraim' },
  { name: 'רבא', fullName: null, sortYear: 278, datePeriod: '278–352 לספירה', isAlive: false, bio: 'חי בבבל. ראש ישיבת פומבדיתא. דור רביעי.', category: 'amoraim' },

  // ─── גאונים ───
  { name: 'רב סעדיה', fullName: 'רב סעדיה בן יוסף אלפיומי', sortYear: 882, datePeriod: '882–942', isAlive: false, bio: 'חי בבבל. ראש ישיבת סורא.', category: 'geonim' },
  { name: 'רב שרירא', fullName: null, sortYear: 906, datePeriod: '906–1006', isAlive: false, bio: 'חי בבבל. ראש ישיבת פומבדיתא. כתב את אגרת רב שרירא.', category: 'geonim' },
  { name: 'רב האי', fullName: null, sortYear: 939, datePeriod: '939–1038', isAlive: false, bio: 'חי בבבל. ראש ישיבת פומבדיתא. בנו של רב שרירא.', category: 'geonim' },

  // ─── ראשונים ───
  { name: 'הרי״ף', fullName: 'רבי יצחק אלפסי', sortYear: 1013, datePeriod: '1013–1103', isAlive: false, bio: 'חי במרוקו. אחד משלושה עמודי הוראה. כתב את הלכות רב אלפס.', category: 'rishonim' },
  { name: 'רש״י', fullName: 'רבי שלמה יצחקי', sortYear: 1040, datePeriod: '1040–1105', isAlive: false, bio: 'חי בצרפת. גדול פרשני המקרא והתלמוד.', category: 'rishonim' },
  { name: 'רבנו בחיי', fullName: 'רבי בן יוסף אבן פקודה', sortYear: 1050, datePeriod: '1050–1120', isAlive: false, bio: 'חי בספרד. כתב את הספר חובת הלבבות.', category: 'rishonim' },
  { name: 'רשב״ם', fullName: 'רבי שמואל בן מאיר', sortYear: 1080, datePeriod: '1080–1160', isAlive: false, bio: 'חי בצרפת. נכדו של רש״י. אחד מבעלי התוספות.', category: 'rishonim' },
  { name: 'רבנו תם', fullName: 'רבי יעקב בן מאיר', sortYear: 1110, datePeriod: '1110–1171', isAlive: false, bio: 'חי בצרפת. נכדו של רש״י. אחד מבעלי התוספות.', category: 'rishonim' },
  { name: 'ר״י הזקן', fullName: 'רבי יצחק בן שמואל', sortYear: 1115, datePeriod: '1115–1190', isAlive: false, bio: 'חי בצרפת. אחד מבעלי התוספות.', category: 'rishonim' },
  { name: 'הרמב״ם', fullName: 'רבי משה בן מימון', sortYear: 1138, datePeriod: '1138–1204', isAlive: false, bio: 'נולד בספרד ועבר למצרים. אחד משלושה עמודי הוראה. כתב את משנה תורה / היד החזקה, מורה נבוכים.', category: 'rishonim' },
  { name: 'הרמב״ן', fullName: 'רבי משה בן נחמן', sortYear: 1194, datePeriod: '1194–1270', isAlive: false, bio: 'חי בספרד. כתב את אגרת הרמב״ן.', category: 'rishonim' },
  { name: 'רשב״א', fullName: 'רבי שלמה בן אברהם אבן אדרת', sortYear: 1220, datePeriod: '1220–1310', isAlive: false, bio: 'חי בספרד. כתב את שו״ת הרשב״א.', category: 'rishonim' },
  { name: 'ריטב״א', fullName: 'רבי יום טוב בן אברהם אשבילי', sortYear: 1250, datePeriod: '1250–1330', isAlive: false, bio: 'חי בספרד. כתב את חידושי הריטב״א.', category: 'rishonim' },
  { name: 'רא״ש', fullName: 'רבי אשר בן יחיאל', sortYear: 1251, datePeriod: '1250–1327', isAlive: false, bio: 'נולד בגרמניה ועבר לספרד. אחד משלושה עמודי הוראה. כתב את פסקי הרא״ש.', category: 'rishonim' },
  { name: 'בעל הטורים', fullName: 'רבי יעקב בן אשר', sortYear: 1269, datePeriod: '1269–1343', isAlive: false, bio: 'בנו של הרא״ש. נולד בגרמניה ועבר לספרד. כתב את ארבעת הטורים.', category: 'rishonim' },

  // ─── אחרונים ───
  { name: 'רדב״ז', fullName: 'רבי דוד שלמה אבן זמרא', sortYear: 1479, datePeriod: '1479–1573', isAlive: false, bio: 'חי במצרים. היה מנהיג יהדות מצרים.', category: 'acharonim' },
  { name: 'השולחן ערוך', fullName: 'רבי יוסף קארו (מרן)', sortYear: 1484, datePeriod: '1484–1575', isAlive: false, bio: 'חי בספרד. כתב את השולחן ערוך, בית יוסף.', category: 'acharonim' },
  { name: 'המהר״ל מפראג', fullName: 'רבי יהודה ליווא בן בצלאל', sortYear: 1522, datePeriod: '1522–1609', isAlive: false, bio: 'חי בצכ׳יה. יצר את הגולם.', category: 'acharonim' },
  { name: 'הרמ״א', fullName: 'רבי משה איסרליש', sortYear: 1530, datePeriod: '1530–1572', isAlive: false, bio: 'חי בפולין. כתב את המפה על השולחן ערוך.', category: 'acharonim' },
  { name: 'האר״י', fullName: 'רבי יצחק לוריא אשכנזי', sortYear: 1534, datePeriod: '1534–1572', isAlive: false, bio: 'חי בישראל. גדול המקובלים בדורו.', category: 'acharonim' },
  { name: 'רבי חיים ויטאל', fullName: null, sortYear: 1542, datePeriod: '1542–1620', isAlive: false, bio: 'חי בישראל. תלמידו המובהק של האר״י. מכונה גם המהרח״ו.', category: 'acharonim' },
  { name: 'הכלי יקר', fullName: 'רבי שלמה אפרים מלונטשיץ', sortYear: 1550, datePeriod: '1550–1619', isAlive: false, bio: 'חי בצכיה. כתב את הכלי יקר פירושו לתורה.', category: 'acharonim' },
  { name: 'המהרש״א', fullName: 'רבי שמואל אליעזר הלוי איידלס', sortYear: 1555, datePeriod: '1555–1631', isAlive: false, bio: 'חי בפולין. חיבר חידושי הלכות על התלמוד.', category: 'acharonim' },
  { name: 'השל״ה הקדוש', fullName: 'רבי ישעיה הלוי הורביץ', sortYear: 1558, datePeriod: '1558–1630', isAlive: false, bio: 'חי בארץ ישראל. כתב את שני לוחות הברית – של״ה ועל כן שמו.', category: 'acharonim' },
  { name: 'הב״ח', fullName: 'רבי יואל סירקיש', sortYear: 1561, datePeriod: '1561–1640', isAlive: false, bio: 'חי בפולין. כתב את הבית חדש.', category: 'acharonim' },
  { name: 'הט״ז', fullName: 'רבי דוד הלוי סגל', sortYear: 1586, datePeriod: '1586–1667', isAlive: false, bio: 'חי בפולין. כתב את טורי זהב.', category: 'acharonim' },
  { name: 'פרי חדש', fullName: 'רבי חזקיה די סילוה', sortYear: 1656, datePeriod: '1656–1695', isAlive: false, bio: 'חי בארץ ישראל. כתב את הפרי חדש.', category: 'acharonim' },
  { name: 'אור החיים', fullName: 'רבי חיים בן עטר', sortYear: 1696, datePeriod: '1696–1743', isAlive: false, bio: 'חי במרוקו. כתב את אור החיים.', category: 'acharonim' },
  { name: 'הרמח״ל', fullName: 'רבי משה חיים לוצאטו', sortYear: 1707, datePeriod: '1707–1746', isAlive: false, bio: 'חי בהולנד וישראל. כתב את מסילת ישרים.', category: 'acharonim' },
  { name: 'הנודע ביהודה', fullName: 'רבי יחזקאל לנדא', sortYear: 1713, datePeriod: '1713–1793', isAlive: false, bio: 'חי בפראג. כתב את ספר שו״ת נודע ביהודה.', category: 'acharonim' },
  { name: 'הרש״ש', fullName: 'רבי שלום שרעבי', sortYear: 1720, datePeriod: '1720–1777', isAlive: false, bio: 'חי בתימן וישראל. כתב את סידור כוונות הרש״ש.', category: 'acharonim' },
  { name: 'הגאון מווילנה', fullName: 'רבי אליהו בן שלמה זלמן', sortYear: 1721, datePeriod: '1720–1797', isAlive: false, bio: 'חי בליטא. התנגד לחסידיויות.', category: 'acharonim' },
  { name: 'חיד״א', fullName: 'רבי חיים יוסף דוד אזולאי', sortYear: 1724, datePeriod: '1724–1806', isAlive: false, bio: 'חי בארץ ישראל. פוסק, דיין, שד״ר ומקובל.', category: 'acharonim' },
  { name: 'פרי מגדים', fullName: 'רבי יוסף בן מאיר תאומים', sortYear: 1727, datePeriod: '1727–1792', isAlive: false, bio: 'חי בגרמניה. כתב את הפרי מגדים על השולחן ערוך.', category: 'acharonim' },
  { name: 'חיים מוולוז׳ין', fullName: 'רבי חיים איצקוביץ', sortYear: 1749, datePeriod: '1749–1821', isAlive: false, bio: 'חי ברוסיה.', category: 'acharonim' },
  { name: 'החתם סופר', fullName: 'הרב משה סופר שרייבר', sortYear: 1762, datePeriod: '1762–1839', isAlive: false, bio: 'חי בהונגריה. כתב את חידושי החתם סופר.', category: 'acharonim' },
  { name: 'הנצי׳ב', fullName: 'רבי נפתלי צבי יהודה ברלין', sortYear: 1816, datePeriod: '1816–1893', isAlive: false, bio: 'חי בפולין. היה ראש ישיבת וולוז׳ין.', category: 'acharonim' },
  { name: 'פרי צדיק', fullName: 'רבי צדוק הכהן מלובלין', sortYear: 1823, datePeriod: '1823–1900', isAlive: false, bio: 'חי בפולין.', category: 'acharonim' },
  { name: 'הבן איש חי', fullName: 'רבי יוסף חיים מבגדאד', sortYear: 1835, datePeriod: '1835–1909', isAlive: false, bio: 'חי בעיראק. כתב את הבן איש חי.', category: 'acharonim' },
  { name: 'חפץ חיים', fullName: 'רבי ישראל מאיר הכהן', sortYear: 1839, datePeriod: '1839–1933', isAlive: false, bio: 'חי בפולין. כתב את המשנה ברורה, שמירת הלשון וחפץ חיים.', category: 'acharonim' },
  { name: 'רב חיים מבריסק', fullName: 'רבי חיים הלוי סולובייצ׳יק', sortYear: 1853, datePeriod: '1853–1918', isAlive: false, bio: 'חי בפולין.', category: 'acharonim' },
  { name: 'חזון איש', fullName: 'רבי אברהם ישעיהו קרליץ', sortYear: 1878, datePeriod: '1878–1953', isAlive: false, bio: 'חי בארץ ישראל ועלה מבלארוס. כתב את החזון איש.', category: 'acharonim' },

  // ─── חסידים ───
  { name: 'הבעל שם טוב', fullName: 'רבי ישראל בן אליעזר', sortYear: 1690, datePeriod: '1690–1745', isAlive: false, bio: 'חי באוקראינה. מייסד תנועת החסידות.', category: 'hasidim' },
  { name: 'המגיד ממזירטש', fullName: 'רבי דב בער', sortYear: 1691, datePeriod: '1690–1772', isAlive: false, bio: 'חי בליטא. תלמידו של הבעל שם טוב.', category: 'hasidim' },
  { name: 'אלימלך מליז׳נסק', fullName: 'רבי אלימלך וייסבלום', sortYear: 1717, datePeriod: '1717–1787', isAlive: false, bio: 'חי בליטא. כתב את הספר נועם אלימלך.', category: 'hasidim' },
  { name: 'המגיד מקוז׳ניץ', fullName: 'רבי ישראל הופשטיין', sortYear: 1733, datePeriod: '1733–1814', isAlive: false, bio: 'חי בפולין. מייסד תנועת קוזניץ. כתב את עבודת ישראל.', category: 'hasidim' },
  { name: 'רב אהרלה מקרלין', fullName: 'רבי אהרון הגדול מקרלין', sortYear: 1736, datePeriod: '1736–1772', isAlive: false, bio: 'חי בליטא.', category: 'hasidim' },
  { name: 'מנחם מנדל מרימנוב', fullName: null, sortYear: 1745, datePeriod: '1745–1815', isAlive: false, bio: 'חי בפולין. אחד ממפיצי החסידות.', category: 'hasidim' },
  { name: 'חוזה מלובלין', fullName: 'רבי יעקב יצחק הורביץ', sortYear: 1746, datePeriod: '1745–1815', isAlive: false, bio: 'חי בפולין. בעל ראייה רוחנית ולכן חוזה.', category: 'hasidim' },
  { name: 'בעל התניא', fullName: 'רבי שניאור זלמן מלאדי', sortYear: 1747, datePeriod: '1745–1812', isAlive: false, bio: 'חי בליטא. מייסד תנועת חב״ד וכתב את ליקוטי אמרים.', category: 'hasidim' },
  { name: 'שמחה בונים', fullName: 'רבי שמחה בונם מפשיסחה', sortYear: 1765, datePeriod: '1765–1827', isAlive: false, bio: 'חי בפולין. אחיו של אלימלך מליז׳נסק. כתב את ארץ צבי ומעשרה למאה.', category: 'hasidim' },
  { name: 'רבי נחמן מברסלב', fullName: null, sortYear: 1772, datePeriod: '1772–1810', isAlive: false, bio: 'חי בפולין. מייסד חסידות ברסלב. נין של הבעש״ט. כתב את ליקוטי מוהר״ן, ספר המידות וסיפורי מעשיות.', category: 'hasidim' },
  { name: 'רבי נתן', fullName: 'רבי נתן מנמירוב', sortYear: 1780, datePeriod: '1780–1844', isAlive: false, bio: 'חי בפולין. תלמידו המובהק של רבי נחמן.', category: 'hasidim' },
  { name: 'בני יששכר', fullName: 'רבי צבי אלימלך שפירא מדינוב', sortYear: 1783, datePeriod: '1783–1843', isAlive: false, bio: 'חי בפולין. כתב את הבני יששכר.', category: 'hasidim' },
  { name: 'מנחם מנדל מקוצק', fullName: 'רבי מנחם מנדל מורגנשטרן', sortYear: 1787, datePeriod: '1787–1859', isAlive: false, bio: 'חי ברוסיה. מייסד חסידות קוצק.', category: 'hasidim' },
  { name: 'חידושי הרים', fullName: 'רבי יצחק מאיר אלתר רוטנברג', sortYear: 1799, datePeriod: '1799–1866', isAlive: false, bio: 'חי בפולין. מייסד תנועת גור. כתב את הספר חידושי הרים.', category: 'hasidim' },
  { name: 'האדמו״ר מזוועהיל', fullName: 'רבי שלמה גולדמן', sortYear: 1869, datePeriod: '1869–1945', isAlive: false, bio: 'חי באוקראינה ועלה לארץ ישראל. האדמו״ר הרביעי של זוועהיל ומקים החסידות בארץ.', category: 'hasidim' },

  // ─── אבוחצירא ───
  { name: 'אביר יעקב', fullName: 'רבי יעקב אבוחצירא', sortYear: 1806, datePeriod: '1806–1880', isAlive: false, bio: 'חי במרוקו. מאבות משפחת אבוחצירא. בעל מופת ונחשב שזכה לגילוי אליהו הנביא. חיבר את פיתוחי חותם, מחשוף הלבן ועוד.', category: 'abuchatzira' },
  { name: 'רבי מסעוד', fullName: 'רבי מסעוד אבוחצירא', sortYear: 1828, datePeriod: '1828–1908', isAlive: false, bio: 'חי במרוקו. ראש ישיבת ריסאני.', category: 'abuchatzira' },
  { name: 'רבי יצחק', fullName: 'רבי יצחק אבוחצירא הראשון', sortYear: 1860, datePeriod: '1860–1912', isAlive: false, bio: 'חי במרוקו. מחבר הפיוט אעופה אשכונה.', category: 'abuchatzira' },
  { name: 'רבי דוד', fullName: 'רבי דוד אבוחצירא', sortYear: 1866, datePeriod: '1866–1919', isAlive: false, bio: 'חי במרוקו. היה מכונה עטרת ראשנו. הוצא להורג על ידי הערבים במרוקו בכך שנורה מתותח.', category: 'abuchatzira' },
  { name: 'באבא סאלי', fullName: 'רבי ישראל אבוחצירא', sortYear: 1889, datePeriod: '1889–1984', isAlive: false, bio: 'חי במרוקו וישראל. נודע בגדולתו כמחולל ניסים בעקבות היותו דובר אמת וכל ברכותיו מתקבלות.', category: 'abuchatzira' },
  { name: 'באבא חאקי', fullName: 'רבי יצחק אבוחצירא השני', sortYear: 1895, datePeriod: '1895–1970', isAlive: false, bio: 'חי במרוקו וישראל. היה רב העיר רמלה. נהרג בתאונת דרכים.', category: 'abuchatzira' },
  { name: 'באבא מאיר', fullName: 'רבי מאיר אבוחצירא', sortYear: 1917, datePeriod: '1917–1963', isAlive: false, bio: 'חי בישראל. ראש ישיבה, מקובל ושומר עיניים.', category: 'abuchatzira' },
  { name: 'בבא ברוך', fullName: 'רבי ברוך אבוחצירא', sortYear: 1941, datePeriod: '1941 – היום', isAlive: true, bio: 'חי בישראל. ממשיך דרכו של אביו.', category: 'abuchatzira' },
  { name: 'רבי יחיאל', fullName: 'רבי יחיאל אבוחצירא', sortYear: 1944, datePeriod: '1944 – היום', isAlive: true, bio: 'חי בישראל. רבה של העיר רמלה.', category: 'abuchatzira' },
  { name: 'בבא אלעזר', fullName: 'רבי אלעזר אבוחצירא', sortYear: 1948, datePeriod: '1948–2011', isAlive: false, bio: 'חי בישראל. בעל מופת ומקובל. נרצח על ידי אחד מאנשי עצתו.', category: 'abuchatzira' },
  { name: 'רבי דוד מנהריה', fullName: 'רבי דוד חי אבוחצירא', sortYear: 1952, datePeriod: '1952 – היום', isAlive: true, bio: 'חי בישראל. היה רב הראשי לנהריה.', category: 'abuchatzira' },
  { name: 'רבי יקותיאל', fullName: 'רבי יקותיאל אבוחצירא', sortYear: 1960, datePeriod: '1960 – היום', isAlive: true, bio: 'חי בישראל. אדמו״ר באשדוד.', category: 'abuchatzira' },
  { name: 'רבי יאשיהו', fullName: 'רבי יאשיהו פינטו', sortYear: 1973, datePeriod: '1973 – היום', isAlive: true, bio: 'חי בישראל. ראש ישיבות שובה ישראל. נין של הבבא סאלי.', category: 'abuchatzira' },

  // ─── אחרוני אחרונים ───
  { name: 'רב בן ציון מאיר חי עוזיאל', fullName: null, sortYear: 1880, datePeriod: '1880–1953', isAlive: false, bio: 'חי בארץ ישראל. היה הרב הראשי הספרדי הראשון.', category: 'late' },
  { name: 'בעל הסולם', fullName: 'רבי יהודה לייב הלוי אשלג', sortYear: 1884, datePeriod: '1884–1954', isAlive: false, bio: 'חי בפולין ועלה לארץ ישראל. כתב את בעל הסולם ״סולם לזוהר״.', category: 'late' },
  { name: 'הרב פוניבז', fullName: 'רבי יוסף שלמה כהנמן', sortYear: 1888, datePeriod: '1888–1969', isAlive: false, bio: 'חי בארץ ישראל ועלה מליטא. מייסד ישיבת פוניבז.', category: 'late' },
  { name: 'הרב עובדיה', fullName: 'הרב עובדיה יוסף', sortYear: 1920, datePeriod: '1920–2013', isAlive: false, bio: 'חי בישראל. פוסק עדות המזרח. כתב את יביע אומר, יחווה דעת, חזון עובדיה ועוד.', category: 'late' },
  { name: 'הרב מרדכי אליהו', fullName: null, sortYear: 1929, datePeriod: '1929–2010', isAlive: false, bio: 'חי בארץ ישראל. הראשון לציון. פוסק עדות המזרח. נכתב עליו סדרת אביהם של ישראל.', category: 'late' },
  { name: 'הרב שלמה מחפוד', fullName: null, sortYear: 1941, datePeriod: '1941 – היום', isAlive: true, bio: 'נולד בתימן ועלה לארץ ישראל. ראש מערך הכשרות בד״ץ יורה דעה.', category: 'late' },
  { name: 'הרב שלמה משה עמאר', fullName: null, sortYear: 1943, datePeriod: '1943 – היום', isAlive: true, bio: 'נולד במרוקו ועלה לארץ ישראל. הראשון לציון.', category: 'late' },
  { name: 'הרב בן ציון מוצפי', fullName: null, sortYear: 1946, datePeriod: '1946 – היום', isAlive: true, bio: 'חי בארץ ישראל. ראש בד״ץ בני ציון.', category: 'late' },
  { name: 'הרב יורם אברג׳ל', fullName: null, sortYear: 1957, datePeriod: '1957–2015', isAlive: false, bio: 'חי בישראל. רב מקובל, מחזיר בתשובה וראש ישיבת קול רינה. כתב את בצור ירום ועוד.', category: 'late' },
  { name: 'רבי ישכר דב רוקח', fullName: null, sortYear: 1966, datePeriod: '1966 – היום', isAlive: true, bio: 'חי בישראל. אדמור בעלז הנוכחי.', category: 'late' },
];

async function main() {
  console.log('Seeding rabbis...');
  await prisma.rabbi.deleteMany();
  await prisma.rabbi.createMany({ data: RABBIS });
  console.log(`✓ Seeded ${RABBIS.length} rabbis`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
