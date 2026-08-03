'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { getViewedKeys, markStoryViewed } from '@/lib/stories';
import { trackSession } from '@/lib/track';
import { haptics } from '@/lib/haptics';
import StoryCircle from './StoryCircle';
import StoryViewer from '@/components/StoryViewer/StoryViewer';
import type { DailyStoriesPayload, StoryKey } from '@/types';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.45; transform: scale(0.75); }
`;
const shimmer = keyframes`
  0%, 100% { opacity: 0.45; }
  50%      { opacity: 0.9; }
`;

const Section = styled.section`
  width: 100%;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  animation: ${fadeUp} 0.45s ease both;
`;

const HeaderRow = styled.div`
  display: flex; align-items: baseline; justify-content: space-between;
  gap: ${theme.spacing.sm};
  padding: 0 2px;
`;

const TitleWrap = styled.div`
  display: flex; align-items: baseline; gap: ${theme.spacing.sm};
`;

const Kicker = styled.h2`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem; font-weight: 800; color: ${theme.colors.primary};
`;

const DateLine = styled.span`
  font-size: 0.78rem; color: ${theme.colors.textLight};
`;

const FreshChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.7rem; font-weight: 700; color: ${theme.colors.secondaryText};
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
  padding: 3px 10px; border-radius: 999px;
  white-space: nowrap;
`;

const Dot = styled.span.attrs({ className: 'anim-loop' })`
  width: 6px; height: 6px; border-radius: 50%;
  background: ${theme.colors.secondary};
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

/* Edge-bleed scroll strip: the circles glide under the page padding instead
   of clipping hard at the container edge. */
const Scroller = styled.div`
  display: flex; gap: ${theme.spacing.ms};
  overflow-x: auto; overscroll-behavior-x: contain;
  padding: 6px 2px 2px;
  margin: 0 -2px;
  scroll-snap-type: x proximity;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  > * { scroll-snap-align: start; }
`;

const Skeleton = styled.div<{ $index: number }>`
  width: 70px; height: 70px; border-radius: 50%; flex-shrink: 0;
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.borderLight};
  animation: ${shimmer} 1.4s ease-in-out infinite;
  animation-delay: ${({ $index }) => $index * 120}ms;
  margin-bottom: 24px;
`;

export default function StoriesRow() {
  const [payload, setPayload] = useState<DailyStoriesPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [viewed, setViewed] = useState<Set<StoryKey>>(new Set());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [hebDate, setHebDate] = useState('');

  useEffect(() => {
    setHebDate(formatHebrewDate(new Date()));
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
    trackSession('content');
    setOpenIndex(i);
  };

  const handleViewed = (key: StoryKey) => {
    if (payload) setViewed(markStoryViewed(payload.date, key));
  };

  return (
    <Section aria-label={HE.STORIES_KICKER}>
      <HeaderRow>
        <TitleWrap>
          <Kicker>{HE.STORIES_KICKER}</Kicker>
          {hebDate && <DateLine>{hebDate}</DateLine>}
        </TitleWrap>
        <FreshChip><Dot aria-hidden="true" />{HE.STORIES_FRESH_CHIP}</FreshChip>
      </HeaderRow>
      <Scroller role="list">
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
          : Array.from({ length: 8 }, (_, i) => <Skeleton key={i} $index={i} aria-hidden="true" />)}
      </Scroller>
      {openIndex !== null && payload && (
        <StoryViewer
          stories={payload.stories}
          startIndex={openIndex}
          onViewed={handleViewed}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </Section>
  );
}
