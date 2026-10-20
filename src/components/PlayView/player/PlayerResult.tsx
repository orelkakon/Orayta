'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayMe, PlayState } from '@/types/play';
import AnswerTile from '../AnswerTile';
import { playerLayout } from '@/lib/play/scramble';
import { Center, Pill, Sub, Title, popIn, reduced } from '../playStyles';

/** The phone after a question: right/wrong, points, streak, and where you stand. */
const Icon = styled.div<{ $ok: boolean }>`
  width: 108px;
  height: 108px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3.6rem;
  font-weight: 800;
  background: ${({ $ok }) => ($ok ? theme.game.right : theme.game.wrong)};
  color: ${theme.game.ink};
  box-shadow: 0 14px 40px rgba(0,0,0,0.35);
  animation: ${popIn} 0.5s ${theme.motion.spring} both;
  ${reduced};
`;
const Points = styled.div`
  font-size: ${theme.fontSizes.display};
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: ${theme.game.ink};
`;
const Rank = styled.div`font-size: ${theme.fontSizes.xl}; font-weight: 700;`;
const Correct = styled.div`width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

export function resultBackground(state: PlayState): string | undefined {
  if (state.status !== 'reveal' || !state.me) return undefined;
  return state.me.correct ? theme.game.rightBg : theme.game.wrongBg;
}

function Standing({ me }: { me: PlayMe }) {
  return (
    <>
      <Rank>{HE.PLAY_YOUR_RANK(me.rank)}</Rank>
      <Sub>{me.gapUp === null ? HE.PLAY_LEADING : HE.PLAY_GAP_UP(me.gapUp)}</Sub>
      <Pill>{HE.PLAY_POINTS(me.score)}</Pill>
    </>
  );
}

export default function PlayerResult({ state, me }: { state: PlayState; me: PlayMe }) {
  if (state.status === 'board') {
    return <Center><Title>{HE.PLAY_BOARD_TITLE}</Title><Standing me={me} /></Center>;
  }
  const ok = !!me.correct;
  const reveal = state.reveal;
  const q = state.question;
  return (
    <Center>
      <Icon $ok={ok} aria-hidden>{ok ? '✓' : '✕'}</Icon>
      <Title role="status">{ok ? HE.PLAY_RIGHT : me.answered ? HE.PLAY_WRONG : HE.PLAY_NO_ANSWER}</Title>
      {ok && <Points>{HE.PLAY_DELTA(me.points ?? 0)}</Points>}
      {ok && me.streak >= 2 && <Pill>🔥 {HE.PLAY_STREAK(me.streak)}</Pill>}
      {!ok && reveal && q && (
        <Correct>
          <Sub>{HE.PLAY_CORRECT_ANSWER}</Sub>
          <AnswerTile index={playerLayout(me.id, q.index, q.options.length).look[reveal.correct]} text={q.options[reveal.correct]} state="right" />
        </Correct>
      )}
      <Standing me={me} />
    </Center>
  );
}
