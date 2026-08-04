import { HE } from '@/lib/hebrewTexts';

/**
 * Single source of truth for the header nav and the mobile drawer.
 * `icon` is a LineIcon name (same visual language as the homepage tiles).
 * `match` covers sections whose active state spans more than one path.
 */
export interface NavItem {
  href: string;
  label: string;
  icon: string;
  match?: (pathname: string) => boolean;
}

export const navItems: NavItem[] = [
  { href: '/feed',        label: HE.FEED_TITLE,            icon: 'sparkle' },
  { href: '/live',        label: HE.NAV_LIVE,              icon: 'live' },
  { href: '/rabbis',      label: HE.NAV_RABBIS_AND_BOOKS,  icon: 'users',
    match: p => p.startsWith('/rabbis') || p.startsWith('/books') },
  { href: '/sikumim',     label: HE.NAV_SIKUMIM,           icon: 'pencil' },
  { href: '/study',       label: HE.NAV_TALMUD,            icon: 'openbook',
    match: p => p.startsWith('/study') || p === '/add' },
  { href: '/gematria',    label: HE.NAV_GEMATRIA,          icon: 'aleph' },
  { href: '/content',     label: HE.NAV_CONTENTS,          icon: 'book' },
  { href: '/chidushim',   label: HE.NAV_CHIDUSHIM,         icon: 'bulb' },
  { href: '/quiz',        label: HE.NAV_LEARN,             icon: 'target' },
  { href: '/today',       label: HE.NAV_TODAY,             icon: 'calendar' },
  { href: '/dedications', label: HE.NAV_DEDICATIONS,       icon: 'candle' },
  { href: '/contact',     label: HE.NAV_CONTACT,           icon: 'phone' },
  { href: '/about',       label: HE.NAV_ABOUT,             icon: 'info' },
];
