'use client';

import React, { useState } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { FeedItem, FeedReaction } from '@/types';

const REACTIONS: { key: FeedReaction; emoji: string; bg: string }[] = [
  { key: 'heart', emoji: '❤️', bg: 'rgba(255,55,70,0.25)'  },
  { key: 'fire',  emoji: '🔥', bg: 'rgba(255,115,0,0.25)' },
  { key: 'spark', emoji: '✨', bg: 'rgba(255,215,0,0.22)' },
];

const pop = keyframes`
  0%   { transform: scale(1); }
  35%  { transform: scale(1.4); }
  65%  { transform: scale(0.88); }
  100% { transform: scale(1); }
`;

const Pill = styled.div<{ $v: boolean }>`
  position: absolute;
  bottom: 84px; left: 0; right: 0; margin: auto;
  width: fit-content;
  display: flex; align-items: stretch;
  background: rgba(8, 5, 20, 0.55);
  backdrop-filter: blur(26px); -webkit-backdrop-filter: blur(26px);
  border-radius: 32px;
  overflow: hidden;
  z-index: 10;
  box-shadow: 0 6px 28px rgba(0,0,0,0.45);
  opacity: ${p => p.$v ? 1 : 0};
  transform: ${p => p.$v ? 'translateY(0)' : 'translateY(10px)'};
  transition: opacity 0.32s 0.22s, transform 0.32s 0.22s;
`;

const Sep = styled.div`
  width: 1px; background: rgba(255,255,255,0.07); flex-shrink: 0; align-self: stretch;
`;

const Btn = styled.button<{ $active: boolean; $bg: string }>`
  -webkit-tap-highlight-color: transparent; outline: none;
  -webkit-appearance: none; appearance: none;
  background: ${p => p.$active ? p.$bg : 'transparent'};
  border: none; cursor: pointer;
  padding: 12px 22px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  min-width: 70px;
  transition: background 0.2s;
  &:active { opacity: 0.65; }
`;

const EmojiEl = styled.div<{ $popped: boolean; $active: boolean }>`
  font-size: ${p => p.$active ? '1.82rem' : '1.65rem'};
  line-height: 1;
  transition: font-size 0.18s;
  ${p => p.$popped && css`animation: ${pop} 0.34s cubic-bezier(0.34,1.56,0.64,1) both;`}
`;

const Count = styled.div`
  font-size: 0.66rem; font-weight: 700; line-height: 1;
  color: rgba(255,255,255,0.78);
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
    onReact(item, key);
    if (!reacted[key]) {
      setPopped(key);
      setTimeout(() => setPopped(null), 380);
    }
  }

  return (
    <Pill $v={visible}>
      {REACTIONS.map(({ key, emoji, bg }, i) => (
        <React.Fragment key={key}>
          {i > 0 && <Sep />}
          <Btn $active={Boolean(reacted[key])} $bg={bg}
            onClick={e => handleReact(e, key)}
          >
            <EmojiEl $popped={popped === key} $active={Boolean(reacted[key])}>
              {emoji}
            </EmojiEl>
            {item.reactions[key] > 0 && <Count>{item.reactions[key]}</Count>}
          </Btn>
        </React.Fragment>
      ))}
    </Pill>
  );
}
