'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { israelDateKey } from '@/lib/dailyLearning/kinds';
import { stashFeedStart } from '@/lib/feedExcerpt';
import { haptics } from '@/lib/haptics';
import { SectionHeader } from '@/components/ui/PageHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import FeedTeaserCard, { cardShape, ContinueCard } from './FeedTeaserCard';
import type { FeedItem } from '@/types';

/**
 * A real taste of "רגע של תורה": today's first few items as portrait cards
 * in a swipeable row. Tapping one opens the feed on that exact item; the last
 * card continues into the full feed.
 */
const COUNT = 6;

const Row = styled.div`
  display: flex; gap: ${theme.spacing.ms};
  overflow-x: auto; overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory; scroll-padding-inline: ${theme.layout.gutter};
  padding: 4px ${theme.layout.gutter} 12px;
  margin: 0 calc(-1 * ${theme.layout.gutter});
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
  & > * { scroll-snap-align: start; }
`;

const SkelCard = styled.div`${cardShape} background: ${theme.colors.surfaceAlt}; box-shadow: none;`;

/** A stable per-day seed, so the teaser shows the same items all day. */
function daySeed(): number {
  return Number(israelDateKey(new Date()).replace(/-/g, '')) || 1;
}

export default function FeedTeaser() {
  const router = useRouter();
  const [items, setItems] = useState<FeedItem[] | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/feed?seed=${daySeed()}&page=0`)
      .then(r => (r.ok ? r.json() : []))
      .then((d: FeedItem[]) => { if (alive) setItems(Array.isArray(d) ? d.slice(0, COUNT) : []); })
      .catch(() => { if (alive) setItems([]); });
    return () => { alive = false; };
  }, []);

  const open = (item: FeedItem) => {
    haptics.tap();
    stashFeedStart(item);
    router.push('/feed');
  };

  if (items && items.length === 0) return null;

  return (
    <section aria-labelledby="home-feed-title">
      <SectionHeader id="home-feed-title" title={HE.HOME_FEED_TITLE} action={{ href: '/feed', label: HE.HOME_FEED_ALL }} />
      <Row>
        {items
          ? <>
              {items.map(item => <FeedTeaserCard key={`${item.type}:${item.id}`} item={item} onOpen={() => open(item)} />)}
              <ContinueCard href="/feed" />
            </>
          : Array.from({ length: 4 }, (_, i) => (
              <SkelCard key={i} aria-hidden="true">
                <Skeleton $w="40%" $h="12px" />
              </SkelCard>
            ))}
      </Row>
    </section>
  );
}
