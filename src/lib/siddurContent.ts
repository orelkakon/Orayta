import type { SiddurSection } from './prayers/types';
import { ASHREI_GROUPS } from './prayers/ashrei';

export const SIDDUR_SECTIONS: SiddurSection[] = [
  { name: 'ברכות השחר', sefariaRef: 'Siddur_Edot_HaMizrach, Preparatory_Prayers, Morning_Blessings' },
  { name: 'ברכות התורה', sefariaRef: 'Siddur_Edot_HaMizrach, Preparatory_Prayers, Torah_Blessings' },
  { name: 'קריאת שמע', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, The_Shema' },
  { name: 'עמידה', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, Amida' },
  { name: 'אשרי יושבי ביתך', groups: ASHREI_GROUPS },
  { name: 'עלינו לשבח', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, Alenu' },
];
