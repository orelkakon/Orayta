import { useEffect, useState } from 'react';
import type { Dedication, InstagramReel } from '@/types';
import { shuffleArray } from '@/lib/feedShuffle';

/** Dedications and reels woven between the feed's content cards, shuffled per visit. */
export function useFeedExtras(): { dedications: Dedication[]; reels: InstagramReel[] } {
  const [dedications, setDedications] = useState<Dedication[]>([]);
  const [reels, setReels] = useState<InstagramReel[]>([]);
  useEffect(() => {
    void fetch('/api/dedications').then(r => r.json()).then((d: Dedication[]) => {
      if (Array.isArray(d)) setDedications(shuffleArray(d));
    }).catch(() => {});
    void fetch('/api/instagram/reels').then(r => r.json()).then((r: InstagramReel[]) => {
      if (Array.isArray(r)) setReels(shuffleArray(r));
    }).catch(() => {});
  }, []);
  return { dedications, reels };
}
