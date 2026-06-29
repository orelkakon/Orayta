'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';

type Sel = 'A' | 'B' | null;
type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

const pop = keyframes`
  0%   { transform: scale(0.92); opacity: 0; }
  60%  { transform: scale(1.03); }
  100% { transform: scale(1);    opacity: 1; }
`;

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const Top = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const Label = styled.div`
  font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;
const Streak = styled.div`
  background: linear-gradient(135deg, #FF6B35, #FF9F1C);
  color: white; font-size: 0.78rem; font-weight: 800; padding: 3px 12px; border-radius: 20px;
`;
const Prompt = styled.p`text-align: center; font-size: 0.95rem; color: ${theme.colors.textMuted}; margin: 0;`;
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const Card = styled.button<{ $st: CardState; $color: string }>`
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  border: 3px solid ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.success : $st === 'wrong' ? theme.colors.error : $color + '55'};
  background: ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.bgSuccess : $st === 'wrong' ? theme.colors.bgError : $color + '08'};
  opacity: ${({ $st }) => $st === 'dim' ? 0.35 : 1};
  cursor: ${({ $st }) => $st === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $st }) => $st !== 'idle' ? 'none' : 'auto'};
  transition: all 0.18s ease; text-align: right;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm}; min-height: 130px;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 22px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
  &:active { transform: scale(0.97); }
`;
const Tick = styled.div<{ $show: boolean }>`
  font-size: 1.6rem; display: ${({ $show }) => $show ? 'block' : 'none'}; animation: ${pop} 0.25s ease;
`;
const RName = styled.div`
  font-size: 1.05rem; font-weight: 700; color: ${theme.colors.text};
  font-family: ${theme.fonts.body}; line-height: 1.4;
`;
const Badge = styled.span<{ $color: string }>`
  font-size: 0.72rem; font-weight: 700; padding: 2px 9px; border-radius: 12px;
  background: ${({ $color }) => $color + '20'}; color: ${({ $color }) => $color};
  border: 1px solid ${({ $color }) => $color + '44'}; align-self: flex-start;
`;
const Period = styled.div<{ $show: boolean }>`
  font-size: 0.8rem; color: ${theme.colors.textMuted}; font-style: italic;
  opacity: ${({ $show }) => $show ? 1 : 0}; transition: opacity 0.45s ease 0.1s;
`;
const Banner = styled.div<{ $ok: boolean }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $ok }) => $ok ? theme.colors.bgSuccess : theme.colors.bgError};
  color: ${({ $ok }) => $ok ? theme.colors.success : theme.colors.error};
  font-weight: 700; text-align: center; animation: ${pop} 0.25s ease;
`;
const NextBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl}; background: ${theme.colors.primary};
  color: white; border-radius: ${theme.radii.md}; font-size: 1rem; font-weight: 600;
  width: 100%; transition: background 0.15s; &:hover { background: ${theme.colors.primaryLight}; }
`;
const SkipBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md}; border: 1.5px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md}; font-size: 0.9rem; color: ${theme.colors.textMuted};
  align-self: flex-start; transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
`;

interface Props { onAnswered: () => void; }

export default function WhoFirstQuiz({ onAnswered }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [a, setA] = useState<Rabbi | null>(null);
  const [b, setB] = useState<Rabbi | null>(null);
  const [sel, setSel] = useState<Sel>(null);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback((list: Rabbi[], excludeIds: string[] = []) => {
    const available = excludeIds.length > 0 ? list.filter(r => !excludeIds.includes(r.id)) : list;
    if (available.length < 2) {
      if (excludeIds.length > 0) setAllDone(true);
      return;
    }
    setAllDone(false);
    const ra = available[Math.floor(Math.random() * available.length)];
    const catIdx = CATEGORY_ORDER.indexOf(ra.category as RabbiCategory);
    const nearby = available.filter(r => {
      if (r.id === ra.id) return false;
      const idx = CATEGORY_ORDER.indexOf(r.category as RabbiCategory);
      return Math.abs(idx - catIdx) <= 1;
    });
    const pool = nearby.length >= 1 ? nearby : available.filter(r => r.id !== ra.id);
    let rb = pool[Math.floor(Math.random() * pool.length)];
    let tries = 0;
    while (rb.sortYear === ra.sortYear && tries < 30) {
      rb = pool[Math.floor(Math.random() * pool.length)];
      tries++;
    }
    setA(ra); setB(rb); setSel(null);
  }, []);

  useEffect(() => { if (all.length >= 2) next(all, []); }, [all, next]);

  const pick = (choice: Sel) => {
    if (sel !== null || !a || !b || !choice) return;
    setSel(choice);
    const aFirst = a.sortYear < b.sortYear;
    const ok = (choice === 'A' && aFirst) || (choice === 'B' && !aFirst);
    addStat({ score: ok ? 1 : 0, content: `${a.name} vs ${b.name}`, mode: 'who_first' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (!a || !b) return;
    const aFirst = a.sortYear < b.sortYear;
    const isOk = (sel === 'A' && aFirst) || (sel === 'B' && !aFirst);
    if (isOk) {
      const nextSeen = [...seenIds, a.id, b.id];
      setSeenIds(nextSeen);
      next(all, nextSeen);
    } else {
      setSeenIds([]);
      next(all, []);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    next(all, []);
  };

  const colorOf = (r: Rabbi) => CATEGORY_COLORS[r.category as RabbiCategory] ?? theme.colors.primary;
  const stateOf = (which: 'A' | 'B'): CardState => {
    if (!sel || !a || !b) return 'idle';
    const aFirst = a.sortYear < b.sortYear;
    const isEarlier = (which === 'A') === aFirst;
    if (isEarlier) return sel === which ? 'correct' : 'dim';
    return sel === which ? 'wrong' : 'dim';
  };

  const answered = sel !== null;
  const earliest = a && b ? (a.sortYear < b.sortYear ? a : b) : null;
  const aFirst = a && b ? a.sortYear < b.sortYear : false;
  const isOk = answered && ((sel === 'A' && aFirst) || (sel === 'B' && !aFirst));

  if (!loaded) return <Wrapper><Label>{HE.LOADING}</Label></Wrapper>;
  if (!a || !b) return <Wrapper><Label>{HE.QUIZ_WHO_FIRST_NOT_ENOUGH}</Label></Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); next(all, []); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <Label>{HE.QUIZ_WHO_FIRST_QUESTION}</Label>
        {streak > 0 && <Streak>🔥 {HE.QUIZ_WHO_FIRST_STREAK(streak)}</Streak>}
      </Top>
      {!answered && <Prompt>{HE.QUIZ_WHO_FIRST_PROMPT}</Prompt>}
      <Grid>
        {(['A', 'B'] as const).map(which => {
          const r = which === 'A' ? a : b;
          const st = stateOf(which);
          return (
            <Card key={which} $st={st} $color={colorOf(r)} onClick={() => pick(which)}>
              <Tick $show={answered && st !== 'dim'}>{st === 'correct' ? '✅' : '❌'}</Tick>
              <RName>{r.name}</RName>
              <Badge $color={colorOf(r)}>{CATEGORY_LABELS[r.category as RabbiCategory]}</Badge>
              <Period $show={answered}>{r.datePeriod}</Period>
            </Card>
          );
        })}
      </Grid>
      {answered && (
        <>
          <Banner $ok={isOk}>
            {isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}
            {' — '}{earliest?.name} {HE.QUIZ_WHO_FIRST_CAME_FIRST}
          </Banner>
          <NextBtn onClick={handleNext}>{HE.QUIZ_NEXT}</NextBtn>
        </>
      )}
      {!answered && <SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn>}
    </Wrapper>
  );
}
