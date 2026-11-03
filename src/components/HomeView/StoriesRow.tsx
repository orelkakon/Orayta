'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { getViewedKeys, markStoryViewed } from '@/lib/stories';
import { haptics } from '@/lib/haptics';
import { Skeleton } from '@/components/ui/Skeleton';
import StoryCircle from './StoryCircle';
import StoryViewer from '@/components/StoryViewer/StoryViewer';
import type { DailyStoriesPayload, StoryKey } from '@/types';

/* Edge-to-edge strip: the circles glide under the page gutter instead of
   clipping at the content edge. */
const Scroller = styled.div`
  display: flex; gap: ${theme.spacing.sm};
  overflow-x: auto; overscroll-behavior-x: contain;
  padding: 4px ${theme.layout.gutter} 2px;
  margin: 0 calc(-1 * ${theme.layout.gutter});
  scroll-padding-inline: ${theme.layout.gutter};
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  > * { scroll-snap-align: start; }
`;

const SkelItem = styled.div`
  width: 76px; flex-shrink: 0; display: flex; flex-direction: column; align-items: center; gap: 8px;
`;

export default function StoriesRow() {
  const [payload, setPayload] = useState<DailyStoriesPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [viewed, setViewed] = useState<Set<StoryKey>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Always open on the row's logical start — the first story at the far right.
  useEffect(() => {
    scrollerRef.current?.scrollTo({ left: 0 });
  }, [payload]);

  useEffect(() => {
    fetch('/api/stories/daily')
      .then(r => { if (!r.ok) throw new Error('stories fetch failed'); return r.json(); })
      .then((data: DailyStoriesPayload) => {
        if (data.stories.length === 0) { setFailed(true); return; }
        setPayload(data);
        setViewed(getViewedKeys(data.date));
      })
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const openStory = (i: number) => {
    haptics.tap();
    setOpenIndex(i);
  };

  const handleViewed = (key: StoryKey) => {
    if (payload) setViewed(markStoryViewed(payload.date, key));
  };

  return (
    <section aria-label={HE.STORIES_KICKER}>
      <Scroller role="list" ref={scrollerRef}>
        {payload
          ? payload.stories.map((s, i) => (
              <StoryCircle
                key={s.key}
                storyKey={s.key}
                viewed={viewed.has(s.key)}
                index={i}
                imageUrl={s.key === 'rabbi' ? s.data.imageUrl : undefined}
                onClick={() => openStory(i)}
              />
            ))
          : Array.from({ length: 7 }, (_, i) => (
              <SkelItem key={i} aria-hidden="true">
                <Skeleton $w="68px" $h="68px" $r="50%" />
                <Skeleton $w="48px" $h="10px" />
              </SkelItem>
            ))}
      </Scroller>
      {openIndex !== null && payload && (
        <StoryViewer
          stories={payload.stories}
          startIndex={openIndex}
          viewed={viewed}
          onViewed={handleViewed}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </section>
  );
}
