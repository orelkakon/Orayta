import type { FeedItemType } from '@/types';
import { HE } from '@/lib/hebrewTexts';

/**
 * Single visual identity for every feed content type: a LineIcon, a Hebrew
 * label, an accent color (as an "r,g,b" triplet for rgba() interpolation),
 * a full-slide gradient and a compact gradient for sheets/lists.
 * Shared by FeedCard, FeedSettings, SavedPanel and FeedReader so the type
 * language stays identical everywhere.
 */
export interface FeedTypeStyle {
  icon: string;
  label: string;
  accent: string;
  bg: string;
  chip: string;
}

export const FEED_GOLD = '232,203,118';

export const FEED_TYPE_STYLES: Record<FeedItemType, FeedTypeStyle> = {
  citation: {
    icon: 'scroll', label: HE.FEED_TYPE_CITATION, accent: FEED_GOLD,
    bg: 'linear-gradient(168deg, #090C1C 0%, #111A3E 48%, #0A0D20 100%)',
    chip: 'linear-gradient(135deg, #0C1026 0%, #141F4A 100%)',
  },
  rabbi: {
    icon: 'users', label: HE.FEED_TYPE_RABBI, accent: '226,168,98',
    bg: 'linear-gradient(168deg, #140C05 0%, #2E1C0B 48%, #150D06 100%)',
    chip: 'linear-gradient(135deg, #1A0F06 0%, #382310 100%)',
  },
  book: {
    icon: 'book', label: HE.FEED_TYPE_BOOK, accent: '124,212,156',
    bg: 'linear-gradient(168deg, #06130C 0%, #0D2A1A 48%, #07150D 100%)',
    chip: 'linear-gradient(135deg, #081710 0%, #103322 100%)',
  },
  chidush: {
    icon: 'bulb', label: HE.FEED_TYPE_CHIDUSH, accent: '255,158,84',
    bg: 'linear-gradient(168deg, #170B04 0%, #38200C 48%, #180C05 100%)',
    chip: 'linear-gradient(135deg, #1D0E05 0%, #42260E 100%)',
  },
  gematria: {
    icon: 'aleph', label: HE.FEED_TYPE_GEMATRIA, accent: '148,158,255',
    bg: 'linear-gradient(168deg, #0A0720 0%, #191247 48%, #0B0822 100%)',
    chip: 'linear-gradient(135deg, #0D0928 0%, #1F1655 100%)',
  },
  sikum: {
    icon: 'quill', label: HE.FEED_TYPE_SIKUM, accent: '214,150,244',
    bg: 'linear-gradient(168deg, #130720 0%, #2C1247 48%, #140822 100%)',
    chip: 'linear-gradient(135deg, #170926 0%, #341553 100%)',
  },
};
