'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { STORY_ART } from '@/lib/stories';
import { shareStory } from '@/lib/storyShare';
import { haptics } from '@/lib/haptics';
import { trackEvent } from '@/lib/track';
import { useStoryTimer } from './useStoryTimer';
import { Shell, Body } from './StoryCardParts';
import { StoryCardBody, storyCta, storyShareContent } from './storyCards';
import { StoryPauseContext } from './ExpandableText';
import StoryScene from './StoryScene';
import StoryChrome from './StoryChrome';
import type { DailyStory, StoryKey } from '@/types';

const overlayIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const stageIn = keyframes`
  from { opacity: 0; transform: scale(0.94) translateY(12px); }
  to   { opacity: 1; transform: none; }
`;
const cardIn = keyframes`
  from { opacity: 0; transform: scale(1.03); }
  to   { opacity: 1; transform: none; }
`;

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${theme.z.feed};
  background: rgba(12, 7, 3, 0.72);
  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  display: flex; align-items: center; justify-content: center;
  animation: ${overlayIn} 0.2s ease;
`;

const Stage = styled.div`
  position: relative; width: 100%; max-width: 440px; height: 100dvh;
  overflow: hidden; background: #150d07;
  animation: ${stageIn} 0.3s ${theme.motion.out};
  @media (min-width: 600px) {
    height: min(86vh, 800px);
    border-radius: ${theme.radii.xl};
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55);
  }
`;

const CardLayer = styled.div`
  position: absolute; inset: 0;
  animation: ${cardIn} 0.28s ${theme.motion.out};
`;

/* Sits above the card, below the chrome buttons: taps, holds and swipes land
   here. Tap left = next (RTL reading direction), tap right = back. */
const GestureLayer = styled.div`
  position: absolute; inset: 0; z-index: 2;
  touch-action: none; cursor: pointer;
`;

const SrOnly = styled.span`
  position: absolute; width: 1px; height: 1px; overflow: hidden;
  clip: rect(0 0 0 0); white-space: nowrap;
`;

interface StoryViewerProps {
  stories: DailyStory[];
  startIndex: number;
  onViewed: (key: StoryKey) => void;
  onClose: () => void;
}

export default function StoryViewer({ stories, startIndex, onViewed, onClose }: StoryViewerProps) {
  const [index, setIndex] = useState(startIndex);
  const [holding, setHolding] = useState(false);
  const [sharing, setSharing] = useState(false);
  // A card reported in-card engagement (full text open, video playing, quiz
  // answered) — hold the clock until the user moves on.
  const [engaged, setEngaged] = useState(false);
  // Reduced-motion users navigate manually — no ticking clock.
  const [autoplay] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    document.documentElement.getAttribute('data-acc-motion') !== 'on');

  const closeRef = useRef<HTMLButtonElement>(null);
  const gesture = useRef<{ x: number; y: number; t: number } | null>(null);

  const story = stories[index];
  const n = stories.length;
  const art = STORY_ART[story.key];
  const share = storyShareContent(story);

  const next = () => {
    if (index + 1 < n) { haptics.tap(); setIndex(index + 1); }
    else onClose();
  };
  const prev = () => {
    if (index > 0) { haptics.tap(); setIndex(index - 1); }
  };

  const navRef = useRef({ next, prev, close: onClose });
  navRef.current = { next, prev, close: onClose };
  const viewedRef = useRef(onViewed);
  viewedRef.current = onViewed;

  const barRef = useStoryTimer(index, holding || sharing || engaged, autoplay, next);

  useEffect(() => { setEngaged(false); }, [index]);
  useEffect(() => {
    viewedRef.current(story.key);
    trackEvent('stories');
  }, [story.key]);

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navRef.current.close();
      else if (e.key === 'ArrowLeft') navRef.current.next();
      else if (e.key === 'ArrowRight') navRef.current.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      prevFocus?.focus?.();
    };
  }, []);

  const onDown = (e: React.PointerEvent) => {
    gesture.current = { x: e.clientX, y: e.clientY, t: performance.now() };
    setHolding(true);
  };
  const onUp = (e: React.PointerEvent) => {
    setHolding(false);
    const g = gesture.current;
    gesture.current = null;
    if (!g) return;
    const dx = e.clientX - g.x;
    const dy = e.clientY - g.y;
    const dt = performance.now() - g.t;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? next() : prev(); return; }
    if (dy > 80 && dy > Math.abs(dx)) { onClose(); return; }
    if (dt < 350 && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      const rect = e.currentTarget.getBoundingClientRect();
      if ((e.clientX - rect.left) / rect.width < 0.62) next();
      else prev();
    }
  };
  const onCancel = () => { setHolding(false); gesture.current = null; };

  const handleShare = async () => {
    if (!share) return;
    setSharing(true);
    try { await shareStory(share); } finally { setSharing(false); }
  };

  /* Portaled to <body>: the homepage wrapper creates its own stacking context
     (position + z-index), so rendered in place the header/tab bar would paint
     over the viewer no matter how high its z-index is. */
  return createPortal(
    <Overlay>
      <Stage role="dialog" aria-modal="true" aria-label={HE.STORIES_VIEWER_LABEL}>
        <CardLayer key={index}>
          <Shell $from={art.from} $to={art.to} $accent={art.accent}>
            <StoryScene storyKey={story.key} />
            <Body>
              <StoryPauseContext.Provider value={setEngaged}>
                <StoryCardBody story={story} />
              </StoryPauseContext.Provider>
            </Body>
          </Shell>
        </CardLayer>
        <GestureLayer
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onCancel}
          onPointerLeave={onCancel}
          aria-hidden="true"
        />
        <StoryChrome
          count={n}
          current={index}
          barRef={barRef}
          closeRef={closeRef}
          label={HE.STORY_LABELS[story.key]}
          cta={storyCta(story)}
          canShare={share !== null}
          sharing={sharing}
          onShare={handleShare}
          onClose={onClose}
        />
        <SrOnly aria-live="polite">{HE.STORIES_COUNTER(index + 1, n)}</SrOnly>
      </Stage>
    </Overlay>,
    document.body,
  );
}
