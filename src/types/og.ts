import type { OgIconName } from '@/lib/og/icons';

/** What a share-preview image shows; the layout follows from the fields set. */
export interface OgSpec {
  /** night = espresso + gold (pages); parchment = light paper (quoted text). */
  tone: 'night' | 'parchment';
  /** Small gold label above the title — the section name. */
  eyebrow: string;
  title: string;
  /** One or two lines under the title. */
  subtitle?: string;
  /** A quoted text block (feed items, questions) — switches to the quote layout. */
  quote?: string;
  /** Emblem on the left. */
  icon?: OgIconName;
  /** A portrait in the emblem instead of the icon (data: URL, already fetched). */
  image?: string;
  /** A big code in the emblem instead of the icon (game PIN). */
  badge?: string;
}
