'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import type { FeedReelSlide } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';

const Slide = styled.div`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: linear-gradient(160deg, #0a0612 0%, #1a0b24 50%, #0a0612 100%);
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 70px 16px 28px; position: relative; z-index: 2;
`;

const Badge = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: rgba(255,255,255,0.85); font-size: 0.85rem; font-weight: 700;
  background: linear-gradient(135deg, rgba(225,48,108,0.25), rgba(129,52,175,0.25));
  border: 1px solid rgba(225,48,108,0.35); border-radius: 20px; padding: 6px 14px;
`;

const PageName = styled.div`
  color: rgba(255,255,255,0.5); font-size: 0.78rem; direction: ltr;
`;

const FrameWrap = styled.div`
  width: min(94vw, 400px); flex: 1; min-height: 0; max-height: 620px;
  border-radius: 18px; overflow: hidden; background: #000;
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow: 0 12px 44px rgba(0,0,0,0.55);
`;

const Frame = styled.iframe`
  width: 100%; height: 100%; border: none; display: block; background: #000;
`;

const Placeholder = styled.div`
  width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.35); font-size: 0.9rem;
`;

const Buttons = styled.div`display: flex; gap: 10px;`;

const ActionBtn = styled.button`
  -webkit-tap-highlight-color: transparent; appearance: none;
  display: flex; align-items: center; gap: 7px; cursor: pointer;
  background: rgba(255,255,255,0.1); backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2); border-radius: 20px;
  color: white; font-size: 0.85rem; font-weight: 700; padding: 9px 16px;
  transition: background 0.15s, transform 0.12s;
  &:active { transform: scale(0.95); }
  &:hover { background: rgba(255,255,255,0.18); }
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
      <Badge>🎬 {HE.FEED_REEL_BADGE}</Badge>
      {slide.username && <PageName>@{slide.username}</PageName>}
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
      </FrameWrap>
      <Buttons>
        <ActionBtn onClick={doShare}>↗ {HE.FEED_REEL_SHARE}</ActionBtn>
        <ActionBtn onClick={() => window.open(slide.url, '_blank', 'noopener')}>📷 {HE.FEED_REEL_OPEN_IG}</ActionBtn>
      </Buttons>
    </Slide>
  );
}
