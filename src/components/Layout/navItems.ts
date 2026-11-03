import { HE } from '@/lib/hebrewTexts';

/**
 * Single source of truth for navigation: the four primary destinations (bottom
 * tab bar on compact screens, flat links on desktop) and the grouped rest
 * ("עוד" sheet on compact, dropdowns on desktop).
 * `icon` is a LineIcon name; `match` covers sections spanning several paths.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match?: (pathname: string) => boolean;
  /** Extra words the "עוד" search should match (synonyms, sub-pages). */
  keywords?: string;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

export const PRIMARY_NAV: NavItem[] = [
  { href: '/', label: HE.TAB_HOME, icon: 'home', match: p => p === '/' },
  { href: '/feed', label: HE.TAB_FEED, icon: 'reels', match: p => p === '/feed' },
  { href: '/content', label: HE.TAB_PRAYERS, icon: 'book',
    match: p => p.startsWith('/content') || p.startsWith('/siddur') },
  { href: '/today', label: HE.TAB_TODAY, icon: 'calendar', match: p => p.startsWith('/today') },
];

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'learn', label: HE.NAV_GROUP_LEARN,
    items: [
      { href: '/ask', label: HE.NAV_RABBI_BOT, icon: 'ask', keywords: 'שאלה הלכה בוט' },
      { href: '/study', label: HE.NAV_TALMUD, icon: 'openbook', keywords: 'גמרא ציטוטים מסכת דף',
        match: p => p.startsWith('/study') || p === '/add' },
      { href: '/rabbis', label: HE.NAV_RABBIS_AND_BOOKS, icon: 'users', keywords: 'גדולי ישראל ספרים',
        match: p => p.startsWith('/rabbis') || p.startsWith('/books') },
      { href: '/sikumim', label: HE.NAV_SIKUMIM, icon: 'pencil' },
      { href: '/chidushim', label: HE.NAV_CHIDUSHIM, icon: 'bulb' },
      { href: '/gematria', label: HE.NAV_GEMATRIA, icon: 'aleph', keywords: 'מחשבון' },
      { href: '/quiz', label: HE.NAV_LEARN, icon: 'target', keywords: 'חידון שאלות כרטיסיות' },
      { href: '/play', label: HE.NAV_PLAY, icon: 'users', keywords: 'משחק קבוצה שיעור קהוט' },
      { href: '/live', label: HE.NAV_LIVE, icon: 'live', keywords: 'יוטיוב שיעור חי' },
    ],
  },
  {
    id: 'prayer', label: HE.NAV_GROUP_PRAYER,
    items: [
      { href: '/siddur', label: HE.NAV_SIDDUR, icon: 'sunrise', keywords: 'שחרית מנחה ערבית' },
      { href: '/content', label: HE.NAV_PRAYERS, icon: 'book',
        keywords: 'ברכת המזון תהילים ברכות תפילת הדרך תנ״ך', match: p => p.startsWith('/content') },
      { href: '/hilula', label: HE.NAV_HILULA, icon: 'candle', keywords: 'יארצייט נר' },
      { href: '/omer', label: HE.NAV_OMER, icon: 'hourglass' },
    ],
  },
  {
    id: 'nearby', label: HE.NAV_GROUP_NEARBY,
    items: [
      { href: '/minyan', label: HE.NAV_MINYAN, icon: 'synagogue', keywords: 'בית כנסת זמני תפילה' },
      { href: '/mikveh', label: HE.NAV_MIKVEH, icon: 'droplet' },
      { href: '/kivrei', label: HE.NAV_KIVREI, icon: 'tomb', keywords: 'ציון קבר הילולא' },
    ],
  },
  {
    id: 'community', label: HE.NAV_GROUP_COMMUNITY,
    items: [
      { href: '/dedications', label: HE.NAV_DEDICATIONS, icon: 'candle', keywords: 'לעילוי נשמת רפואה' },
      { href: '/contact', label: HE.NAV_CONTACT, icon: 'phone' },
      { href: '/about', label: HE.NAV_ABOUT, icon: 'info' },
    ],
  },
];

export function isNavActive(item: NavItem, pathname: string): boolean {
  if (item.match) return item.match(pathname);
  return item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
}
