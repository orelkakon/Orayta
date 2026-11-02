import { HE } from '@/lib/hebrewTexts';

export interface ZmanimTimes {
  alotHaShachar?: string;
  sunrise?: string;
  sofZmanShmaMGA?: string;
  sofZmanShma?: string;      // גר״א
  sofZmanTfillaMGA?: string;
  sofZmanTfilla?: string;    // גר״א
  chatzot?: string;
  minchaGedola?: string;
  plagHaMincha?: string;
  sunset?: string;
  tzeit7083deg?: string;
  tzeit72min?: string;
  dusk?: string;
  chatzotNight?: string;
}
export interface HebcalZmanim { times: ZmanimTimes; }

/* hebcal: sofZmanShma/sofZmanTfilla are per the גר״א; the מג״א values
   carry an explicit MGA suffix — do not swap them. */
export const ENTRIES: { key: keyof ZmanimTimes; label: string }[] = [
  { key: 'alotHaShachar',   label: HE.TODAY_ALOT },
  { key: 'sunrise',         label: HE.TODAY_SUNRISE },
  { key: 'sofZmanShmaMGA',  label: HE.TODAY_SHMA },
  { key: 'sofZmanShma',     label: HE.TODAY_SHMA_GRA },
  { key: 'sofZmanTfillaMGA',label: HE.TODAY_TFILLA },
  { key: 'sofZmanTfilla',   label: HE.TODAY_TFILLA_GRA },
  { key: 'chatzot',         label: HE.TODAY_CHATZOT },
  { key: 'minchaGedola',    label: HE.TODAY_MINCHA_GEDOLA },
  { key: 'plagHaMincha',    label: HE.TODAY_PLAG },
  { key: 'sunset',          label: HE.TODAY_SUNSET },
  { key: 'tzeit7083deg',    label: HE.TODAY_TZEIT },
  { key: 'tzeit72min',      label: HE.TODAY_TZEIT_RT },
  { key: 'chatzotNight',    label: HE.TODAY_CHATZOT_NIGHT },
];

/** YYYY-MM-DD of the following civil day. */
export function nextDay(date: string): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}


export function fmt(iso: string): string {
  return new Date(iso).toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit', hour12: false });
}
