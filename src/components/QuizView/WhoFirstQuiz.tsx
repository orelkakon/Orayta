'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, popIn,
} from './quizChrome';

type Sel = 'A' | 'B' | null;
type CardState = 'idle' | 'correct' | 'wrong' | 'dim';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const Prompt = styled.p`text-align: center; font-size: 0.95rem; color: ${theme.colors.textMuted}; margin: 0;`;
const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
const Card = styled.button<{ $state: CardState; $color: string }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  border: 3px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : $color + '55'};
  background: ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : $color + '08'};
  opacity: ${({ $state }) => $state === 'dim' ? 0.35 : 1};
  cursor: ${({ $state }) => $state === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'idle' ? 'none' : 'auto'};
  text-align: right;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm}; min-height: 130px;
  &:hover { transform: translateY(-3px); box-shadow: 0 8px 22px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
`;
const Tick = styled.div<{ $show: boolean }>`
  font-size: 1.6rem; display: ${({ $show }) => $show ? 'block' : 'none'}; animation: ${popIn} 0.25s ease;
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
const CenterBanner = styled(ResultBanner)`text-align: center;`;

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
    if (sel !== null || !a || !b || !choice || !loaded) return;
    setSel(choice);
    const aFirst = a.sortYear < b.sortYear;
    const ok = (choice === 'A' && aFirst) || (choice === 'B' && !aFirst);
    answerFeedback(ok);
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

  if (!loaded) return <Wrapper><QuestionLabel>{HE.LOADING}</QuestionLabel></Wrapper>;
  if (!a || !b) return <Wrapper><QuestionLabel>{HE.QUIZ_WHO_FIRST_NOT_ENOUGH}</QuestionLabel></Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); next(all, []); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_WHO_FIRST_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_WHO_FIRST_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={`${a.id}-${b.id}`}>
        {!answered && <Prompt>{HE.QUIZ_WHO_FIRST_PROMPT}</Prompt>}
        <Grid>
          {(['A', 'B'] as const).map(which => {
            const r = which === 'A' ? a : b;
            const st = stateOf(which);
            return (
              <Card key={which} $state={st} $color={colorOf(r)} onClick={() => pick(which)}>
                <Tick $show={answered && st !== 'dim'}>{st === 'correct' ? '✅' : '❌'}</Tick>
                <RName>{r.name}</RName>
                <Badge $color={colorOf(r)}>{CATEGORY_LABELS[r.category as RabbiCategory]}</Badge>
                <Period $show={answered}>{r.datePeriod}</Period>
              </Card>
            );
          })}
        </Grid>
        {answered && (
          <CenterBanner $correct={isOk}>
            {isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}
            {' — '}{earliest?.name} {HE.QUIZ_WHO_FIRST_CAME_FIRST}
          </CenterBanner>
        )}
      </QuestionBlock>
      {answered
        ? <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>}
    </Wrapper>
  );
}
