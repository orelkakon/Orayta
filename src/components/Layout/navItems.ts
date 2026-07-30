import { HE } from '@/lib/hebrewTexts';

/**
 * Single source of truth for the header nav and the mobile drawer.
 * `match` covers sections whose active state spans more than one path.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match?: (pathname: string) => boolean;
}

export const navItems: NavItem[] = [
  { href: '/feed',        label: HE.FEED_TITLE,            icon: '✨' },
  { href: '/rabbis',      label: HE.NAV_RABBIS_AND_BOOKS,  icon: '👥',
    match: p => p.startsWith('/rabbis') || p.startsWith('/books') },
  { href: '/sikumim',     label: HE.NAV_SIKUMIM,           icon: '📝' },
  { href: '/study',       label: HE.NAV_TALMUD,            icon: '📜',
    match: p => p.startsWith('/study') || p === '/add' },
  { href: '/gematria',    label: HE.NAV_GEMATRIA,          icon: '🔢' },
  { href: '/content',     label: HE.NAV_CONTENTS,          icon: '📚' },
  { href: '/chidushim',   label: HE.NAV_CHIDUSHIM,         icon: '💡' },
  { href: '/quiz',        label: HE.NAV_LEARN,             icon: '🎯' },
  { href: '/today',       label: HE.NAV_TODAY,             icon: '🗓️' },
  { href: '/dedications', label: HE.NAV_DEDICATIONS,       icon: '🕯️' },
  { href: '/contact',     label: HE.NAV_CONTACT,           icon: '📞' },
  { href: '/about',       label: HE.NAV_ABOUT,             icon: 'ℹ️' },
];
