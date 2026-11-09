'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

/**
 * The open book's progress as a gold ring on the night card: units read
 * (solid) and units being read right now (soft), with the percentage inside.
 */
const SIZE = 112;
const STROKE = 10;
const R = (SIZE - STROKE) / 2;
const C = 2 * Math.PI * R;

const Wrap = styled.div`position: relative; width: ${SIZE}px; height: ${SIZE}px; flex: none;`;
const Center = styled.div`
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  & > b { font-size: 1.6rem; font-weight: 800; line-height: 1; font-variant-numeric: tabular-nums; color: ${theme.gilded.nightInk}; }
  & > span { margin-top: 4px; font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.game.goldLight}; }
`;
const Arc = styled.circle`transition: stroke-dashoffset 0.8s ${theme.motion.out};`;

export default function ProgressRing({ done, held, total, round }: { done: number; held: number; total: number; round: number }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  const doneLen = total ? (done / total) * C : 0;
  const heldLen = total ? ((done + held) / total) * C : 0;
  return (
    <Wrap role="img" aria-label={HE.TH_RING_LABEL(pct, round)}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ transform: 'rotate(-90deg) scaleY(-1)' }}>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={theme.gilded.nightTag} strokeWidth={STROKE} />
        <Arc cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={theme.gilded.nightLine} strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - heldLen} />
        <Arc cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke={theme.game.gold} strokeWidth={STROKE}
          strokeLinecap="round" strokeDasharray={C} strokeDashoffset={C - doneLen} />
      </svg>
      <Center aria-hidden="true"><b>{pct}%</b><span>{HE.TH_ROUND(round)}</span></Center>
    </Wrap>
  );
}
