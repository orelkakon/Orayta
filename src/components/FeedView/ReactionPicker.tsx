'use client';

import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { FeedReaction } from '@/types';

/** Long-press on the like button: pick ❤️ / 🔥 / 👏 (each toggles). */
const REACTIONS: { key: FeedReaction; emoji: string }[] = [
  { key: 'heart', emoji: '❤️' },
  { key: 'fire', emoji: '🔥' },
  { key: 'spark', emoji: '👏' },
];

const popIn = keyframes`from { opacity: 0; transform: translateY(-50%) scale(0.85); } to { opacity: 1; transform: translateY(-50%) scale(1); }`;

const Pop = styled.div`
  position: absolute; top: 50%; right: calc(100% + 10px);
  transform: translateY(-50%); transform-origin: right center;
  display: flex; gap: 2px; padding: 5px;
  border-radius: ${theme.radii.pill};
  background: ${theme.onMedia.rail};
  -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);
  border: 1px solid ${theme.onMedia.line};
  box-shadow: ${theme.onMedia.lift};
  animation: ${popIn} 0.22s ${theme.motion.outStrong} both;
`;

const Choice = styled.button<{ $on: boolean }>`
  width: 46px; height: 46px; border-radius: 50%;
  font-size: 1.55rem; line-height: 1;
  background: ${p => (p.$on ? theme.onMedia.glassHi : 'transparent')};
  transition: transform 0.16s ${theme.motion.spring};
  &:active { transform: scale(1.25); }
`;

interface Props {
  reacted: Partial<Record<FeedReaction, true>>;
  onPick: (r: FeedReaction) => void;
  onClose: () => void;
}

export default function ReactionPicker({ reacted, onPick, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) onClose(); };
    // Next tick: the long-press that opened it must not close it.
    const t = window.setTimeout(() => document.addEventListener('pointerdown', onDown), 0);
    return () => { window.clearTimeout(t); document.removeEventListener('pointerdown', onDown); };
  }, [onClose]);

  return (
    <Pop ref={ref} role="group" aria-label={HE.FEED_REACT_PICK}>
      {REACTIONS.map(r => (
        <Choice
          key={r.key}
          type="button"
          $on={!!reacted[r.key]}
          aria-pressed={!!reacted[r.key]}
          aria-label={HE.FEED_REACT_NAMES[r.key]}
          onClick={e => { e.stopPropagation(); haptics.tap(); onPick(r.key); }}
        >
          {r.emoji}
        </Choice>
      ))}
    </Pop>
  );
}
