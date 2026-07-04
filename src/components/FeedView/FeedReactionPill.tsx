'use client';

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';

const REACTIONS: {
  key: FeedReaction; emoji: string;
  bg: string; glow: string;
}[] = [
  { key: 'heart', emoji: '❤️', bg: 'rgba(255,55,75,0.22)',  glow: 'rgba(255,65,85,0.55)'  },
  { key: 'fire',  emoji: '🔥', bg: 'rgba(255,115,0,0.22)', glow: 'rgba(255,125,0,0.55)'  },
  { key: 'spark', emoji: '✨', bg: 'rgba(255,215,0,0.2)',   glow: 'rgba(255,220,0,0.55)'  },
];

const pop = keyframes`
  0%   { transform: scale(1); }
  35%  { transform: scale(1.38); }
  65%  { transform: scale(0.88); }
  100% { transform: scale(1); }
`;

const Pill = styled.div<{ $v: boolean }>`
  position: absolute;
  bottom: 84px; left: 0; right: 0; margin: auto;
  width: fit-content;
  display: flex; align-items: stretch;
  background: rgba(6, 4, 18, 0.48);
  backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
  border: 1px solid rgba(255,255,255,0.11);
  border-radius: 34px;
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 4px 24px rgba(0,0,0,0.38);
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'translateY(0)' : 'translateY(12px)'};
  transition: opacity 0.32s 0.22s, transform 0.32s 0.22s;
`;

const Sep = styled.div`
  width: 1px; background: rgba(255,255,255,0.09); flex-shrink: 0;
`;

const Btn = styled.button<{ $active: boolean; $bg: string; $glow: string }>`
  -webkit-tap-highlight-color: transparent; outline: none; appearance: none; -webkit-appearance: none;
  background: ${p => p.$active ? p.$bg : 'transparent'};
  box-shadow: ${p => p.$active ? `inset 0 0 0 1px ${p.$glow}` : 'none'};
  border: none; cursor: pointer;
  padding: 13px 24px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  min-width: 76px;
  transition: background 0.22s, box-shadow 0.22s;
  &:active { opacity: 0.7; }
`;

const Emoji = styled.div<{ $popped: boolean; $active: boolean }>`
  font-size: 1.72rem; line-height: 1;
  filter: ${p => p.$active
    ? 'drop-shadow(0 0 7px rgba(255,255,255,0.3))'
    : 'drop-shadow(0 2px 5px rgba(0,0,0,0.5))'};
  ${p => p.$popped && css`animation: ${pop} 0.33s cubic-bezier(0.34,1.56,0.64,1) both;`}
`;

const Count = styled.div<{ $show: boolean }>`
  font-size: 0.68rem; font-weight: 700; line-height: 1; min-height: 10px;
  color: ${p => p.$show ? 'rgba(255,255,255,0.82)' : 'rgba(255,255,255,0.28)'};
  transition: color 0.2s;
`;

interface Props {
  item: FeedItem;
  reacted: Partial<Record<FeedReaction, true>>;
  visible: boolean;
  onReact: (item: FeedItem, r: FeedReaction) => void;
}

export default function FeedReactionPill({ item, reacted, visible, onReact }: Props) {
  const [popped, setPopped] = useState<FeedReaction | null>(null);

  function handleReact(e: React.MouseEvent, key: FeedReaction) {
    e.stopPropagation();
    if (reacted[key]) return;
    onReact(item, key);
    setPopped(key);
    setTimeout(() => setPopped(null), 380);
  }

  return (
    <Pill $v={visible}>
      {REACTIONS.map(({ key, emoji, bg, glow }, i) => (
        <React.Fragment key={key}>
          {i > 0 && <Sep />}
          <Btn $active={Boolean(reacted[key])} $bg={bg} $glow={glow}
            onClick={e => handleReact(e, key)}
          >
            <Emoji $popped={popped === key} $active={Boolean(reacted[key])}>
              {emoji}
            </Emoji>
            <Count $show={item.reactions[key] > 0}>
              {item.reactions[key] > 0 ? item.reactions[key] : '·'}
            </Count>
          </Btn>
        </React.Fragment>
      ))}
    </Pill>
  );
}
