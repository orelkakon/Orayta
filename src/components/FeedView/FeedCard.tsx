'use client';

import React, { useRef, useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import type { FeedItem, FeedReaction, FeedCommentsTarget, Citation } from '@/types';
import { renderContent, MetaChip, MetaChipLink } from './FeedCardContent';
import ContextButton from '@/components/TalmudContext/ContextButton';
import FeedRail from './FeedRail';
import DoubleTapHeart, { HeartPoint } from './DoubleTapHeart';
import { FEED_TYPE_STYLES } from './feedTypes';
import { LineIcon } from '@/components/common/LineIcons';
import type { ReaderData } from './FeedReader';
import { haptics } from '@/lib/haptics';

const Slide = styled.div<{ $bg: string }>`
  height: 100dvh; scroll-snap-align: start; flex-shrink: 0;
  background: ${p => p.$bg}; position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  -webkit-tap-highlight-color: transparent;
`;

const breathe = keyframes`
  0%, 100% { opacity: 0.55; transform: translateX(-50%) scale(1); }
  50%      { opacity: 1; transform: translateX(-50%) scale(1.07); }
`;

// Soft accent-colored halo behind the content — gives each slide depth
// and a candle-light warmth in the type's own color.
const Aura = styled.div.attrs({ className: 'anim-loop' })<{ $accent: string }>`
  position: absolute; top: -12%; left: 50%; transform: translateX(-50%);
  width: 140vw; max-width: 900px; height: 58vh; pointer-events: none;
  background: radial-gradient(ellipse at 50% 38%, rgba(${p => p.$accent}, 0.13) 0%, transparent 62%);
  animation: ${breathe} 7s ease-in-out infinite;
`;

const Kicker = styled.div<{ $v: boolean }>`
  position: absolute; top: calc(66px + env(safe-area-inset-top)); left: 0; right: 0; z-index: 5;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'none' : 'translateY(-10px)'};
  transition: opacity 0.45s 0.05s, transform 0.45s 0.05s;
`;

const KLine = styled.div<{ $accent: string; $flip?: boolean }>`
  width: 36px; height: 1px;
  background: linear-gradient(${p => p.$flip ? '270deg' : '90deg'}, transparent, rgba(${p => p.$accent}, 0.55));
`;

const KBadge = styled.div<{ $accent: string }>`
  display: flex; align-items: center; gap: 7px;
  background: rgba(${p => p.$accent}, 0.08); backdrop-filter: blur(10px);
  border: 1px solid rgba(${p => p.$accent}, 0.3); border-radius: 999px;
  color: rgba(${p => p.$accent}, 0.95); padding: 6px 14px;
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em; white-space: nowrap;
`;

const ContentArea = styled.div`
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; align-items: center; text-align: center;
  /* Right side clears the action rail; the rest keeps a comfortable measure. */
  padding: calc(104px + ${theme.safe.top}) 68px calc(112px + ${theme.safe.bottom}) 20px; gap: 13px;
  position: relative; z-index: 3;
`;

const AnimBody = styled.div<{ $v: boolean }>`
  display: contents;
  & > * {
    opacity: ${p => p.$v ? 1 : 0};
    transform: ${p => p.$v ? 'none' : 'translateY(22px)'};
    transition: opacity 0.55s 0.12s cubic-bezier(0.22, 1, 0.36, 1),
                transform 0.55s 0.12s cubic-bezier(0.22, 1, 0.36, 1);
  }
`;

const MetaRow = styled.div<{ $v: boolean }>`
  display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; margin-top: 10px;
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'none' : 'translateY(14px)'};
  transition: opacity 0.45s 0.26s cubic-bezier(0.22, 1, 0.36, 1),
              transform 0.45s 0.26s cubic-bezier(0.22, 1, 0.36, 1);
`;

const ImgOverlay = styled.div`
  position: fixed; inset: 0; z-index: 999; background: rgba(0,0,0,0.92);
  padding: ${theme.safe.top} 0 ${theme.safe.bottom};
  display: flex; align-items: center; justify-content: center; cursor: pointer;
`;

interface Props {
  item: FeedItem;
  reacted: Partial<Record<FeedReaction, true>>;
  isSaved: boolean;
  onReact: (item: FeedItem, r: FeedReaction) => void;
  onBookmark: (item: FeedItem) => void;
  onExpand: (data: ReaderData) => void;
  commentCount: number;
  onComments: (target: FeedCommentsTarget) => void;
  onShare: (item: FeedItem, slide: HTMLElement | null) => void;
}

export default function FeedCard({ item, reacted, isSaved, onReact, onBookmark, onExpand, commentCount, onComments, onShare }: Props) {
  const cfg = FEED_TYPE_STYLES[item.type];
  const [visible, setVisible] = useState(false);
  const [hearts, setHearts] = useState<HeartPoint[]>([]);
  const [imgPopup, setImgPopup] = useState<string | null>(null);
  const slideRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef(0);
  const { body, meta } = renderContent(item, setImgPopup,
    r => onExpand({ ...r, icon: cfg.icon, label: cfg.label, accent: cfg.accent }));

  useEffect(() => {
    const el = slideRef.current;
    if (!el) return;
    // Stays observed so the entrance choreography replays when the user
    // scrolls back to a slide — it re-lives instead of sitting inert.
    const obs = new IntersectionObserver(
      ([e]) => setVisible(e.isIntersecting),
      { threshold: 0.55 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Double-tap anywhere: a heart pops where the finger landed. Instagram
  // rule — double-tap only ever adds the like, never removes it.
  const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      if (!reacted.heart) onReact(item, 'heart');
      haptics.success();
      const rect = e.currentTarget.getBoundingClientRect();
      const heart = { id: now, x: e.clientX - rect.left, y: e.clientY - rect.top, tilt: Math.round(Math.random() * 30 - 15) };
      setHearts(h => [...h, heart]);
      window.setTimeout(() => setHearts(h => h.filter(x => x.id !== heart.id)), 850);
      lastTapRef.current = 0;
      return;
    }
    lastTapRef.current = now;
  };

  return (
    <Slide $bg={cfg.bg} onClick={handleTap} ref={slideRef}>
      <Aura $accent={cfg.accent} />
      {hearts.map(h => <DoubleTapHeart key={h.id} {...h} />)}
      {imgPopup && (
        <ImgOverlay onClick={e => { e.stopPropagation(); setImgPopup(null); }}>
          <img src={imgPopup} alt="" style={{ maxWidth: '90vw', maxHeight: '80vh', borderRadius: 12, objectFit: 'contain' }} />
        </ImgOverlay>
      )}
      <Kicker $v={visible}>
        <KLine $accent={cfg.accent} />
        <KBadge $accent={cfg.accent}>
          <LineIcon name={cfg.icon} size={13} strokeWidth={1.8} />
          {cfg.label}
        </KBadge>
        <KLine $accent={cfg.accent} $flip />
      </Kicker>
      <ContentArea>
        <AnimBody $v={visible}>{body}</AnimBody>
        {meta.length > 0 && (
          <MetaRow $v={visible} onClick={e => e.stopPropagation()}>
            {meta.map((m, i) => m.href
              ? <MetaChipLink key={i} href={m.href}>{m.label}</MetaChipLink>
              : <MetaChip key={i}>{m.label}</MetaChip>
            )}
            {item.type === 'citation' && <ContextButton citation={item.data as Citation} variant="feed" />}
          </MetaRow>
        )}
      </ContentArea>
      <FeedRail
        reactions={{ counts: item.reactions, reacted, onReact: r => onReact(item, r) }}
        comments={{
          count: commentCount,
          onOpen: () => onComments({ type: item.type, id: item.id, label: cfg.label, icon: cfg.icon, accent: cfg.accent }),
        }}
        save={{ saved: isSaved, onToggle: () => onBookmark(item) }}
        onShare={() => onShare(item, slideRef.current)}
      />
    </Slide>
  );
}
