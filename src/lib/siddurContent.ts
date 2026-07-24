import type { SiddurSection } from './prayers/types';
import { TEFILLIN_GROUPS } from './prayers/tefillin';

// Segment ranges (e.g. The_Shema.2-9) rely on context=0 in SefariaPrayerView —
// without it Sefaria returns the whole node.
// Offerings node layout: 1 title, 2 לשם ייחוד, 3 למנצח על הגיתית, 4-11 קורבנות.
export const SIDDUR_SECTIONS: SiddurSection[] = [
  { name: 'ברכות השחר', sefariaRef: 'Siddur_Edot_HaMizrach, Preparatory_Prayers, Morning_Blessings' },
  { name: 'ברכות התורה', sefariaRef: 'Siddur_Edot_HaMizrach, Preparatory_Prayers, Torah_Blessings' },
  { name: 'ברכות התפילין', groups: TEFILLIN_GROUPS },
  { name: 'קורבנות', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Mincha, Offerings.4-11' },
  { name: 'למנצח על הגיתית', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Mincha, Offerings.2-3' },
  { name: 'למנצח בנגינות', isMenorah: true },
  {
    name: 'פסוקי דזמרה',
    sefariaRef: "Siddur_Edot_HaMizrach, Weekday_Shacharit, Pesukei_D'Zimra",
    jump: { label: 'אשרי יושבי ביתך', match: 'אשרי יושבי ביתך' },
  },
  {
    name: 'ברכות ק״ש',
    parts: [
      { subtitle: 'שחרית', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, The_Shema.2-9' },
      { subtitle: 'ערבית', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Arvit, The_Shema.2-3' },
    ],
  },
  { name: 'קריאת שמע', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, The_Shema.10-16' },
  {
    name: 'ברכות שלאחר ק״ש',
    parts: [
      { subtitle: 'שחרית', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, The_Shema.17-21' },
      { subtitle: 'ערבית', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Arvit, The_Shema.10-11' },
    ],
  },
  { name: 'עמידה', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, Amida' },
  { name: 'וידוי ותחנון', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, Vidui' },
  { name: 'שיר למעלות אשא עיני', sefariaRef: 'Psalms.121' },
  { name: 'עלינו לשבח', sefariaRef: 'Siddur_Edot_HaMizrach, Weekday_Shacharit, Alenu' },
  { name: 'תפילת הדרך', sefariaRef: "Siddur_Edot_HaMizrach, Assorted_Blessings_and_Prayers, Traveler's_Prayer" },
];
