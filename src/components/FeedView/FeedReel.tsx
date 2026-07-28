'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { FeedReelSlide } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';

const IG_EMBED_HEADER = 54;  // px cropped from the top of the embed (avatar row)
const IG_EMBED_FOOTER = 340; // px of embed chrome pushed below the visible frame

const Slide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #0a0612 0%, #1a0b24 50%, #0a0612 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; z-index: 2;
`;

const FrameWrap = styled.div`
  position: relative; overflow: hidden; background: #000;
  width: min(100vw, 430px, calc((100dvh - 24px) * 9 / 16));
  aspect-ratio: 9 / 16;
  border-radius: 16px;
  box-shadow: 0 12px 44px rgba(0,0,0,0.55);
`;

const Frame = styled.iframe`
  position: absolute; top: -${IG_EMBED_HEADER}px; left: 0;
  width: 100%; height: calc(100% + ${IG_EMBED_HEADER + IG_EMBED_FOOTER}px);
  border: none; display: block; background: #000;
`;

const Placeholder = styled.div`
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.35); font-size: 2rem;
`;

const Badge = styled.div`
  position: absolute; top: 10px; right: 10px; z-index: 3;
  display: flex; align-items: center; gap: 6px;
  color: rgba(255,255,255,0.9); font-size: 0.72rem; font-weight: 700;
  background: rgba(0,0,0,0.45); backdrop-filter: blur(8px);
  border-radius: 14px; padding: 4px 10px; pointer-events: none;
`;

/* Transparent strips owned by the page (not the iframe) — touch here scrolls the feed */
const SwipeRail = styled.div<{ $side: 'left' | 'right' }>`
  position: absolute; top: 0; bottom: 0; ${p => p.$side}: 0;
  width: 15%; z-index: 2;
`;

const FloatingActions = styled.div`
  position: absolute; left: 8px; bottom: 14px; z-index: 3;
  display: flex; flex-direction: column; gap: 10px;
`;

const RoundBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none; cursor: pointer;
  width: 42px; height: 42px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: rgba(0,0,0,0.5); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.25);
  color: white; font-size: 1.05rem;
  transition: background 0.15s, transform 0.12s;
  &:active { transform: scale(0.92); }
  &:hover { background: rgba(255,255,255,0.2); }
`;

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
    const obs = new IntersectionObserver(([entry]) => {
      const visible = entry.isIntersecting;
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
          />
        ) : (
          <Placeholder>🎬</Placeholder>
        )}
        <Badge>🎬{slide.username && <span dir="ltr">@{slide.username}</span>}</Badge>
        <SwipeRail $side="left" />
        <SwipeRail $side="right" />
        <FloatingActions>
          <RoundBtn onClick={doShare} aria-label={HE.FEED_REEL_SHARE} title={HE.FEED_REEL_SHARE}>↗</RoundBtn>
          <RoundBtn
            onClick={() => window.open(slide.url, '_blank', 'noopener')}
            aria-label={HE.FEED_REEL_OPEN_IG}
            title={HE.FEED_REEL_OPEN_IG}
          >
            📷
          </RoundBtn>
        </FloatingActions>
      </FrameWrap>
    </Slide>
  );
}
