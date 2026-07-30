import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

export interface ContentStats {
  citations: number; rabbis: number; books: number;
  summaries: number; gematrias: number; chidushim: number;
  videos: number; dedications: number; prayers: number; questions: number;
}

export type TileSize = 'hero' | 'wide' | 'small';

export type TileVariant =
  | 'target' | 'quote' | 'portraits' | 'film' | 'glow'
  | 'shelf' | 'aleph' | 'paper' | 'rays' | 'candle';

export interface StatTileConfig {
  key: keyof ContentStats;
  icon: string;
  label: string;
  sub?: string;
  tint: string;
  size: TileSize;
  variant: TileVariant;
}

// Order doubles as grid placement: hero (2×2) + wide (2×1) + six singles
// tile a 4-column board with no holes, and stay hole-free on the 2-column
// mobile grid as well.
export const STAT_TILES: StatTileConfig[] = [
  { key: 'questions',   icon: 'target',  label: HE.CONTENT_STATS_QUESTIONS,   sub: HE.CONTENT_STATS_QUESTIONS_SUB,
    tint: theme.colors.primary,   size: 'hero',  variant: 'target' },
  { key: 'citations',   icon: 'scroll',  label: HE.CONTENT_STATS_CITATIONS,   tint: theme.colors.secondary, size: 'wide',  variant: 'quote' },
  { key: 'rabbis',      icon: 'users',   label: HE.CONTENT_STATS_RABBIS,      tint: theme.colors.primary,   size: 'small', variant: 'portraits' },
  { key: 'prayers',     icon: 'sparkle', label: HE.CONTENT_STATS_PRAYERS,     tint: theme.colors.secondary, size: 'small', variant: 'glow' },
  { key: 'videos',      icon: 'camera',  label: HE.CONTENT_STATS_VIDEOS,      tint: theme.colors.accent,    size: 'wide',  variant: 'film' },
  { key: 'books',       icon: 'book',    label: HE.CONTENT_STATS_BOOKS,       tint: theme.colors.primary,   size: 'small', variant: 'shelf' },
  { key: 'gematrias',   icon: 'aleph',   label: HE.CONTENT_STATS_GEMATRIAS,   tint: theme.colors.accent,    size: 'small', variant: 'aleph' },
  { key: 'summaries',   icon: 'quill',   label: HE.CONTENT_STATS_SUMMARIES,   tint: theme.colors.secondary, size: 'small', variant: 'paper' },
  { key: 'chidushim',   icon: 'bulb',    label: HE.CONTENT_STATS_CHIDUSHIM,   tint: theme.colors.primary,   size: 'small', variant: 'rays' },
  { key: 'dedications', icon: 'candle',  label: HE.CONTENT_STATS_DEDICATIONS, tint: theme.colors.accent,    size: 'wide',  variant: 'candle' },
];
