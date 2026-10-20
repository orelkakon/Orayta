'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayState } from '@/types/play';
import { GhostButton, Pill } from './playStyles';
import ReconnectBadge from './ReconnectBadge';

/** Host header: game code, player count and the secondary tools. */
const Bar = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  margin-bottom: ${theme.spacing.lg};
`;
const Side = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Brand = styled.strong`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.game.gold};`;
const Code = styled(Pill)`direction: ltr; color: ${theme.game.ink}; font-size: ${theme.fontSizes.md};`;

type Kind = 'remote' | 'screen' | 'players' | 'end';

export default function HostTopBar({ state, reconnecting, onOpen }: { state: PlayState; reconnecting: boolean; onOpen: (k: Kind) => void }) {
  return (
    <Bar>
      <Side>
        <Brand>{HE.PLAY_TITLE}</Brand>
        {state.status !== 'lobby' && <Code>{HE.PLAY_CODE_SHORT} {state.code}</Code>}
        <ReconnectBadge show={reconnecting} />
      </Side>
      <Side>
        <GhostButton type="button" onClick={() => onOpen('players')}>👥 {state.playerCount}</GhostButton>
        <GhostButton type="button" onClick={() => onOpen('screen')}>🖥️ {HE.PLAY_OPEN_SCREEN}</GhostButton>
        <GhostButton type="button" onClick={() => onOpen('remote')}>📱 {HE.PLAY_REMOTE}</GhostButton>
        {state.status !== 'ended' && <GhostButton type="button" onClick={() => onOpen('end')}>{HE.PLAY_END}</GhostButton>}
      </Side>
    </Bar>
  );
}
