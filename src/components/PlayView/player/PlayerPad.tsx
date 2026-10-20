'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayState } from '@/types/play';
import AnswerTile, { Shape } from '../AnswerTile';
import LeadBar from '../LeadBar';
import TimerRing from '../TimerRing';
import { useTicker } from '../usePlayState';
import { Center, Glass, Pill, Sub, Title, popIn, reduced } from '../playStyles';

/** The phone during a question: read → tap one of four → locked in. */
const Wrap = styled.div`flex: 1; display: flex; flex-direction: column; gap: ${theme.spacing.md};`;
const Head = styled.div`display: flex; justify-content: space-between; align-items: center; gap: ${theme.spacing.sm};`;
const Prompt = styled.h2<{ $small: boolean }>`
  margin: 0;
  text-align: center;
  font-family: ${theme.fonts.body};
  font-size: ${({ $small }) => ($small ? theme.fontSizes.lg : theme.fontSizes.h2)};
  line-height: 1.35;
`;
const Body = styled(Glass)<{ $word: boolean }>`
  padding: ${theme.spacing.md};
  font-family: ${theme.fonts.body};
  font-size: ${({ $word }) => ($word ? '2.6rem' : theme.fontSizes.md)};
  color: ${({ $word }) => ($word ? theme.game.gold : theme.game.ink)};
  font-weight: ${({ $word }) => ($word ? 800 : 500)};
  text-align: center;
  line-height: 1.7;
  max-height: 32vh;
  overflow-y: auto;
`;
const Grid = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr;
  grid-auto-rows: minmax(72px, 1fr);
  gap: ${theme.spacing.sm};
  @media (min-width: 560px) { grid-template-columns: 1fr 1fr; }
`;
const Locked = styled.div<{ $color: string }>`
  width: 120px;
  height: 120px;
  border-radius: ${theme.radii.xl};
  background: ${({ $color }) => $color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.game.ink};
  animation: ${popIn} 0.45s ${theme.motion.spring} both;
  ${reduced};
`;

interface Props {
  state: PlayState;
  now: () => number;
  picked: number | null;
  onPick: (choice: number) => void;
}

export default function PlayerPad({ state, now, picked, onPick }: Props) {
  useTicker(true, 200);
  const q = state.question;
  if (!q) return null;
  const t = now();
  const choice = picked ?? state.me?.choice ?? null;
  const open = t >= q.opensAt && t <= q.endsAt;

  if (choice !== null) {
    return (
      <Center>
        <Locked $color={theme.game.answers[choice % 4]}><Shape index={choice} size={56} /></Locked>
        <Title>{HE.PLAY_LOCKED}</Title>
        <Sub role="status">{HE.PLAY_WAIT_OTHERS}</Sub>
        <Pill>{HE.PLAY_ANSWERED(state.answeredCount, state.playerCount)}</Pill>
      </Center>
    );
  }
  if (t > q.endsAt) {
    return <Center><Title>⌛ {HE.PLAY_TIME_UP}</Title><Sub>{HE.PLAY_WAIT_OTHERS}</Sub></Center>;
  }
  return (
    <Wrap>
      <Head>
        <Pill>{HE.PLAY_Q_OF(q.index + 1, state.total)}</Pill>
        {open ? <TimerRing opensAt={q.opensAt} endsAt={q.endsAt} now={now} size={52} /> : <Pill>{HE.PLAY_POINTS(state.me?.score ?? 0)}</Pill>}
      </Head>
      <Prompt $small={open}>{q.prompt}</Prompt>
      {q.body && <Body $word={q.kind === 'gematria'}>{q.body}</Body>}
      {!open ? (
        <LeadBar from={q.shownAt} to={q.opensAt} now={now} label={HE.PLAY_READ_Q} />
      ) : (
        <Grid>
          {q.options.map((o, i) => <AnswerTile key={i} index={i} text={o} onPick={() => onPick(i)} />)}
        </Grid>
      )}
    </Wrap>
  );
}
