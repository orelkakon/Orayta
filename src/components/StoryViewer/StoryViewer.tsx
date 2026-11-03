'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { STORY_ART, STORY_DURATION_MS } from '@/lib/stories';
import { StoryGroup, locate } from '@/lib/storyGroups';
import { shareStory } from '@/lib/storyShare';
import { haptics } from '@/lib/haptics';
import { trackEvent } from '@/lib/track';
import { useBodyScrollLock } from '@/components/common/useBodyScrollLock';
import { useThemeColor } from '@/components/common/useThemeColor';
import { useStoryTimer } from './useStoryTimer';
import { useStoryFlip } from './useStoryFlip';
import { useStoryGestures } from './useStoryGestures';
import { storyCta, storyShareContent } from './storyCards';
import StoryCard, { CardDirection } from './StoryCard';
import StoryChrome from './StoryChrome';
import StoryDesktopNav from './StoryDesktopNav';
import type { DailyStory, StoryKey } from '@/types';

const Overlay = styled.div`
  position: fixed; inset: 0; z-index: ${theme.z.feed};
  background: ${theme.game.stageSolid};
  display: flex; align-items: center; justify-content: center;
  /* Long-press is a story gesture (pause), never selection or the iOS callout. */
  user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  ${theme.up.sm} {
    background: color-mix(in srgb, ${theme.game.stageSolid} 82%, transparent);
    -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px);
  }
`;

const Stage = styled.div`
  position: relative; width: 100%; max-width: 440px; height: 100dvh;
  overflow: hidden; background: ${theme.game.stageSolid};
  will-change: transform;
  ${theme.up.sm} {
    height: min(88dvh, 820px);
    border-radius: ${theme.radii.xl};
    box-shadow: ${theme.shadows.lg};
  }
`;

const GestureLayer = styled.div`
  position: absolute; inset: 0; z-index: 2;
  touch-action: none; cursor: pointer;
`;

const SrOnly = styled.span`
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap;
`;

interface StoryViewerProps {
  groups: StoryGroup[];
  /** All stories, flattened in group order. */
  stories: DailyStory[];
  startIndex: number;
  /** The tapped circle — the viewer grows out of it. */
  origin: DOMRect | null;
  /** Keys already watched today — re-watches are not counted in the stats. */
  viewed: Set<StoryKey>;
  onViewed: (key: StoryKey) => void;
  onClose: () => void;
}

export default function StoryViewer({ groups, stories, startIndex, origin, viewed, onViewed, onClose }: StoryViewerProps) {
  const [index, setIndex] = useState(startIndex);
  const [dir, setDir] = useState<CardDirection>('none');
  const [sharing, setSharing] = useState(false);
  // A card reported in-card engagement (full text open, video playing, quiz
  // answered) — hold the clock until the user moves on.
  const [engaged, setEngaged] = useState(false);
  // Reduced-motion users navigate manually — no ticking clock.
  const [autoplay] = useState(() =>
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
    document.documentElement.getAttribute('data-acc-motion') !== 'on');
  const closing = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const story = stories[index];
  const { group, inGroup } = locate(groups, index);
  const art = STORY_ART[story.key];
  const share = storyShareContent(story);

  useBodyScrollLock(true);
  useThemeColor(theme.game.stageSolid);
  const flipClose = useStoryFlip(stageRef, overlayRef, origin);

  const close = useCallback(() => {
    if (closing.current) return;
    closing.current = true;
    flipClose(locate(groups, index).group.id, onClose);
  }, [flipClose, groups, index, onClose]);

  const go = useCallback((to: number) => {
    const from = locate(groups, index).group;
    const target = locate(groups, to).group;
    setDir(target.id === from.id ? 'none' : to > index ? 'forward' : 'back');
    haptics.tap();
    setIndex(to);
  }, [groups, index]);

  const next = useCallback(() => { if (index + 1 < stories.length) go(index + 1); else close(); }, [index, stories.length, go, close]);
  const prev = useCallback(() => { if (index > 0) go(index - 1); }, [index, go]);

  const gestures = useStoryGestures(stageRef, overlayRef, { next, prev, dismiss: close });

  // The video story gets triple time so a clip can actually be watched.
  const duration = story.key === 'video' ? STORY_DURATION_MS * 3 : STORY_DURATION_MS;
  const barRef = useStoryTimer(index, gestures.paused || sharing || engaged, autoplay, next, duration);

  useEffect(() => { setEngaged(false); }, [index]);

  const viewedRef = useRef({ onViewed, viewed });
  viewedRef.current = { onViewed, viewed };
  useEffect(() => {
    const first = !viewedRef.current.viewed.has(story.key);
    viewedRef.current.onViewed(story.key);
    if (first) trackEvent('stories');
  }, [story.key]);

  const navRef = useRef({ next, prev, close });
  navRef.current = { next, prev, close };
  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') navRef.current.close();
      else if (e.key === 'ArrowLeft') navRef.current.next();
      else if (e.key === 'ArrowRight') navRef.current.prev();
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); prevFocus?.focus?.({ preventScroll: true }); };
  }, []);

  const handleShare = async () => {
    if (!share) return;
    setSharing(true);
    try { await shareStory(share); } finally { setSharing(false); }
  };

  /* Portaled to <body>: an ancestor stacking context would otherwise let the
     header / tab bar paint over the viewer. */
  return createPortal(
    <Overlay ref={overlayRef}>
      <Stage ref={stageRef} role="dialog" aria-modal="true" aria-label={HE.STORIES_VIEWER_LABEL}>
        <StoryCard key={index} story={story} art={art} dir={dir} onEngaged={setEngaged} />
        <GestureLayer {...gestures.handlers} aria-hidden="true" />
        <StoryChrome
          count={group.stories.length}
          current={inGroup}
          hidden={gestures.chromeHidden}
          barRef={barRef}
          closeRef={closeBtnRef}
          label={`${HE.STORY_GROUP_LABELS[group.id]} · ${HE.STORY_LABELS[story.key]}`}
          cta={storyCta(story)}
          canShare={share !== null}
          sharing={sharing}
          onShare={handleShare}
          onClose={close}
        />
        <SrOnly aria-live="polite">{HE.STORIES_COUNTER(index + 1, stories.length)}</SrOnly>
      </Stage>
      <StoryDesktopNav canPrev={index > 0} onPrev={prev} onNext={next} />
    </Overlay>,
    document.body,
  );
}
