import { HE } from '@/lib/hebrewTexts';
import type { DailyMetric } from '@/types';

/** Section-entry rows of the dashboard (one entry per browsing session). */
export const ADMIN_SECTIONS: { metric: DailyMetric; icon: string; label: string }[] = [
  { metric: 'home',        icon: 'home',      label: HE.ADMIN_SECTION_HOME },
  { metric: 'feed',        icon: 'sparkle',   label: HE.ADMIN_SECTION_FEED },
  { metric: 'live',        icon: 'live',      label: HE.ADMIN_SECTION_LIVE },
  { metric: 'stories',     icon: 'eye',       label: HE.ADMIN_SECTION_STORIES },
  { metric: 'content',     icon: 'openbook',  label: HE.ADMIN_SECTION_CONTENT },
  { metric: 'today',       icon: 'calendar',  label: HE.ADMIN_SECTION_TODAY },
  { metric: 'quiz',        icon: 'target',    label: HE.ADMIN_SECTION_QUIZ },
  { metric: 'play',        icon: 'play',      label: HE.ADMIN_SECTION_PLAY },
  { metric: 'rabbis',      icon: 'users',     label: HE.ADMIN_SECTION_RABBIS },
  { metric: 'study',       icon: 'scroll',    label: HE.ADMIN_SECTION_STUDY },
  { metric: 'sikumim',     icon: 'pencil',    label: HE.ADMIN_SECTION_SIKUMIM },
  { metric: 'chidushim',   icon: 'bulb',      label: HE.ADMIN_SECTION_CHIDUSHIM },
  { metric: 'gematria',    icon: 'aleph',     label: HE.ADMIN_SECTION_GEMATRIA },
  { metric: 'ask',         icon: 'ask',       label: HE.ADMIN_SECTION_ASK },
  { metric: 'tehillim',    icon: 'book',      label: HE.ADMIN_SECTION_TEHILLIM },
  { metric: 'hilula',      icon: 'candle',    label: HE.ADMIN_SECTION_HILULA },
  { metric: 'dedications', icon: 'heart',     label: HE.ADMIN_SECTION_DEDICATIONS },
  { metric: 'minyan',      icon: 'synagogue', label: HE.ADMIN_SECTION_MINYAN },
  { metric: 'mikveh',      icon: 'droplet',   label: HE.ADMIN_SECTION_MIKVEH },
  { metric: 'kivrei',      icon: 'tomb',      label: HE.ADMIN_SECTION_KIVREI },
  { metric: 'about',       icon: 'info',      label: HE.ADMIN_SECTION_ABOUT },
  { metric: 'contact',     icon: 'send',      label: HE.ADMIN_SECTION_CONTACT },
];
