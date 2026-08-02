'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone,
} from './quizChrome';

const SEDER_COLORS: Record<string, string> = {
  'סדר זרעים':  '#2D5A3D',
  'סדר מועד':   '#1A5C8A',
  'סדר נשים':   '#9B2335',
  'סדר נזיקין': '#7A3B10',
  'סדר קדשים':  '#4A2C6B',
  'סדר טהרות':  '#2D6A4F',
};

const Wrapper = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  min-width: 0;
`;
const MasechetCard = styled.div`
  background: linear-gradient(135deg, ${theme.colors.primary}10, ${theme.colors.secondary}18);
  border: 2px solid ${theme.colors.primary}30;
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl} ${theme.spacing.xxl};
  text-align: center;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.xs};
`;
const MasechetName = styled.div`
  font-size: 2.2rem; font-weight: 800; color: ${theme.colors.primary};
  font-family: ${theme.fonts.body}; letter-spacing: -0.01em;
`;
const MasechetSub = styled.div`
  font-size: 0.82rem; color: ${theme.colors.textMuted}; font-style: italic;
`;
const OptionsGrid = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 400px) { grid-template-columns: repeat(2, 1fr); }
`;
type BtnState = 'idle' | 'correct' | 'wrong' | 'dim';
const SederBtn = styled.button<{ $state: BtnState; $color: string }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md} ${theme.spacing.sm}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : $color + '60'};
  background: ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : $color + '10'};
  color: ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error :
    $state === 'dim' ? theme.colors.textMuted : $color};
  opacity: ${({ $state }) => $state === 'dim' ? 0.4 : 1};
  font-size: 0.9rem; font-weight: 700; font-family: ${theme.fonts.body};
  cursor: ${({ $state }) => $state === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'idle' ? 'none' : 'auto'};
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
`;
const CenterBanner = styled(ResultBanner)`text-align: center; font-size: 1rem;`;

interface Props { onAnswered: () => void; }
type Masechet = { name: string; seder: string };

function pickMasechet(exclude: string[]): Masechet {
  const available = MASECHTOT.filter(m => !exclude.includes(m.name));
  if (available.length === 0) return MASECHTOT[0];
  return available[Math.floor(Math.random() * available.length)];
}

export default function SederQuiz({ onAnswered }: Props) {
  // Picked in an effect (not useState initializer) — Math.random during SSR
  // render produced a hydration mismatch.
  const [masechet, setMasechet] = useState<Masechet | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [seenNames, setSeenNames] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => { setMasechet(pickMasechet([])); }, []);

  const next = useCallback((excludeNames: string[]) => {
    const available = MASECHTOT.filter(m => !excludeNames.includes(m.name));
    if (available.length === 0) { setAllDone(true); return; }
    setAllDone(false);
    setMasechet(available[Math.floor(Math.random() * available.length)]);
    setSelected(null);
  }, []);

  const pick = (seder: string) => {
    if (selected !== null || !masechet) return;
    setSelected(seder);
    const ok = seder === masechet.seder;
    answerFeedback(ok);
    addStat({ score: ok ? 1 : 0, content: masechet.name, mode: 'seder' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (!masechet) return;
    if (selected === masechet.seder) {
      const nextSeen = [...seenNames, masechet.name];
      setSeenNames(nextSeen);
      next(nextSeen);
    } else {
      setSeenNames([]);
      next([]);
    }
  };

  const handleSkip = () => {
    setSeenNames([]);
    setAllDone(false);
    next([]);
  };

  if (allDone) return (
    <Wrapper>
      <AllDoneCard onReset={() => { setSeenNames([]); setAllDone(false); setStreak(0); next([]); }} />
    </Wrapper>
  );

  if (!masechet) return (
    <Wrapper>
      <Top><QuestionLabel>{HE.QUIZ_SEDER_QUESTION}</QuestionLabel></Top>
    </Wrapper>
  );

  const answered = selected !== null;
  const isOk = selected === masechet.seder;
  const countInSeder = MASECHTOT.filter(m => m.seder === masechet.seder).length;
  const btnState = (seder: string): BtnState => {
    if (!answered) return 'idle';
    if (seder === masechet.seder) return 'correct';
    if (seder === selected) return 'wrong';
    return 'dim';
  };

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_SEDER_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={masechet.name}>
        <MasechetCard>
          <MasechetName>{masechet.name}</MasechetName>
          {answered && <MasechetSub>{masechet.seder} · {countInSeder} מסכתות</MasechetSub>}
        </MasechetCard>
        <OptionsGrid>
          {SEDARIM.map(s => {
            const color = SEDER_COLORS[s] ?? theme.colors.primary;
            return (
              <SederBtn key={s} $state={btnState(s)} $color={color} onClick={() => pick(s)}>
                {s.replace('סדר ', '')}
              </SederBtn>
            );
          })}
        </OptionsGrid>
        {answered && (
          <CenterBanner $correct={isOk}>
            {isOk ? `✓ ${HE.QUIZ_CORRECT} — ${masechet.seder}` : `✗ ${HE.QUIZ_WRONG} — ${masechet.seder}`}
          </CenterBanner>
        )}
      </QuestionBlock>
      {answered
        ? <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>}
    </Wrapper>
  );
}
