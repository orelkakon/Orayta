export type { StaticItem, StaticGroup, SiddurSection } from './prayers/types';
import type { StaticGroup, SiddurSection } from './prayers/types';
import { BRACHOT_NEHENIN_GROUPS } from './prayers/brachotNehenin';
import { BRACHOT_REIYA_GROUPS } from './prayers/brachotReiya';
import { BRACHOT_ACHARONOT_GROUPS } from './prayers/brachotAchronot';
import { KADDISH_GROUPS } from './prayers/kaddish';
import { ASHER_YATZAR } from './staticPrayers';
import { SIDDUR_SECTIONS } from './siddurContent';

export interface SefariaBook { ref: string; name: string; chapters: number; }

export type SectionType = 'sefaria-chapters' | 'sefaria-books' | 'static' | 'static-sections' | 'sefaria-prayer';

export type ContentGroupKey = 'tefillot' | 'brachot' | 'tanakh';

export const CONTENT_GROUPS: { key: ContentGroupKey; icon: string; title: string }[] = [
  { key: 'tefillot', icon: '🕯️', title: 'תפילות' },
  { key: 'brachot',  icon: '🙏', title: 'ברכות' },
  { key: 'tanakh',   icon: '📖', title: 'תנ״ך' },
];

export interface ContentSection {
  id: string;
  icon: string;
  title: string;
  desc: string;
  group: ContentGroupKey;
  type: SectionType;
  ref?: string;
  sefariaRef?: string;
  totalChapters?: number;
  books?: SefariaBook[];
  staticText?: string[];
  staticGroups?: StaticGroup[];
  staticSections?: SiddurSection[];
}

export const TORAH_BOOKS: SefariaBook[] = [
  { ref: 'Genesis',      name: 'בראשית', chapters: 50 },
  { ref: 'Exodus',       name: 'שמות',   chapters: 40 },
  { ref: 'Leviticus',    name: 'ויקרא',  chapters: 27 },
  { ref: 'Numbers',      name: 'במדבר',  chapters: 36 },
  { ref: 'Deuteronomy',  name: 'דברים',  chapters: 34 },
];

export const NEVIIM_BOOKS: SefariaBook[] = [
  { ref: 'Joshua',         name: 'יהושע',       chapters: 24 },
  { ref: 'Judges',         name: 'שופטים',       chapters: 21 },
  { ref: 'I Samuel',       name: 'שמואל א',     chapters: 31 },
  { ref: 'II Samuel',      name: 'שמואל ב',     chapters: 24 },
  { ref: 'I Kings',        name: 'מלכים א',     chapters: 22 },
  { ref: 'II Kings',       name: 'מלכים ב',     chapters: 25 },
  { ref: 'Isaiah',         name: 'ישעיהו',       chapters: 66 },
  { ref: 'Jeremiah',       name: 'ירמיהו',       chapters: 52 },
  { ref: 'Ezekiel',        name: 'יחזקאל',       chapters: 48 },
  { ref: 'Hosea',          name: 'הושע',         chapters: 14 },
  { ref: 'Amos',           name: 'עמוס',         chapters: 9  },
  { ref: 'Micah',          name: 'מיכה',         chapters: 7  },
  { ref: 'Habakkuk',       name: 'חבקוק',        chapters: 3  },
  { ref: 'Zephaniah',      name: 'צפניה',        chapters: 3  },
  { ref: 'Malachi',        name: 'מלאכי',        chapters: 3  },
];

export const KETUVIM_BOOKS: SefariaBook[] = [
  { ref: 'Psalms',         name: 'תהילים',       chapters: 150 },
  { ref: 'Proverbs',       name: 'משלי',         chapters: 31  },
  { ref: 'Job',            name: 'איוב',         chapters: 42  },
  { ref: 'Song of Songs',  name: 'שיר השירים',   chapters: 8   },
  { ref: 'Ruth',           name: 'רות',          chapters: 4   },
  { ref: 'Lamentations',   name: 'איכה',         chapters: 5   },
  { ref: 'Ecclesiastes',   name: 'קהלת',         chapters: 12  },
  { ref: 'Esther',         name: 'אסתר',         chapters: 10  },
  { ref: 'Daniel',         name: 'דניאל',        chapters: 12  },
  { ref: 'Ezra',           name: 'עזרא',         chapters: 10  },
  { ref: 'Nehemiah',       name: 'נחמיה',        chapters: 13  },
  { ref: 'I Chronicles',   name: 'דברי הימים א', chapters: 29  },
  { ref: 'II Chronicles',  name: 'דברי הימים ב', chapters: 36  },
];

export const SECTIONS: ContentSection[] = [
  /* ── תפילות ── */
  {
    id: 'siddur',
    icon: '🕯️',
    title: 'סידור',
    desc: 'ברכות השחר, קריאת שמע, עמידה',
    group: 'tefillot',
    type: 'static-sections',
    staticSections: SIDDUR_SECTIONS,
  },
  {
    id: 'tehillim',
    icon: '📿',
    title: 'תהילים',
    desc: '150 פרקים',
    group: 'tefillot',
    type: 'sefaria-chapters',
    ref: 'Psalms',
    totalChapters: 150,
  },
  {
    id: 'kaddish',
    icon: '🕯️',
    title: 'קדיש',
    desc: 'קדיש יתום, שלם ודרבנן',
    group: 'tefillot',
    type: 'static',
    staticGroups: KADDISH_GROUPS,
  },
  /* ── ברכות ── */
  {
    id: 'birkhat-hamazon',
    icon: '🍞',
    title: 'ברכות אחרונות',
    desc: 'ברכת המזון, מעין שלוש ובורא נפשות',
    group: 'brachot',
    type: 'static-sections',
    staticSections: [
      { name: 'ברכת המזון', sefariaRef: 'Siddur_Edot_HaMizrach, Post_Meal_Blessing' },
      { name: 'מעין שלוש ובורא נפשות', groups: BRACHOT_ACHARONOT_GROUPS },
    ],
  },
  {
    id: 'brachot-nehenin',
    icon: '🙏',
    title: 'ברכות הנהנין',
    desc: 'ברכות על אוכל, שתייה וריח',
    group: 'brachot',
    type: 'static',
    staticGroups: BRACHOT_NEHENIN_GROUPS,
  },
  {
    id: 'asher-yatzar',
    icon: '🤲',
    title: 'אשר יצר',
    desc: 'ברכת אשר יצר',
    group: 'brachot',
    type: 'static',
    staticGroups: [{ title: 'אשר יצר', items: ASHER_YATZAR }],
  },
  {
    id: 'brachot-reiya',
    icon: '👁️',
    title: 'ברכות הראייה',
    desc: 'ברכות על תופעות טבע ואנשים',
    group: 'brachot',
    type: 'static',
    staticGroups: BRACHOT_REIYA_GROUPS,
  },
  /* ── תנ״ך ── */
  {
    id: 'torah',
    icon: '📜',
    title: 'תורה',
    desc: 'חמשה חומשי תורה',
    group: 'tanakh',
    type: 'sefaria-books',
    books: TORAH_BOOKS,
  },
  {
    id: 'neviim',
    icon: '🕊️',
    title: 'נביאים',
    desc: 'נביאים ראשונים ואחרונים',
    group: 'tanakh',
    type: 'sefaria-books',
    books: NEVIIM_BOOKS,
  },
  {
    id: 'ketuvim',
    icon: '📚',
    title: 'כתובים',
    desc: 'כתבי הקודש',
    group: 'tanakh',
    type: 'sefaria-books',
    books: KETUVIM_BOOKS,
  },
];
