'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import type { FeedReelSlide, FeedCommentsTarget } from '@/types';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';
import { FEED_GOLD } from './feedTypes';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';
import { shareTextSmart } from '@/lib/siteUrl';
import { openReelInInstagram } from '@/lib/instagramOpen';
import FeedRail, { RailButton, RailItem } from './FeedRail';

/*
 * Full-screen reel. The IG embed lays out a 54px header, then the video in a
 * 4:5 box with the 9:16 video letterboxed inside, then footer chrome; the
 * oversized, shifted iframe crops all of that so only video pixels show.
 * Phones: the 9:16 frame covers the screen (sides cropped, like TikTok).
 * Wider screens: a rounded 9:16 card at full height.
 */
const Slide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  position: relative; z-index: 2; overflow: hidden;
  background: ${theme.onMedia.void};
`;

const FrameWrap = styled.div`
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  height: 100dvh; width: calc(100dvh * 9 / 16); min-width: 100vw;
  overflow: hidden; background: ${theme.onMedia.void};
  ${theme.up.sm} {
    min-width: 0; height: calc(100dvh - 32px); width: calc((100dvh - 32px) * 9 / 16);
    border-radius: 20px; box-shadow: ${theme.onMedia.lift};
  }
`;

const Frame = styled.iframe`
  position: absolute; top: -54px; left: -21.15%;
  width: 142.3%; height: calc(100% + 60px);
  border: none; display: block; background: ${theme.onMedia.void};
`;

const pulse = keyframes`0%, 100% { opacity: 0.35; transform: scale(1); } 50% { opacity: 0.8; transform: scale(1.08); }`;

const Placeholder = styled.div.attrs({ className: 'anim-loop' })`
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: ${theme.game.gold};
  background: ${theme.game.stage};
  svg { animation: ${pulse} 1.8s ease-in-out infinite; }
`;

/*
 * Transparent shield strips owned by the page (not the iframe): touches on
 * them scroll OUR feed, never the embed. A hole in the middle lets a tap reach
 * the embed's own play button.
 */
const HOLE = 120;
const Shield = styled.div<{ $pos: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute; z-index: 2;
  ${p => p.$pos === 'top'    && css`inset: 0 0 auto 0; height: calc(50% - ${HOLE / 2}px);`}
  ${p => p.$pos === 'bottom' && css`inset: auto 0 0 0; height: calc(50% - ${HOLE / 2}px);`}
  ${p => p.$pos === 'left'   && css`top: calc(50% - ${HOLE / 2}px); left: 0;  width: calc(50% - ${HOLE / 2}px); height: ${HOLE}px;`}
  ${p => p.$pos === 'right'  && css`top: calc(50% - ${HOLE / 2}px); right: 0; width: calc(50% - ${HOLE / 2}px); height: ${HOLE}px;`}
`;

const User = styled.span`
  position: absolute; z-index: 5; left: calc(14px + ${theme.safe.left}); bottom: calc(28px + ${theme.safe.bottom});
  max-width: 55vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr;
  color: ${theme.onMedia.ink}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  text-shadow: ${theme.onMedia.textShadow};
`;

interface Props {
  slide: FeedReelSlide;
  onVisible: (visible: boolean) => void;
  commentCount: number;
  onComments: (target: FeedCommentsTarget) => void;
}

export default function FeedReel({ slide, onVisible, commentCount, onComments }: Props) {
  const slideRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);
  const [active, setActive] = useState(false);
  // Swiped away after watching: unmount to stop playback (re-mounts on return).
  const [parked, setParked] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    // Preload one screen ahead/behind so the embed is ready on arrival.
    const nearObs = new IntersectionObserver(entries => {
      const isNear = entries[entries.length - 1].isIntersecting;
      setNear(isNear);
      if (!isNear) setParked(false);
    }, { rootMargin: '100% 0px' });
    // Read the LAST entry — on fast swipes enter+leave arrive in one batch,
    // and dropping the leave would keep the ambient music muted forever.
    const activeObs = new IntersectionObserver(entries => {
      const visible = entries[entries.length - 1].isIntersecting;
      if (visible === activeRef.current) return;
      if (!visible) setParked(true); else setParked(false);
      activeRef.current = visible;
      setActive(visible);
      onVisible(visible);
    }, { threshold: 0.6 });
    nearObs.observe(el);
    activeObs.observe(el);
    return () => {
      nearObs.disconnect();
      activeObs.disconnect();
      if (activeRef.current) { activeRef.current = false; onVisible(false); }
    };
  }, [onVisible]);

  const share = () => {
    trackShare();
    void shareTextSmart(`${HE.FEED_REEL_SHARE_TEXT}\n${slide.url}`, HE.FEED_TITLE);
  };

  const mounted = active || (near && !parked);

  return (
    <Slide ref={slideRef}>
      <FrameWrap>
        {mounted ? (
          <Frame
            src={`https://www.instagram.com/reel/${slide.code}/embed/`}
            title={HE.FEED_REEL_BADGE}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            scrolling="no"
          />
        ) : (
          <Placeholder><LineIcon name="reels" size={40} strokeWidth={1.5} /></Placeholder>
        )}
        <Shield $pos="top" />
        <Shield $pos="bottom" />
        <Shield $pos="left" />
        <Shield $pos="right" />
      </FrameWrap>
      {slide.username && <User>@{slide.username}</User>}
      <FeedRail
        comments={{
          count: commentCount,
          onOpen: () => onComments({ type: 'reel', id: slide.reelId, label: HE.COMMENTS_REEL_LABEL, icon: 'reels', accent: FEED_GOLD }),
        }}
        onShare={share}
        extra={(
          <RailItem>
            <RailButton onClick={e => { e.stopPropagation(); openReelInInstagram(slide.code); }} aria-label={HE.FEED_REEL_OPEN_IG}>
              <LineIcon name="camera" size={22} strokeWidth={1.9} />
            </RailButton>
          </RailItem>
        )}
      />
    </Slide>
  );
}
