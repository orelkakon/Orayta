'use client';

import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { getStats, clearStats, computeSummary, StatEntry } from '@/lib/statsStorage';
import { popIn } from './quizChrome';

const RING_R = 34;
const RING_C = 2 * Math.PI * RING_R;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  height: fit-content;
  min-width: 0;
`;
const Title = styled.h3`font-size: 1rem; color: ${theme.colors.primary};`;
const SubTitle = styled.h4`
  font-size: 0.78rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;

const RingWrap = styled.div`
  position: relative; align-self: center;
  width: 92px; height: 92px;
`;
const RingSvg = styled.svg`
  transform: rotate(-90deg);
  circle { fill: none; stroke-width: 8; }
  circle:last-child {
    stroke-linecap: round;
    transition: stroke-dashoffset 0.8s ${theme.motion.out}, stroke 0.3s ease;
  }
`;
const RingCenter = styled.div`
  position: absolute; inset: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  line-height: 1.1;
`;
const RingPct = styled.span`font-size: 1.25rem; font-weight: 800; color: ${theme.colors.text};`;
const RingLabel = styled.span`font-size: 0.62rem; color: ${theme.colors.textMuted}; font-weight: 600;`;

const ChipRow = styled.div`display: flex; gap: ${theme.spacing.sm}; justify-content: center; flex-wrap: wrap;`;
const Chip = styled.div<{ $hot?: boolean }>`
  display: flex; align-items: center; gap: 4px;
  font-size: 0.72rem; font-weight: 700;
  padding: 3px 10px; border-radius: 20px;
  animation: ${popIn} 0.3s ${theme.motion.spring};
  background: ${({ $hot }) => ($hot ? 'linear-gradient(135deg, #FF6B35, #FF9F1C)' : theme.colors.surfaceAlt)};
  color: ${({ $hot }) => ($hot ? '#3A1A00' : theme.colors.textMuted)};
`;

const StatRow = styled.div`
  display: flex; justify-content: space-between;
  font-size: 0.9rem; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xs} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const Val = styled.span`font-weight: 700; color: ${theme.colors.text};`;
const HistoryList = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  max-height: 220px; overflow-y: auto;
`;
const HistoryItem = styled.div<{ $score: number }>`
  font-size: 0.78rem;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  background: ${({ $score }) => $score >= 1 ? theme.colors.bgSuccess : $score > 0 ? theme.colors.bgWarning : theme.colors.bgError};
  color: ${({ $score }) => $score >= 1 ? theme.colors.success : $score > 0 ? '#E65100' : theme.colors.error};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
`;
const ResetRow = styled.div`display: flex; gap: ${theme.spacing.sm}; align-items: center; flex-wrap: wrap;`;
const ResetBtn = styled.button<{ $danger?: boolean }>`
  font-size: 0.78rem;
  color: ${({ $danger }) => ($danger ? theme.colors.onPrimary : theme.colors.error)};
  border: 1px solid ${theme.colors.error};
  background: ${({ $danger }) => ($danger ? theme.colors.error : 'transparent')};
  border-radius: ${theme.radii.sm};
  padding: 3px ${theme.spacing.sm};
  opacity: 0.85;
  transition: opacity ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { opacity: 1; }
  &:active { transform: scale(0.95); }
`;
const CancelBtn = styled.button`
  font-size: 0.78rem; color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: 3px ${theme.spacing.sm};
  &:hover { color: ${theme.colors.text}; }
`;
const ConfirmText = styled.span`font-size: 0.75rem; color: ${theme.colors.error}; font-weight: 600;`;
const Empty = styled.p`font-size: 0.88rem; color: ${theme.colors.textMuted}; text-align: center;`;

function icon(s: number) { return s >= 1 ? '✓' : s > 0 ? '½' : '✗'; }

function ringColor(pct: number) {
  if (pct >= 70) return theme.colors.success;
  if (pct >= 40) return '#E65100';
  return theme.colors.error;
}

/** Count up towards `target` with rAF; snaps instantly under reduced motion. */
function useCountUp(target: number): number {
  const [shown, setShown] = useState(target);
  const prev = useRef(target);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    if (from === target) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(target); return; }
    const start = performance.now();
    const dur = 600;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      setShown(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return shown;
}

interface Props { statsKey: number; }

export default function StatsPanel({ statsKey }: Props) {
  const [entries, setEntries] = useState<StatEntry[]>([]);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => { setEntries(getStats()); }, [statsKey]);

  const s = computeSummary(entries);
  const shownPct = useCountUp(s.accuracy);

  const handleReset = () => {
    clearStats();
    setEntries([]);
    setConfirming(false);
  };

  return (
    <Card>
      <Title>{HE.QUIZ_STATS_TITLE}</Title>
      {s.total === 0 ? (
        <Empty>{HE.QUIZ_STATS_EMPTY}</Empty>
      ) : (
        <>
          <RingWrap>
            <RingSvg width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
              <circle cx="46" cy="46" r={RING_R} stroke={theme.colors.borderLight} />
              <circle
                cx="46" cy="46" r={RING_R}
                stroke={ringColor(s.accuracy)}
                strokeDasharray={RING_C}
                strokeDashoffset={RING_C * (1 - s.accuracy / 100)}
              />
            </RingSvg>
            <RingCenter>
              <RingPct>{shownPct}%</RingPct>
              <RingLabel>{HE.QUIZ_ACCURACY}</RingLabel>
            </RingCenter>
          </RingWrap>
          <ChipRow>
            {s.today > 0 && <Chip key={`t${s.today}`}>☀ {HE.QUIZ_TODAY}: {s.today}</Chip>}
            {s.dayStreak >= 2 && <Chip key={`d${s.dayStreak}`} $hot>🔥 {s.dayStreak} {HE.QUIZ_DAY_STREAK}</Chip>}
          </ChipRow>
          <StatRow><span>{HE.QUIZ_TOTAL}</span><Val>{s.total}</Val></StatRow>
          <StatRow>
            <span>{HE.QUIZ_TOTAL_SCORE}</span>
            <Val>{Math.round(s.totalScore)} / {s.total}</Val>
          </StatRow>
          {s.recent.length > 0 && (
            <>
              <SubTitle>{HE.QUIZ_HISTORY}</SubTitle>
              <HistoryList>
                {s.recent.map((r, i) => (
                  <HistoryItem key={i} $score={r.score}>
                    {icon(r.score)} {r.content}
                  </HistoryItem>
                ))}
              </HistoryList>
            </>
          )}
          {confirming ? (
            <ResetRow>
              <ConfirmText>{HE.QUIZ_RESET_CONFIRM}</ConfirmText>
              <ResetBtn $danger onClick={handleReset}>{HE.QUIZ_RESET_YES}</ResetBtn>
              <CancelBtn onClick={() => setConfirming(false)}>{HE.CANCEL}</CancelBtn>
            </ResetRow>
          ) : (
            <ResetRow>
              <ResetBtn onClick={() => setConfirming(true)}>{HE.QUIZ_RESET_STATS}</ResetBtn>
            </ResetRow>
          )}
        </>
      )}
    </Card>
  );
}
