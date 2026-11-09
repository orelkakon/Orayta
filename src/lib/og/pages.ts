import type { OgSpec } from '@/types/og';
import { HE } from '@/lib/hebrewTexts';
import type { OgIconName } from './icons';

/** Share-preview cards for the site's pages (static — no data needed). */
export type OgPageKey = keyof typeof HE.OG_PAGES;

const ICONS: Record<OgPageKey, OgIconName> = {
  home: 'openbook', feed: 'sparkle', today: 'sun', ask: 'ask', play: 'target', siddur: 'sunrise',
  content: 'openbook', hilula: 'candle', omer: 'calendar', rabbis: 'users', study: 'scroll', quiz: 'target',
  sikumim: 'books', chidushim: 'bulb', gematria: 'sparkle', minyan: 'synagogue', mikveh: 'droplet',
  kivrei: 'tomb', live: 'live', dedications: 'heart', contact: 'send', about: 'home', legal: 'info', learn: 'books',
};

export const isOgPageKey = (k: string): k is OgPageKey => Object.prototype.hasOwnProperty.call(ICONS, k);

export function pageSpec(key: OgPageKey, over: Partial<OgSpec> = {}): OgSpec {
  const t = HE.OG_PAGES[key];
  return { tone: 'night', eyebrow: t.eyebrow, title: t.title, subtitle: t.subtitle, icon: ICONS[key], ...over };
}
