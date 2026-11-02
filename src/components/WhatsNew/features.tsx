import type { ReactNode } from 'react';
import { HE } from '@/lib/hebrewTexts';
import { openRabbiBot } from '@/lib/rabbiBot/client';
import RabbiBotHero from './RabbiBotHero';

/**
 * The announcement currently shown once to everyone (see lib/whatsNew.ts).
 * To announce a new feature: write its hero + texts, replace CURRENT_FEATURE
 * and bump WHATS_NEW_ID.
 */
export interface WhatsNewFeature {
  hero: (titleId: string) => ReactNode;
  points: { icon: string; title: string; text: string }[];
  note?: string;
  cta: { label: string; run: () => void } | { label: string; href: string };
}

export const CURRENT_FEATURE: WhatsNewFeature = {
  hero: titleId => <RabbiBotHero titleId={titleId} />,
  points: HE.WN_RB_POINTS,
  note: HE.WN_RB_NOTE,
  cta: { label: HE.WN_RB_CTA, run: openRabbiBot },
};
