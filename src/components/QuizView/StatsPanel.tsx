'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { getStats, clearStats, computeSummary, StatEntry } from '@/lib/statsStorage';

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
const StatRow = styled.div`
  display: flex; justify-content: space-between;
  font-size: 0.9rem; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xs} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;
const Val = styled.span`font-weight: 700; color: ${theme.colors.text};`;
const Bar = styled.div<{ $pct: number }>`
  height: 8px; border-radius: 4px;
  background: ${theme.colors.borderLight}; overflow: hidden;
  &::after {
    content: ''; display: block; height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${theme.colors.success};
    border-radius: 4px; transition: width 0.5s ease;
  }
`;
const HistoryList = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  max-height: 220px; overflow-y: auto;
`;
const HistoryItem = styled.div<{ $score: number }>`
  font-size: 0.78rem;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  background: ${({ $score }) => $score >= 1 ? '#E8F5E9' : $score > 0 ? '#FFF8E1' : '#FDECEA'};
  color: ${({ $score }) => $score >= 1 ? theme.colors.success : $score > 0 ? '#E65100' : theme.colors.error};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; min-width: 0;
`;
const ResetBtn = styled.button`
  font-size: 0.78rem; color: ${theme.colors.error};
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.radii.sm};
  padding: 3px ${theme.spacing.sm};
  opacity: 0.7; transition: opacity 0.15s;
  &:hover { opacity: 1; background: rgba(155,35,53,0.06); }
`;
const Empty = styled.p`font-size: 0.88rem; color: ${theme.colors.textMuted}; text-align: center;`;

function icon(s: number) { return s >= 1 ? '✓' : s > 0 ? '½' : '✗'; }

interface Props { statsKey: number; }

export default function StatsPanel({ statsKey }: Props) {
  const [entries, setEntries] = useState<StatEntry[]>([]);

  useEffect(() => {
    setEntries(getStats());
  }, [statsKey]);

  const s = computeSummary(entries);

  const handleReset = () => {
    if (!window.confirm(HE.QUIZ_RESET_CONFIRM)) return;
    clearStats();
    setEntries([]);
  };

  return (
    <Card>
      <Title>{HE.QUIZ_STATS_TITLE}</Title>
      {s.total === 0 ? (
        <Empty>{HE.QUIZ_STATS_EMPTY}</Empty>
      ) : (
        <>
          <Bar $pct={s.accuracy} />
          <StatRow><span>{HE.QUIZ_ACCURACY}</span><Val>{s.accuracy}%</Val></StatRow>
          <StatRow><span>{HE.QUIZ_TOTAL}</span><Val>{s.total}</Val></StatRow>
          <StatRow>
            <span>{HE.QUIZ_TOTAL_SCORE}</span>
            <Val>{s.totalScore.toFixed(1)} / {s.total}</Val>
          </StatRow>
          {s.recent.length > 0 && (
            <>
              <Title>{HE.QUIZ_HISTORY}</Title>
              <HistoryList>
                {s.recent.map((r, i) => (
                  <HistoryItem key={i} $score={r.score}>
                    {icon(r.score)} {r.content}
                  </HistoryItem>
                ))}
              </HistoryList>
            </>
          )}
          <ResetBtn onClick={handleReset}>{HE.QUIZ_RESET_STATS}</ResetBtn>
        </>
      )}
    </Card>
  );
}
