'use client';

import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';
import { renderContent, MetaChip, MetaChipLink } from './FeedCardContent';
import FeedCardActions from './FeedCardActions';
import FeedReactionPill from './FeedReactionPill';

const TYPE_CONFIG: Record<string, { icon: string; label: string; grad: string }> = {
  citation: { icon: '📜', label: 'ציטוט תלמודי', grad: 'linear-gradient(160deg,#050a1e 0%,#0d1a52 60%,#1a2a7a 100%)' },
  rabbi:    { icon: '👥', label: 'רב ומנהיג',    grad: 'linear-gradient(160deg,#150800 0%,#3d1e00 60%,#6b3200 100%)' },
  book:     { icon: '📚', label: 'ספר קודש',     grad: 'linear-gradient(160deg,#041008 0%,#0a2e14 60%,#114022 100%)' },
  chidush:  { icon: '💡', label: 'חידוש תורה',   grad: 'linear-gradient(160deg,#120800 0%,#3d1800 60%,#6b2800 100%)' },
  gematria: { icon: '🔢', label: 'גימטריה',       grad: 'linear-gradient(160deg,#06021a 0%,#140852 60%,#220d8c 100%)' },
  sikum:    { icon: '📝', label: 'סיכום לימוד',   grad: 'linear-gradient(160deg,#12041a 0%,#320a40 60%,#4a1060 100%)' },
};

const Slide = styled.div<{ $grad: string }>`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: ${p => p.$grad}; position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  -webkit-tap-highlight-color: transparent;
  &::before {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: radial-gradient(ellipse at 30% 40%, rgba(255,255,255,0.04), transparent 70%);
  }
`;

const TypeBadge = styled.div<{ $v: boolean }>`
  position: absolute; top: 68px; right: 16px;
  background: rgba(255,255,255,0.12); backdrop-filter: blur(10px);
  color: rgba(255,255,255,0.88); font-size: 0.76rem; font-weight: 700; letter-spacing: 0.04em;
  padding: 5px 12px; border-radius: 20px; display: flex; gap: 6px; align-items: center;
  border: 1px solid rgba(255,255,255,0.14);
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'none' : 'translateX(14px)'};
  transition: opacity 0.3s, transform 0.3s;
`;

const ContentArea = styled.div`
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center;
  padding: 72px 16px 150px 16px; gap: 12px;
`;

const AnimBody = styled.div<{ $v: boolean }>`
  display: contents;
  & > * {
    opacity: ${p => p.$v ? 1 : 0};
    transform: ${p => p.$v ? 'none' : 'translateY(20px)'};
    transition: opacity 0.38s 0.09s, transform 0.38s 0.09s;
  }
`;

const MetaRow = styled.div<{ $v: boolean }>`
  display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; margin-top: 10px;
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'none' : 'translateY(12px)'};
  transition: opacity 0.3s 0.18s, transform 0.3s 0.18s;
`;

const heartBurst = keyframes`
  0%   { opacity: 0; transform: translate(-50%,-50%) scale(0.4); }
  40%  { opacity: 1; transform: translate(-50%,-50%) scale(1.4); }
  70%  { opacity: 0.9; transform: translate(-50%,-50%) scale(1.1); }
  100% { opacity: 0; transform: translate(-50%,-50%) scale(1.6); }
`;
const HeartBurst = styled.div`
  position: absolute; top: 50%; left: 50%; pointer-events: none;
  font-size: 5rem; line-height: 1; z-index: 50;
  animation: ${heartBurst} 0.65s ease forwards;
`;

const ImgOverlay = styled.div`
  position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.92);
  display: flex; align-items: center; justify-content: center; cursor: pointer;
`;

interface Props {
  item: FeedItem;
  reacted: Partial<Record<FeedReaction, true>>;
  isSaved: boolean;
  onReact: (item: FeedItem, r: FeedReaction) => void;
  onBookmark: (item: FeedItem) => void;
}

export default function FeedCard({ item, reacted, isSaved, onReact, onBookmark }: Props) {
  const cfg = TYPE_CONFIG[item.type];
  const [visible, setVisible] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [imgPopup, setImgPopup] = useState<string | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const { body, meta, copyText } = renderContent(item, setImgPopup);

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold: 0.55 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      onReact(item, 'heart');
      setShowBurst(true);
      setTimeout(() => setShowBurst(false), 700);
    }
    lastTapRef.current = now;
  };

  return (
    <Slide $grad={cfg.grad} onClick={handleDoubleTap} ref={slideRef}>
      {showBurst && <HeartBurst>❤️</HeartBurst>}
      {imgPopup && (
        <ImgOverlay onClick={e => { e.stopPropagation(); setImgPopup(null); }}>
          <img src={imgPopup} alt="" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }} />
        </ImgOverlay>
      )}
      <TypeBadge $v={visible}>{cfg.icon} {cfg.label}</TypeBadge>
      <ContentArea>
        <AnimBody $v={visible}>{body}</AnimBody>
        {meta.length > 0 && (
          <MetaRow $v={visible} onClick={e => e.stopPropagation()}>
            {meta.map((m, i) => m.href
              ? <MetaChipLink key={i} href={m.href}>{m.label}</MetaChipLink>
              : <MetaChip key={i}>{m.label}</MetaChip>
            )}
          </MetaRow>
        )}
      </ContentArea>
      <FeedReactionPill item={item} reacted={reacted} visible={visible} onReact={onReact} />
      <FeedCardActions
        item={item} isSaved={isSaved} slideRef={slideRef}
        onBookmark={onBookmark} copyText={copyText}
      />
    </Slide>
  );
}
