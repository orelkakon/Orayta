import type { FeedItem, FeedSlide, Dedication, InstagramReel } from '@/types';

export const REEL_GAP_MIN  = 5;
export const REEL_GAP_SPAN = 1; // fixed gap of 5 regular cards
const DEDICATION_GAP = 8;

/**
 * Extend the session's random gap sequence in place so already-rendered
 * slides keep their positions (and keys) as more cards are appended.
 */
export function ensureReelGaps(gaps: number[], cardCount: number): void {
  let covered = gaps.reduce((sum, g) => sum + g, 0);
  while (covered <= cardCount) {
    const gap = REEL_GAP_MIN + Math.floor(Math.random() * REEL_GAP_SPAN);
    gaps.push(gap);
    covered += gap;
  }
}

/** Interleave dedication slides (every 8 cards) and reel slides (every 5 cards). */
export function buildFeedSlides(
  cards: FeedItem[],
  dedications: Dedication[],
  reels: InstagramReel[],
  gaps: number[],
  showDedications: boolean,
  showReels: boolean,
): FeedSlide[] {
  const useDed   = showDedications && dedications.length > 0;
  const useReels = showReels && reels.length > 0 && gaps.length > 0;
  if (!useDed && !useReels) return cards;

  const result: FeedSlide[] = [];
  let gapIdx = 0;
  let sinceReel = 0;
  cards.forEach((card, i) => {
    result.push(card);
    if (useDed && (i + 1) % DEDICATION_GAP === 0) {
      const ded = dedications[((i + 1) / DEDICATION_GAP - 1) % dedications.length];
      result.push({ slideType: 'dedication', id: ded.id, dedType: ded.type, name: ded.name });
    }
    sinceReel += 1;
    if (useReels && sinceReel >= gaps[Math.min(gapIdx, gaps.length - 1)]) {
      sinceReel = 0;
      const reel = reels[gapIdx % reels.length];
      result.push({
        slideType: 'reel',
        id: `${reel.id}-${gapIdx}`, // ordinal keeps keys unique when the list cycles
        code: reel.code,
        url: reel.url,
        username: reel.username ?? null,
      });
      gapIdx += 1;
    }
  });
  return result;
}
