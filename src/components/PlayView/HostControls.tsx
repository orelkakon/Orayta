'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayHostAction, PlayState } from '@/types/play';
import { GhostButton, GoldButton } from './playStyles';

/** The one big contextual button at the bottom of the host screen. */
const Bar = styled.div`
  position: sticky;
  bottom: 0;
  z-index: ${theme.z.sticky};
  display: flex;
  justify-content: center;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  padding: ${theme.spacing.md} 0 ${theme.spacing.xs};
  margin-top: ${theme.spacing.lg};
  background: linear-gradient(0deg, ${theme.game.stageSolid} 55%, transparent);
  button:first-child { min-width: min(320px, 100%); }
`;

type Phase = PlayHostAction['action'];

function primary(s: PlayState): { action: Phase; label: string } | null {
  const last = s.current + 1 >= s.total;
  switch (s.status) {
    case 'lobby': return { action: 'start', label: HE.PLAY_START };
    case 'question': return { action: 'reveal', label: HE.PLAY_REVEAL_NOW };
    case 'reveal': return last ? { action: 'next', label: HE.PLAY_FINAL_RESULTS } : { action: 'board', label: HE.PLAY_SHOW_BOARD };
    case 'board': return { action: 'next', label: last ? HE.PLAY_FINAL_RESULTS : HE.PLAY_NEXT_Q };
    default: return null;
  }
}

interface Props {
  state: PlayState;
  busy: boolean;
  onAction: (a: Phase) => void;
  onPlayAgain: () => void;
  onNewGame: () => void;
}

export default function HostControls({ state, busy, onAction, onPlayAgain, onNewGame }: Props) {
  const p = primary(state);
  if (!p) {
    return (
      <Bar>
        <GoldButton type="button" onClick={onPlayAgain} disabled={busy}>{busy ? HE.PLAY_CREATING : HE.PLAY_PLAY_AGAIN}</GoldButton>
        <GhostButton type="button" onClick={onNewGame}>{HE.PLAY_NEW_GAME}</GhostButton>
      </Bar>
    );
  }
  return (
    <Bar>
      <GoldButton
        type="button"
        onClick={() => onAction(p.action)}
        disabled={busy || (p.action === 'start' && state.playerCount === 0)}
      >
        {p.label}
      </GoldButton>
      {state.status === 'reveal' && state.current + 1 < state.total && (
        <GhostButton type="button" onClick={() => onAction('next')} disabled={busy}>{HE.PLAY_NEXT_Q}</GhostButton>
      )}
    </Bar>
  );
}
