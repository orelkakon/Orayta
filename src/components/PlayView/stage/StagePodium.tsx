'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayBoardEntry } from '@/types/play';
import { Title, popIn, reduced, rise } from '../playStyles';
import Confetti from '../Confetti';

/** Final podium: 2nd · 1st · 3rd rising in turn, then the rest of the top 10. */
const grow = keyframes`from { transform: scaleY(0); } to { transform: scaleY(1); }`;
const beam = keyframes`
  0% { opacity: 0; }
  60% { opacity: 0.9; }
  100% { opacity: 0.65; }
`;
const Spotlight = styled.div`
  position: absolute;
  inset: -40% -30% 0;
  background: radial-gradient(50% 60% at 50% 30%, ${theme.game.goldGlow}, transparent 70%);
  animation: ${beam} 1.4s 1.6s ease-out both;
  pointer-events: none;
  ${reduced};
`;

const Wrap = styled.div`
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
`;
const Podium = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: ${theme.spacing.md};
  width: 100%;
  min-height: 300px;
`;
const Col = styled.div<{ $delay: number }>`
  position: relative;
  flex: 1;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.xs};
  .who { animation: ${popIn} 0.5s ${({ $delay }) => $delay + 0.5}s ${theme.motion.spring} both; ${reduced}; text-align: center; }
`;
const Block = styled.div<{ $h: number; $delay: number; $place: number }>`
  width: 100%;
  height: ${({ $h }) => $h}px;
  border-radius: ${theme.radii.lg} ${theme.radii.lg} 0 0;
  background: ${({ $place }) => ($place === 1
    ? `linear-gradient(180deg, ${theme.game.gold}, ${theme.game.goldDeep})`
    : theme.game.glassHi)};
  border: 1px solid ${theme.game.glassLine};
  transform-origin: bottom;
  animation: ${grow} 0.7s ${({ $delay }) => $delay}s ${theme.motion.out} both;
  display: flex;
  justify-content: center;
  padding-top: ${theme.spacing.sm};
  font-size: 2.2rem;
  font-weight: 800;
  color: ${({ $place }) => ($place === 1 ? theme.game.onGold : theme.game.ink)};
  ${reduced};
`;
const Who = styled.div`font-size: ${theme.fontSizes.lg}; font-weight: 700; word-break: break-word;`;
const Pts = styled.div`color: ${theme.game.inkMuted}; font-variant-numeric: tabular-nums;`;
const Rest = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  li {
    display: flex;
    gap: ${theme.spacing.ms};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.md};
    background: ${theme.game.glass};
    animation: ${rise} 0.4s 2.2s both;
    ${reduced};
  }
  span:nth-child(3) { flex: 1; }
`;

const MEDAL = ['🥇', '🥈', '🥉'];
const SLOTS = [{ place: 2, h: 150, delay: 0.6 }, { place: 1, h: 210, delay: 1.2 }, { place: 3, h: 110, delay: 0 }];

export default function StagePodium({ board }: { board: PlayBoardEntry[] }) {
  return (
    <Wrap>
      <Confetti />
      <Title>{HE.PLAY_PODIUM_TITLE}</Title>
      <Podium>
        {SLOTS.map(({ place, h, delay }) => {
          const p = board[place - 1];
          if (!p) return <Col key={place} $delay={delay} />;
          return (
            <Col key={place} $delay={delay}>
              {place === 1 && <Spotlight aria-hidden />}
              <div className="who">
                <div style={{ fontSize: '2.4rem' }} aria-hidden>{p.avatar}</div>
                <Who>{MEDAL[place - 1]} {p.name}</Who>
                <Pts>{HE.PLAY_POINTS(p.score)}</Pts>
              </div>
              <Block $h={h} $delay={delay} $place={place}>{place}</Block>
            </Col>
          );
        })}
      </Podium>
      {board.length > 3 && (
        <Rest>
          {board.slice(3).map(p => (
            <li key={p.id}><span>{p.rank}</span><span aria-hidden>{p.avatar}</span><span>{p.name}</span><span>{p.score.toLocaleString('he-IL')}</span></li>
          ))}
        </Rest>
      )}
    </Wrap>
  );
}
