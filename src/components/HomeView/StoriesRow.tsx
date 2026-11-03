'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { getViewedKeys, markStoryViewed } from '@/lib/stories';
import { groupStories, groupSeen, openIndex } from '@/lib/storyGroups';
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
  const [open, setOpen] = useState<{ index: number; origin: DOMRect | null } | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

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

  // Always open on the row's logical start — the first group at the far right.
  useEffect(() => { scrollerRef.current?.scrollTo({ left: 0 }); }, [payload]);

  const grouped = useMemo(() => (payload ? groupStories(payload.stories) : null), [payload]);

  if (failed) return null;

  const handleViewed = (key: StoryKey) => {
    if (payload) setViewed(markStoryViewed(payload.date, key));
  };

  return (
    <section aria-label={HE.STORIES_KICKER}>
      <Scroller role="list" ref={scrollerRef}>
        {grouped
          ? grouped.groups.map((g, i) => {
              const seen = groupSeen(g, viewed);
              const cover = grouped.flat[openIndex(g, viewed)];
              const rabbi = g.stories.find(st => st.key === 'rabbi');
              const label = HE.STORY_GROUP_LABELS[g.id];
              return (
                <StoryCircle
                  key={g.id}
                  groupId={g.id}
                  storyKey={rabbi ? 'rabbi' : cover.key}
                  label={label}
                  ariaLabel={HE.STORY_GROUP_ARIA(label, g.stories.length, seen)}
                  viewed={seen}
                  index={i}
                  imageUrl={rabbi?.key === 'rabbi' ? rabbi.data.imageUrl : undefined}
                  onOpen={origin => { haptics.tap(); setOpen({ index: openIndex(g, viewed), origin }); }}
                />
              );
            })
          : Array.from({ length: 5 }, (_, i) => (
              <SkelItem key={i} aria-hidden="true">
                <Skeleton $w="68px" $h="68px" $r="50%" />
                <Skeleton $w="48px" $h="10px" />
              </SkelItem>
            ))}
      </Scroller>
      {open && grouped && (
        <StoryViewer
          groups={grouped.groups}
          stories={grouped.flat}
          startIndex={open.index}
          origin={open.origin}
          viewed={viewed}
          onViewed={handleViewed}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}
