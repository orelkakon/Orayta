'use client';

import { useEffect, useRef, useState } from 'react';
import styled, { css } from 'styled-components';
import type { FeedReelSlide } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';

/*
 * The IG embed lays out: 54px header, then the video in a 4:5 box (width x 1.25)
 * with the 9:16 video letterboxed inside it (object-fit: contain), then footer
 * chrome. The visible 9:16 video is therefore the middle 70.3% of the iframe
 * width. Oversizing the iframe to 142.3% and shifting it right/up crops the
 * header, footer and side bars, so only actual video pixels fill the frame.
 */
const ACTION_BAR = 52; // px reserved below the video for our own actions

const Slide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #0a0612 0%, #1a0b24 50%, #0a0612 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 10px; position: relative; z-index: 2;
`;

const FrameWrap = styled.div`
  position: relative; overflow: hidden; background: #000;
  width: min(100vw, 430px, calc((100dvh - ${ACTION_BAR + 24}px) * 9 / 16));
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  box-shadow: 0 12px 44px rgba(0,0,0,0.55);
`;

const Frame = styled.iframe`
  position: absolute; top: -54px; left: -21.15%;
  width: 142.3%; height: calc(100% + 60px);
  border: none; display: block; background: #000;
`;

const Placeholder = styled.div`
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.35); font-size: 2rem;
`;

/*
 * Transparent shield strips owned by the page (not the iframe): touches on
 * them scroll OUR feed, never the embed's internal content. A small hole is
 * left in the center so tapping the embed's play/pause button still works.
 */
const HOLE = 110; // px — size of the center tap-through hole
const Shield = styled.div<{ $pos: 'top' | 'bottom' | 'left' | 'right' }>`
  position: absolute; z-index: 2;
  ${p => p.$pos === 'top'    && css`inset: 0 0 auto 0; height: calc(50% - ${HOLE / 2}px);`}
  ${p => p.$pos === 'bottom' && css`inset: auto 0 0 0; height: calc(50% - ${HOLE / 2}px);`}
  ${p => p.$pos === 'left'   && css`top: calc(50% - ${HOLE / 2}px); left: 0;  width: calc(50% - ${HOLE / 2}px); height: ${HOLE}px;`}
  ${p => p.$pos === 'right'  && css`top: calc(50% - ${HOLE / 2}px); right: 0; width: calc(50% - ${HOLE / 2}px); height: ${HOLE}px;`}
`;

const Bar = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: min(100vw, 430px);
`;

const BarBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  display: flex; align-items: center; gap: 7px;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 20px;
  color: white; font-size: 0.85rem; font-weight: 700; padding: 8px 16px;
  transition: background 0.15s, transform 0.12s;
  &:active { transform: scale(0.95); }
  &:hover { background: rgba(255,255,255,0.18); }
`;

const User = styled.span`
  color: rgba(255,255,255,0.45); font-size: 0.75rem; direction: ltr;
  max-width: 130px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
`;

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="2.5" y="2.5" width="19" height="19" rx="5.5" />
      <circle cx="12" cy="12" r="4.3" />
      <circle cx="17.4" cy="6.6" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}

interface Props {
  slide: FeedReelSlide;
  onVisible: (visible: boolean) => void;
}

export default function FeedReel({ slide, onVisible }: Props) {
  const slideRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const activeRef = useRef(false);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    // Read the LAST entry — on fast swipes enter+leave arrive in one batch,
    // and dropping the leave would keep the ambient music muted forever.
    const obs = new IntersectionObserver(entries => {
      const visible = entries[entries.length - 1].isIntersecting;
      if (visible === activeRef.current) return;
      activeRef.current = visible;
      setActive(visible);
      onVisible(visible);
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => {
      obs.disconnect();
      if (activeRef.current) { activeRef.current = false; onVisible(false); }
    };
  }, [onVisible]);

  function doShare() {
    const text = `${HE.FEED_REEL_SHARE_TEXT}\n${slide.url}`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: HE.FEED_TITLE, text, url: slide.url }).then(() => trackShare()).catch(() => {});
    } else {
      trackShare();
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }
  }

  return (
    <Slide ref={slideRef}>
      <FrameWrap>
        {/* Mounted only while on screen — unmounting stops playback when swiping away */}
        {active ? (
          <Frame
            src={`https://www.instagram.com/reel/${slide.code}/embed/`}
            title={HE.FEED_REEL_BADGE}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
            scrolling="no"
          />
        ) : (
          <Placeholder>🎬</Placeholder>
        )}
        <Shield $pos="top" />
        <Shield $pos="bottom" />
        <Shield $pos="left" />
        <Shield $pos="right" />
      </FrameWrap>
      <Bar>
        <BarBtn onClick={doShare}>↗ {HE.FEED_REEL_SHARE}</BarBtn>
        {/* /p/<code>/ deep-links to the exact post; /reel/ can land on the generic reels feed in-app */}
        <BarBtn onClick={() => window.open(`https://www.instagram.com/p/${slide.code}/`, '_blank', 'noopener')}>
          <InstagramIcon /> {HE.FEED_REEL_OPEN_IG}
        </BarBtn>
        {slide.username && <User>@{slide.username}</User>}
      </Bar>
    </Slide>
  );
}
