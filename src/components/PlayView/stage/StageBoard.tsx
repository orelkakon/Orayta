'use client';

import { useLayoutEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { PlayBoardEntry } from '@/types/play';
import { Glass, Title, reduced, rise } from '../playStyles';

/**
 * Leaderboard after a question. Rows start where they stood before this
 * question and glide to their new place (FLIP from known ranks), with the
 * points just earned flashing beside the score.
 */
const ROW = 64;
const GAP = 10;
const SHOW = 5;

const Wrap = styled.div`
  flex: 1;
  width: 100%;
  max-width: 760px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;
const List = styled.ol<{ $n: number }>`
  position: relative;
  list-style: none;
  margin: 0;
  padding: 0;
  height: ${({ $n }) => $n * (ROW + GAP)}px;
`;
const Row = styled(Glass).attrs({ as: 'li' })<{ $lead: boolean }>`
  position: absolute;
  inset-inline: 0;
  height: ${ROW}px;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.ms};
  padding: 0 ${theme.spacing.lg};
  border-radius: ${theme.radii.lg};
  background: ${({ $lead }) => ($lead ? `linear-gradient(90deg, rgba(232,203,118,0.22), ${theme.game.glass})` : theme.game.glass)};
  border-color: ${({ $lead }) => ($lead ? theme.game.gold : theme.game.glassLine)};
  transition: transform 0.8s ${theme.motion.out};
  ${reduced};
`;
const Rank = styled.span`
  width: 2em;
  font-weight: 800;
  font-size: ${theme.fontSizes.xl};
  color: ${theme.game.gold};
  font-variant-numeric: tabular-nums;
`;
const Name = styled.span`
  flex: 1;
  min-width: 0;
  font-size: ${theme.fontSizes.lg};
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const Score = styled.span`
  font-weight: 800;
  font-size: ${theme.fontSizes.lg};
  font-variant-numeric: tabular-nums;
`;
const Delta = styled.span`
  font-size: ${theme.fontSizes.sm};
  font-weight: 700;
  color: ${theme.game.right};
  animation: ${rise} 0.5s 0.6s ${theme.motion.out} both;
  ${reduced};
`;

export default function StageBoard({ board }: { board: PlayBoardEntry[] }) {
  const rows = board.slice(0, SHOW);
  const refs = useRef<(HTMLLIElement | null)[]>([]);
  const prevIndex = [...board]
    .sort((a, b) => a.prevRank - b.prevRank)
    .reduce<Record<string, number>>((m, r, i) => ({ ...m, [r.id]: i }), {});

  useLayoutEffect(() => {
    rows.forEach((r, i) => {
      const el = refs.current[i];
      if (!el) return;
      const from = Math.min(prevIndex[r.id] ?? i, SHOW);
      el.style.transition = 'none';
      el.style.transform = `translateY(${from * (ROW + GAP)}px)`;
      void el.offsetHeight;
      el.style.transition = '';
      el.style.transform = `translateY(${i * (ROW + GAP)}px)`;
    });
    // Animate once per board (rows identity is stable for a given board).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [board]);

  return (
    <Wrap>
      <Title style={{ textAlign: 'center' }}>{HE.PLAY_BOARD_TITLE}</Title>
      <List $n={rows.length}>
        {rows.map((r, i) => (
          <Row key={r.id} ref={(el: HTMLLIElement | null) => { refs.current[i] = el; }} $lead={i === 0}>
            <Rank>{r.rank}</Rank>
            <span aria-hidden style={{ fontSize: '1.6rem' }}>{r.avatar}</span>
            <Name>{r.name}</Name>
            {r.delta > 0 && <Delta>{HE.PLAY_DELTA(r.delta)}</Delta>}
            <Score>{r.score.toLocaleString('he-IL')}</Score>
          </Row>
        ))}
      </List>
    </Wrap>
  );
}
