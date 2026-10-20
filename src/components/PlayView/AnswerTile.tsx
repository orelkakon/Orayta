'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { popIn, press, reduced } from './playStyles';

/**
 * One answer: colour + shape (▲ ◆ ● ■) + text. The shape repeats on every
 * device, so "the blue diamond" means the same thing on the projector and
 * on a phone — and colour is never the only cue.
 */
export type TileState = 'idle' | 'picked' | 'right' | 'wrong' | 'dim';

const PATHS = [
  'M12 3 L22 20 H2 Z',
  'M12 2 L22 12 L12 22 L2 12 Z',
  'M12 2 A10 10 0 1 1 11.99 2 Z',
  'M3 3 H21 V21 H3 Z',
];

export function Shape({ index, size = 24 }: { index: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden focusable="false">
      <path d={PATHS[index % 4]} fill="currentColor" />
    </svg>
  );
}

const Tile = styled.button<{ $color: string; $state: TileState; $big: boolean }>`
  ${press};
  position: relative;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.ms};
  width: 100%;
  min-height: ${({ $big }) => ($big ? '96px' : '72px')};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.radii.lg};
  background: ${({ $color }) => $color};
  color: ${theme.game.ink};
  text-align: right;
  font-family: ${theme.fonts.body};
  font-size: ${({ $big }) => ($big ? 'clamp(1.05rem, 2.4vw, 1.6rem)' : '1.05rem')};
  font-weight: 700;
  line-height: 1.35;
  box-shadow: inset 0 -5px 0 rgba(0,0,0,0.22), 0 8px 22px rgba(0,0,0,0.25);
  overflow-wrap: anywhere;
  &:disabled { opacity: 1; cursor: default; }
  ${({ $state }) => $state === 'dim' && css`opacity: 0.28 !important; filter: saturate(0.4);`}
  ${({ $state }) => $state === 'wrong' && css`opacity: 0.4 !important;`}
  ${({ $state }) => $state === 'picked' && css`
    outline: 4px solid ${theme.game.ink}; outline-offset: 3px;
  `}
  ${({ $state }) => $state === 'right' && css`
    outline: 4px solid ${theme.game.ink}; outline-offset: 3px;
    animation: ${popIn} 0.45s ${theme.motion.spring};
  `}
  ${reduced};
`;

const Glyph = styled.span`
  flex: none;
  display: inline-flex;
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: ${theme.radii.md};
  background: rgba(0,0,0,0.16);
`;

const Mark = styled.span`
  margin-inline-start: auto;
  flex: none;
  font-size: 1.4rem;
`;

const Count = styled.span`
  margin-inline-start: auto;
  flex: none;
  min-width: 2.2em;
  padding: 2px 10px;
  border-radius: 999px;
  background: rgba(0,0,0,0.22);
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.md};
  font-variant-numeric: tabular-nums;
  text-align: center;
`;

interface Props {
  index: number;
  text: string;
  state?: TileState;
  big?: boolean;
  count?: number;
  onPick?: () => void;
}

export default function AnswerTile({ index, text, state = 'idle', big = false, count, onPick }: Props) {
  const color = theme.game.answers[index % 4];
  return (
    <Tile
      type="button"
      $color={color}
      $state={state}
      $big={big}
      disabled={!onPick}
      onClick={onPick}
      aria-label={`${HE.PLAY_SHAPES[index % 4]}: ${text}`}
      aria-pressed={state === 'picked' || undefined}
    >
      <Glyph><Shape index={index} size={big ? 26 : 22} /></Glyph>
      <span>{text}</span>
      {count !== undefined && <Count>{count}</Count>}
      {count === undefined && state === 'right' && <Mark aria-hidden>✓</Mark>}
    </Tile>
  );
}
