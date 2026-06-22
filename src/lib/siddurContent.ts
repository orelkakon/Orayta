import type { SiddurSection } from './prayers/types';
import { SHACHARIT_SECTION } from './prayers/shacharit';
import { SHEMA_SECTION } from './prayers/shema';
import { AMIDAH_SECTION } from './prayers/amidah';
import { ALEINU_SECTION } from './prayers/aleinu';

export const SIDDUR_SECTIONS: SiddurSection[] = [
  SHACHARIT_SECTION,
  SHEMA_SECTION,
  AMIDAH_SECTION,
  ALEINU_SECTION,
];
