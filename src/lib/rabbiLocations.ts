export interface LatLng { lat: number; lng: number; label: string; }

// Rules: keywords must be specific enough that they ONLY appear in bios when the person
// actually lived/worked there. Remove generic religious Hebrew words (גן עדן, מדבר, ארם etc.)
const LOCATION_KEYWORDS: Array<{ keywords: string[]; lat: number; lng: number; label: string }> = [
  {
    keywords: ['ירושלים', 'יהודה', 'יבנה', 'לוד', 'בני ברק', 'פקיעין', 'שכם', 'חברון', 'אשקלון', 'אשדוד', 'רמלה', 'בית שמש'],
    lat: 31.77, lng: 35.22, label: 'ירושלים וסביבתה',
  },
  {
    keywords: ['טבריה', 'גליל', 'ציפורי', 'אושא', 'עכו', 'חיפה', 'צפת', 'קיסריה', 'נצרת', 'כינרת', 'מירון'],
    lat: 32.79, lng: 35.53, label: 'גליל',
  },
  {
    keywords: ['בבל', 'סורא', 'פומבדיתא', 'נהרדעא', 'מחוזא', 'פמבדיתא', 'נהרדאה', 'עיראק', 'בגדד', 'נזיבין'],
    lat: 32.5, lng: 44.4, label: 'בבל',
  },
  {
    keywords: ['ספרד', 'קורדובה', 'טולדו', 'גרנדה', 'ברצלונה', 'סרגוסה', 'לוסנה', 'קסטיליה', 'אנדלוסיה', 'אנדלוס', 'מיורקה'],
    lat: 40.2, lng: -3.7, label: 'ספרד',
  },
  {
    keywords: ['מרוקו', 'פאס', 'מקנס', 'רבאט', 'מראכש', 'תאפילאלת', 'צפרו', 'אגאדיר', 'תארודאנת', 'סגלמאסה', 'ריסאני'],
    lat: 31.8, lng: -6.3, label: 'מרוקו',
  },
  {
    keywords: ['מצרים', 'קהיר', 'פוסטאט', 'אלכסנדריה', 'פוסטט'],
    lat: 30.06, lng: 31.25, label: 'מצרים',
  },
  {
    keywords: ['פולין', 'קראקוב', 'לבוב', 'פוזנא', 'וורשה', 'ורשה', 'לובלין', 'קרקוב', 'ביאליסטוק', 'קאצק', 'גור', 'ראדאמסק', 'אלכסנדר', 'ביאלא', 'בעלז', 'פשיסחה', 'לנציץ', 'קרעמניץ', 'לעלוב', 'פרשיסחא', 'ריפשיץ', 'קאזשניץ', 'אפטא', 'אוסטילא', 'קוברין'],
    lat: 51.9, lng: 19.1, label: 'פולין',
  },
  {
    keywords: ['ליטא', 'וילנה', 'קובנה', 'טלז', 'מיר', 'פוניבז', 'שאוול', 'סלובודקה', 'ראדין', 'קלם', 'קידן', 'ראסיין'],
    lat: 54.69, lng: 25.28, label: 'ליטא',
  },
  {
    keywords: ['גרמניה', 'אשכנז', 'פרנקפורט', 'מיינץ', 'ורמס', 'ספיירא', 'ריגנסבורג', 'נירנברג', 'בון', 'המבורג'],
    lat: 51.17, lng: 10.45, label: 'גרמניה',
  },
  {
    keywords: ['צרפת', 'פרובנס', 'פריז', 'טרויש', 'לוניל', 'נרבון', 'נרבונה', 'מונפלייה', 'רמרי', 'דמפייר', 'פרנקיה'],
    lat: 46.23, lng: 2.21, label: 'צרפת',
  },
  { keywords: ['תוניסיה', 'קירואן', 'תוניס'], lat: 33.89, lng: 9.54, label: 'תוניסיה' },
  { keywords: ['אלג\'יריה', 'תלמסן', 'אלג\'יר'], lat: 28.03, lng: 1.66, label: 'אלג\'יריה' },
  // עדן removed — it means "Eden/paradise" in Hebrew and appears in virtually every rabbi's bio
  { keywords: ['תימן', 'צנעא', 'יהודי תימן', 'תיימן', 'מתימן', 'יהודי תמן'], lat: 15.37, lng: 44.19, label: 'תימן' },
  {
    keywords: ['איטליה', 'רומא', 'ונציה', 'פדובה', 'מנטובה', 'פררה', 'לוקא', 'נאפולי', 'איטאליה', 'ריוואלטא', 'ליבורנו'],
    lat: 41.87, lng: 13.5, label: 'איטליה',
  },
  {
    keywords: ['טורקיה', 'קושטא', 'קונסטנטינופול', 'איזמיר', 'בורסא', 'האימפריה העות\'מאנית', 'עות\'מאנית', 'אדירנה'],
    lat: 39.5, lng: 33.0, label: 'טורקיה',
  },
  { keywords: ['יוון', 'סלוניקי', 'אתונה'], lat: 41.0, lng: 23.5, label: 'יוון' },
  {
    keywords: ['אוקראינה', 'קיוב', 'אודסה', 'מדז\'יבוז', 'ברדיצ\'ב', 'אומאן', 'פולטווה', 'פודוליה', 'וולין', 'בסרביה', 'בעלזא', 'קאמניץ', 'זינקוב', 'חוסיאטין', 'קרמנצ\'וג'],
    lat: 49.0, lng: 31.5, label: 'אוקראינה',
  },
  {
    keywords: ['הונגריה', 'בודפשט', 'סאטמאר', 'קלויזנבורג', 'פרשבורג', 'דעברעצין', 'אונגרן', 'אוהל', 'קאלוב'],
    lat: 47.16, lng: 19.5, label: 'הונגריה',
  },
  {
    keywords: ['רומניה', 'בוקרשט', 'ספינקא', 'ביסטריץ', 'סוצ\'אבה', 'יאסי', 'סיגט', 'בוקובינה', 'מולדובה'],
    lat: 45.94, lng: 24.97, label: 'רומניה',
  },
  { keywords: ['הולנד', 'אמסטרדם', 'רוטרדם', 'הולנדה'], lat: 52.37, lng: 4.9, label: 'הולנד' },
  { keywords: ['אנגליה', 'לונדון', 'מנצ\'סטר', 'בריטניה', 'אינגלנד'], lat: 51.5, lng: -0.12, label: 'אנגליה' },
  // ארם removed — appears in prayers and Aramaic context without meaning Syria
  { keywords: ['סוריה', 'דמשק', 'ארם נהרים', 'ארם צובה', 'חלב', 'ארם דמשק'], lat: 34.8, lng: 38.5, label: 'סוריה' },
  { keywords: ['לוב', 'טריפולי', 'בנגאזי', 'ליביה'], lat: 27.5, lng: 17.0, label: 'לוב' },
  { keywords: ['ארצות הברית', 'ניו יורק', 'שיקגו', 'לוס אנג\'לס', 'בוסטון', 'מיאמי', 'אמריקה', 'ברוקלין', 'מונסי'], lat: 38.5, lng: -96.0, label: 'ארצות הברית' },
  { keywords: ['אוסטריה', 'וינה', 'פרסבורג', 'ברטיסלווה'], lat: 47.52, lng: 14.55, label: 'אוסטריה' },
  {
    keywords: ['בלארוס', 'מינסק', 'גרודנה', 'גרודנא', 'פינסק', 'ברסט', 'סלונים', 'נובהרדוק', 'נוואהרדוק', 'נובגרודק', 'קוברין', 'בריסק', 'מאלש', 'קופישוק'],
    lat: 53.5, lng: 27.5, label: 'בלארוס',
  },
  // שושן/אחשוורוש removed — biblical references, not location markers for actual rabbis
  { keywords: ['פרס', 'איראן', 'פרסיה'], lat: 32.43, lng: 53.69, label: 'פרס' },
  // ישראל standalone removed — matches names like "ישראל בעל שם טוב"; use "ארץ ישראל" instead
  { keywords: ['ארץ ישראל', 'ארץ הקודש', 'הארץ הקדושה', 'בישראל', 'לישראל', 'עלה לארץ'], lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
];

export const CATEGORY_DEFAULTS: Record<string, LatLng> = {
  torah:       { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  neviim:      { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  shoftim:     { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  melachim:    { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  ketuvim:     { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  zugot:       { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  tannaim:     { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
  amoraim:     { lat: 32.5,  lng: 44.4,  label: 'בבל' },
  geonim:      { lat: 32.5,  lng: 44.4,  label: 'בבל' },
  rishonim:    { lat: 40.2,  lng: -3.7,  label: 'ספרד' },
  acharonim:   { lat: 51.9,  lng: 19.1,  label: 'פולין' },
  hasidim:     { lat: 49.0,  lng: 31.5,  label: 'אוקראינה' },
  abuchatzira: { lat: 31.8,  lng: -6.3,  label: 'מרוקו' },
  late:        { lat: 31.77, lng: 35.22, label: 'ארץ ישראל' },
};

export function extractLocations(bio: string, category: string): LatLng[] {
  const found: LatLng[] = [];
  const bioLower = bio.toLowerCase();

  for (const { keywords, lat, lng, label } of LOCATION_KEYWORDS) {
    if (keywords.some(k => bioLower.includes(k.toLowerCase()))) {
      if (!found.some(f => f.label === label)) {
        found.push({ lat, lng, label });
      }
      if (found.length === 2) break;
    }
  }

  if (found.length === 0) {
    const def = CATEGORY_DEFAULTS[category];
    if (def) found.push(def);
  }

  return found;
}
