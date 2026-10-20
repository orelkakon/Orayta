'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { usePlayState, useWakeLock } from './usePlayState';
import Stage from './stage/Stage';
import PlayNotice from './PlayNotice';
import ReconnectBadge from './ReconnectBadge';
import { GhostButton, Pill, Stage as StageShell } from './playStyles';

/**
 * Read-only projector view — open it on the computer connected to the
 * screen while the host runs the game from a phone. Bigger type, no controls.
 */
const Corner = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;
const Code = styled(Pill)`direction: ltr; font-size: ${theme.fontSizes.lg}; color: ${theme.game.ink};`;
const Brand = styled.strong`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; color: ${theme.game.gold};`;
const Big = styled(StageShell)`
  font-size: 1.1rem;
  @media (min-width: 1200px) { padding: ${theme.spacing.xl} ${theme.spacing.xxl}; }
`;

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen();
  else void document.documentElement.requestFullscreen?.().catch(() => undefined);
}

export default function ScreenView({ code }: { code: string }) {
  const { state, fatal, reconnecting, now } = usePlayState(code, {}, 800);
  useWakeLock(true);
  if (fatal) return <PlayNotice title={HE.PLAY_GAME_GONE} />;
  if (!state) return <StageShell />;
  return (
    <Big>
      <Corner>
        <Brand>{HE.PLAY_TITLE}</Brand>
        <div style={{ display: 'flex', gap: theme.spacing.sm, alignItems: 'center' }}>
          <ReconnectBadge show={reconnecting} />
          {state.status !== 'lobby' && <Code>{HE.PLAY_CODE_SHORT} {state.code}</Code>}
          <GhostButton type="button" onClick={toggleFullscreen}>⛶ {HE.PLAY_FULLSCREEN}</GhostButton>
        </div>
      </Corner>
      <Stage state={state} now={now} />
    </Big>
  );
}
