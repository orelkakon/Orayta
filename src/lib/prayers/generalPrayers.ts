import type { SiddurSection } from './types';
import { WOMEN_PRAYER_SECTIONS } from './womenPrayers';

// סדר הבדלה — נוסח עדות המזרח, loaded from Sefaria (מוצאי שבת node of the siddur).
const HAVDALAH: SiddurSection = {
  name: 'הבדלה',
  sefariaRef: 'Siddur_Edot_HaMizrach, Havdalah, Havdala',
};

export const GENERAL_PRAYER_SECTIONS: SiddurSection[] = [HAVDALAH, ...WOMEN_PRAYER_SECTIONS];
