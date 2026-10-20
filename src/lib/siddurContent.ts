import type { SiddurSection } from './prayers/types';
import { TEFILLIN_GROUPS } from './prayers/tefillin';
import { CHAFETZ_CHAIM_GROUPS } from './prayers/chafetzChaim';
import { KADDISH_GROUPS } from './prayers/kaddish';

// The weekday services live in lib/siddur (shacharit/mincha/arvit). These are
// the siddur's standalone pieces, offered under "עוד בסידור" on /siddur.
export const SIDDUR_EXTRAS: (SiddurSection & { id: string; icon: string })[] = [
  {
    id: 'bedtime-shema', icon: 'moon',
    name: 'קריאת שמע שעל המיטה',
    sefariaRef: 'Siddur_Edot_HaMizrach, Bedtime_Shema',
    jump: { label: 'ברכת המפיל', match: 'המפיל חבלי שנה' },
  },
  { id: 'kaddish', icon: 'candle', name: 'קדיש', groups: KADDISH_GROUPS },
  { id: 'chafetz-chaim', icon: 'sparkle', name: 'תפילת החפץ חיים', groups: CHAFETZ_CHAIM_GROUPS },
  { id: 'menorah', icon: 'flame', name: 'למנצח בצורת המנורה', isMenorah: true },
  { id: 'tefillin', icon: 'scroll', name: 'ברכות התפילין', groups: TEFILLIN_GROUPS },
];
