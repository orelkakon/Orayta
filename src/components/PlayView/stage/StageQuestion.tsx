'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayState } from '@/types/play';
import AnswerTile, { type TileState } from '../AnswerTile';
import TimerRing from '../TimerRing';
import LeadBar from '../LeadBar';
import QuestionImage from '../QuestionImage';
import UrgentGlow from '../UrgentGlow';
import { useTicker } from '../usePlayState';
import { Glass, Pill, reduced, rise } from '../playStyles';

/** The question on the big screen; the same component shows the reveal. */
const Wrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;
const Head = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;
const Pills = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Prompt = styled.h2`
  margin: 0;
  text-align: center;
  font-family: ${theme.fonts.body};
  font-size: clamp(1.5rem, 4vw, 2.6rem);
  line-height: 1.3;
  animation: ${rise} 0.45s ${theme.motion.out} both;
  ${reduced};
`;
const Body = styled(Glass)<{ $word: boolean }>`
  padding: ${theme.spacing.lg};
  text-align: center;
  font-family: ${theme.fonts.body};
  font-size: ${({ $word }) => ($word ? 'clamp(2.6rem, 9vw, 5rem)' : 'clamp(1.1rem, 2.6vw, 1.7rem)')};
  font-weight: ${({ $word }) => ($word ? 800 : 500)};
  line-height: 1.7;
  color: ${({ $word }) => ($word ? theme.game.gold : theme.game.ink)};
  animation: ${rise} 0.5s 0.08s ${theme.motion.out} both;
  ${reduced};
`;
const Tiles = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  margin-top: auto;
  ${theme.media.sm} { grid-template-columns: 1fr; }
`;
const TileIn = styled.div<{ $i: number }>`
  animation: ${rise} 0.4s ${({ $i }) => $i * 70}ms ${theme.motion.out} both;
  ${reduced};
`;
const Explain = styled.div`
  text-align: center;
  color: ${theme.game.inkMuted};
  font-size: ${theme.fontSizes.lg};
  font-family: ${theme.fonts.body};
`;

interface Props { state: PlayState; now: () => number; }

export default function StageQuestion({ state, now }: Props) {
  const q = state.question;
  useTicker(state.status === 'question', 200);
  if (!q) return null;
  const reveal = state.status === 'reveal' ? state.reveal : null;
  const open = state.status === 'question' && now() >= q.opensAt;
  const leading = state.status === 'question' && !open;

  const tileState = (i: number): TileState =>
    !reveal ? 'idle' : i === reveal.correct ? 'right' : 'dim';

  return (
    <Wrap>
      <Head>
        <Pills>
          <Pill>{HE.PLAY_Q_OF(q.index + 1, state.total)}</Pill>
          <Pill>{HE[`PLAY_KIND_${q.kind}`]}</Pill>
        </Pills>
        <Pills>
          <Pill aria-live="polite">{HE.PLAY_ANSWERED(state.answeredCount, state.playerCount)}</Pill>
          {open && <TimerRing opensAt={q.opensAt} endsAt={q.endsAt} now={now} size={64} />}
        </Pills>
      </Head>
      <Prompt key={`p${q.index}`}>{q.prompt}</Prompt>
      {q.image && <QuestionImage key={`i${q.index}`} src={q.image} height="34vh" />}
      {q.body && <Body key={`b${q.index}`} $word={q.kind === 'gematria' || q.kind === 'gematriaWord'}>{q.body}</Body>}
      {leading && <LeadBar from={q.shownAt} to={q.opensAt} now={now} label={HE.PLAY_READ_Q} />}
      {!leading && (
        <Tiles>
          {q.options.map((o, i) => (
            <TileIn key={`${q.index}-${i}`} $i={i}>
              <AnswerTile index={i} text={o} big state={tileState(i)} count={reveal ? reveal.counts[i] : undefined}
                share={reveal ? reveal.counts[i] / Math.max(1, reveal.counts.reduce((a, b) => a + b, 0)) : undefined} />
            </TileIn>
          ))}
        </Tiles>
      )}
      {reveal?.explain && <Explain>{reveal.explain}</Explain>}
      {state.status === 'question' && <UrgentGlow opensAt={q.opensAt} endsAt={q.endsAt} now={now} />}
    </Wrap>
  );
}
