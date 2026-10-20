'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { SrsSummary } from '@/types/quizModes';
import { daysUntil } from '@/lib/srs';
import { popIn, pressable } from '../quizChrome';

const R = 40;
const C = 2 * Math.PI * R;

const Box = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  text-align: center; animation: ${popIn} 0.4s ${theme.motion.spring};
`;
const Title = styled.h3`margin: 0; font-size: 1.2rem; color: ${theme.colors.primary};`;
const Sub = styled.p`margin: 0; font-size: 0.9rem; color: ${theme.colors.textMuted};`;
const Ring = styled.svg`
  transform: rotate(-90deg);
  circle { fill: none; stroke-width: 9; }
  circle:last-child { stroke-linecap: round; transition: stroke-dashoffset 0.9s ${theme.motion.out}; }
`;
const RingWrap = styled.div`position: relative; width: 104px; height: 104px;`;
const RingText = styled.div`
  position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
  font-size: 1.3rem; font-weight: 800; color: ${theme.colors.text};
  span { font-size: 0.66rem; font-weight: 600; color: ${theme.colors.textMuted}; }
`;
const Legend = styled.div`display: flex; gap: ${theme.spacing.md}; flex-wrap: wrap; justify-content: center; font-size: 0.8rem; color: ${theme.colors.textMuted};`;
const Swatch = styled.i<{ $c: string }>`display: inline-block; width: 9px; height: 9px; border-radius: 50%; background: ${({ $c }) => $c}; margin-inline-end: 4px;`;
const Row = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap; justify-content: center;`;
const Btn = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  ${pressable};
  padding: ${theme.spacing.sm} ${theme.spacing.lg}; border-radius: ${theme.radii.md}; font-weight: 700; font-size: 0.9rem;
  background: ${({ $primary }) => ($primary ? theme.colors.primary : 'transparent')};
  color: ${({ $primary, $danger }) => ($primary ? theme.colors.onPrimary : $danger ? theme.colors.error : theme.colors.textMuted)};
  border: 1px solid ${({ $primary, $danger }) => ($primary ? theme.colors.primary : $danger ? theme.colors.error : theme.colors.border)};
`;

interface Props {
  summary: SrsSummary;
  total: number;
  reviewed: number;
  knewPct: number;
  canAddMore: boolean;
  onMore: () => void;
  onReset: () => void;
}

export default function ReviewDone({ summary, total, reviewed, knewPct, canAddMore, onMore, onReset }: Props) {
  const [confirm, setConfirm] = useState(false);
  const unseen = Math.max(0, total - summary.learning - summary.mastered);
  const pct = total ? Math.round((summary.mastered / total) * 100) : 0;
  const when = summary.nextDue === null ? null : HE.QUIZ_REVIEW_IN(daysUntil(summary.nextDue, Date.now()));

  return (
    <Box role="status">
      <Title>{HE.QUIZ_REVIEW_DONE_TITLE}</Title>
      {reviewed > 0 && <Sub>{HE.QUIZ_REVIEW_DONE_SUB(reviewed, knewPct)}</Sub>}
      <RingWrap>
        <Ring width="104" height="104" viewBox="0 0 104 104" aria-hidden="true">
          <circle cx="52" cy="52" r={R} stroke={theme.colors.borderLight} />
          <circle cx="52" cy="52" r={R} stroke={theme.colors.success} strokeDasharray={C} strokeDashoffset={C * (1 - pct / 100)} />
        </Ring>
        <RingText>{pct}%<span>{HE.QUIZ_REVIEW_MASTERED}</span></RingText>
      </RingWrap>
      <Legend>
        <span><Swatch $c={theme.colors.success} />{HE.QUIZ_REVIEW_MASTERED}: {summary.mastered}</span>
        <span><Swatch $c={theme.colors.accent} />{HE.QUIZ_REVIEW_LEARNING}: {summary.learning}</span>
        <span><Swatch $c={theme.colors.border} />{HE.QUIZ_REVIEW_UNSEEN}: {unseen}</span>
      </Legend>
      <Sub>{when ? HE.QUIZ_REVIEW_NEXT_DUE(when) : HE.QUIZ_REVIEW_NOTHING_SCHEDULED}</Sub>
      <Row>
        {canAddMore && <Btn type="button" $primary onClick={onMore}>{HE.QUIZ_REVIEW_MORE}</Btn>}
        {confirm ? (
          <>
            <Sub>{HE.QUIZ_REVIEW_RESET_CONFIRM}</Sub>
            <Btn type="button" $danger onClick={() => { setConfirm(false); onReset(); }}>{HE.QUIZ_REVIEW_RESET_YES}</Btn>
            <Btn type="button" onClick={() => setConfirm(false)}>{HE.CANCEL}</Btn>
          </>
        ) : (
          (summary.learning + summary.mastered > 0) && <Btn type="button" $danger onClick={() => setConfirm(true)}>{HE.QUIZ_REVIEW_RESET}</Btn>
        )}
      </Row>
    </Box>
  );
}
