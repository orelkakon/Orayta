'use client';

import { MouseEvent, ReactNode, useRef, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import { LineIcon } from '@/components/common/LineIcons';
import type { FeedReaction, FeedReactions } from '@/types';
import ReactionPicker from './ReactionPicker';

/**
 * The one action rail for every slide (TikTok/Reels style): like — hold it
 * for 🔥 / 👏 — comments, save, share. Counts sit under their icon.
 */
const pop = keyframes`0% { transform: scale(1); } 35% { transform: scale(1.28); } 70% { transform: scale(0.92); } 100% { transform: scale(1); }`;

const Rail = styled.div`
  position: absolute; z-index: 6;
  right: calc(10px + ${theme.safe.right}); bottom: calc(96px + ${theme.safe.bottom});
  display: flex; flex-direction: column; align-items: center; gap: 14px;
`;

const Item = styled.div`
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  color: ${theme.onMedia.ink}; font-size: ${theme.fontSizes.xxs}; font-weight: 700;
  text-shadow: ${theme.onMedia.textShadow}; font-variant-numeric: tabular-nums;
`;

const Btn = styled.button<{ $on?: boolean; $popping?: boolean; $tint?: string }>`
  width: 48px; height: 48px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${p => (p.$on && p.$tint ? p.$tint : theme.onMedia.ink)};
  background: ${theme.onMedia.rail};
  -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px);
  border: 1px solid ${theme.onMedia.line};
  -webkit-touch-callout: none; user-select: none;
  transition: transform 0.16s ${theme.motion.outStrong}, color 0.2s ease;
  &:active { transform: scale(0.88); }
  ${p => p.$popping && css`svg { animation: ${pop} 0.36s ${theme.motion.spring}; }`}
`;

export interface RailReactions {
  counts: FeedReactions;
  reacted: Partial<Record<FeedReaction, true>>;
  onReact: (r: FeedReaction) => void;
}

interface Props {
  reactions?: RailReactions;
  comments: { count: number; onOpen: () => void };
  save?: { saved: boolean; onToggle: () => void };
  onShare: () => void;
  /** Extra action at the bottom (e.g. "open in Instagram" for reels). */
  extra?: ReactNode;
}

const stop = (fn: () => void) => (e: MouseEvent) => { e.stopPropagation(); fn(); };

export default function FeedRail({ reactions, comments, save, onShare, extra }: Props) {
  const [picker, setPicker] = useState(false);
  const [popping, setPopping] = useState<'like' | 'save' | null>(null);
  const hold = useRef(0);
  const held = useRef(false);

  const flash = (what: 'like' | 'save') => { setPopping(what); window.setTimeout(() => setPopping(null), 380); };
  const total = reactions ? reactions.counts.heart + reactions.counts.fire + reactions.counts.spark : 0;
  const liked = !!reactions && Object.keys(reactions.reacted).length > 0;

  const startHold = () => {
    held.current = false;
    hold.current = window.setTimeout(() => { held.current = true; haptics.tap(); setPicker(true); }, 420);
  };
  const endHold = () => window.clearTimeout(hold.current);

  const tapLike = (e: MouseEvent) => {
    e.stopPropagation();
    if (held.current || !reactions) return;
    // Tap toggles the plain heart; other reactions come from the picker.
    if (!reactions.reacted.heart) { haptics.tap(); flash('like'); }
    reactions.onReact('heart');
  };

  return (
    <Rail onClick={e => e.stopPropagation()}>
      {reactions && (
        <Item>
          <Btn
            $on={liked} $tint={theme.onMedia.like} $popping={popping === 'like'}
            onClick={tapLike}
            onPointerDown={startHold} onPointerUp={endHold} onPointerLeave={endHold} onPointerCancel={endHold}
            onContextMenu={e => e.preventDefault()}
            aria-pressed={!!reactions.reacted.heart}
            aria-label={`${reactions.reacted.heart ? HE.FEED_UNLIKE : HE.FEED_LIKE} (${total})`}
          >
            <LineIcon name="heart" size={25} strokeWidth={1.9} filled={liked} />
          </Btn>
          {total > 0 && <span aria-hidden="true">{total}</span>}
          {picker && (
            <ReactionPicker
              reacted={reactions.reacted}
              onPick={r => { reactions.onReact(r); setPicker(false); }}
              onClose={() => setPicker(false)}
            />
          )}
        </Item>
      )}
      <Item>
        <Btn onClick={stop(comments.onOpen)} aria-label={`${HE.COMMENTS_OPEN} (${comments.count})`}>
          <LineIcon name="comment" size={23} strokeWidth={1.9} />
        </Btn>
        {comments.count > 0 && <span aria-hidden="true">{comments.count}</span>}
      </Item>
      {save && (
        <Item>
          <Btn
            $on={save.saved} $tint={theme.game.goldLight} $popping={popping === 'save'}
            onClick={stop(() => { if (!save.saved) flash('save'); save.onToggle(); })}
            aria-pressed={save.saved}
            aria-label={save.saved ? HE.FEED_BOOKMARK_REMOVE : HE.FEED_BOOKMARK_ADD}
          >
            <LineIcon name="bookmark" size={23} strokeWidth={1.9} filled={save.saved} />
          </Btn>
        </Item>
      )}
      <Item>
        <Btn onClick={stop(onShare)} aria-label={HE.FEED_SHARE_TITLE}>
          <LineIcon name="share" size={23} strokeWidth={1.9} />
        </Btn>
      </Item>
      {extra}
    </Rail>
  );
}

export { Btn as RailButton, Item as RailItem };
