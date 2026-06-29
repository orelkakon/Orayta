'use client';

import { useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';

const SEDER_COLORS: Record<string, string> = {
  'סדר זרעים':  '#2D5A3D',
  'סדר מועד':   '#1A5C8A',
  'סדר נשים':   '#9B2335',
  'סדר נזיקין': '#7A3B10',
  'סדר קדשים':  '#4A2C6B',
  'סדר טהרות':  '#2D6A4F',
};

const pop = keyframes`
  0%   { transform: scale(0.92); opacity: 0; }
  60%  { transform: scale(1.04); }
  100% { transform: scale(1);    opacity: 1; }
`;

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
const Label = styled.div`
  font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
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
const SederBtn = styled.button<{ $st: BtnState; $color: string }>`
  padding: ${theme.spacing.md} ${theme.spacing.sm}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.success : $st === 'wrong' ? theme.colors.error : $color + '60'};
  background: ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.bgSuccess : $st === 'wrong' ? theme.colors.bgError : $color + '10'};
  color: ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.success : $st === 'wrong' ? theme.colors.error :
    $st === 'dim' ? theme.colors.textMuted : $color};
  opacity: ${({ $st }) => $st === 'dim' ? 0.4 : 1};
  font-size: 0.9rem; font-weight: 700; font-family: ${theme.fonts.body};
  cursor: ${({ $st }) => $st === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $st }) => $st !== 'idle' ? 'none' : 'auto'};
  transition: all 0.15s;
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
  &:active { transform: scale(0.97); }
`;
const Banner = styled.div<{ $ok: boolean }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $ok }) => $ok ? theme.colors.bgSuccess : theme.colors.bgError};
  color: ${({ $ok }) => $ok ? theme.colors.success : theme.colors.error};
  font-weight: 700; text-align: center; font-size: 1rem; animation: ${pop} 0.25s ease;
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
const Top = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const Streak = styled.div`
  background: linear-gradient(135deg, #FF6B35, #FF9F1C);
  color: white; font-size: 0.78rem; font-weight: 800; padding: 3px 12px; border-radius: 20px;
`;

interface Props { onAnswered: () => void; }
type Masechet = { name: string; seder: string };

function pickMasechet(exclude: string[]): Masechet {
  const available = MASECHTOT.filter(m => !exclude.includes(m.name));
  if (available.length === 0) return MASECHTOT[0];
  return available[Math.floor(Math.random() * available.length)];
}

export default function SederQuiz({ onAnswered }: Props) {
  const [masechet, setMasechet] = useState<Masechet>(() => pickMasechet([]));
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [seenNames, setSeenNames] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  const next = useCallback((excludeNames: string[]) => {
    const available = MASECHTOT.filter(m => !excludeNames.includes(m.name));
    if (available.length === 0) { setAllDone(true); return; }
    setAllDone(false);
    setMasechet(available[Math.floor(Math.random() * available.length)]);
    setSelected(null);
  }, []);

  const pick = (seder: string) => {
    if (selected !== null) return;
    setSelected(seder);
    const ok = seder === masechet.seder;
    addStat({ score: ok ? 1 : 0, content: masechet.name, mode: 'seder' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
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
      <AllDoneCard onReset={() => { setSeenNames([]); setAllDone(false); next([]); }} />
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
        <Label>{HE.QUIZ_SEDER_QUESTION}</Label>
        {streak > 0 && <Streak>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>
      <MasechetCard>
        <MasechetName>{masechet.name}</MasechetName>
        {answered && <MasechetSub>{masechet.seder} · {countInSeder} מסכתות</MasechetSub>}
      </MasechetCard>
      <OptionsGrid>
        {SEDARIM.map(s => {
          const color = SEDER_COLORS[s] ?? theme.colors.primary;
          return (
            <SederBtn key={s} $st={btnState(s)} $color={color} onClick={() => pick(s)}>
              {s.replace('סדר ', '')}
            </SederBtn>
          );
        })}
      </OptionsGrid>
      {answered && (
        <>
          <Banner $ok={isOk}>
            {isOk ? `✓ ${HE.QUIZ_CORRECT} — ${masechet.seder}` : `✗ ${HE.QUIZ_WRONG} — ${masechet.seder}`}
          </Banner>
          <NextBtn onClick={handleNext}>{HE.QUIZ_NEXT}</NextBtn>
        </>
      )}
      {!answered && <SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn>}
    </Wrapper>
  );
}
