'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';

const BIO_LEN = 200;

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
const Label = styled.div`
  font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;
const BioCard = styled.blockquote`
  font-family: ${theme.fonts.body}; font-size: 1rem; line-height: 1.9;
  color: ${theme.colors.text}; border-right: 4px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md}; margin: 0;
  overflow-wrap: break-word; word-break: break-word;
`;
const OptionsGrid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.sm};
`;
type BtnState = 'idle' | 'correct' | 'wrong' | 'dim';
const OptionBtn = styled.button<{ $st: BtnState; $color: string }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.success : $st === 'wrong' ? theme.colors.error : $color + '55'};
  background: ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.bgSuccess : $st === 'wrong' ? theme.colors.bgError : $color + '0A'};
  color: ${({ $st }) =>
    $st === 'correct' ? theme.colors.success : $st === 'wrong' ? theme.colors.error :
    $st === 'dim' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $st }) => $st === 'dim' ? 0.42 : 1};
  font-size: 0.92rem; font-family: ${theme.fonts.body}; font-weight: 600;
  cursor: ${({ $st }) => $st === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $st }) => $st !== 'idle' ? 'none' : 'auto'};
  transition: all 0.15s; text-align: center; min-height: 60px;
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
  &:active { transform: scale(0.97); }
`;
const Banner = styled.div<{ $ok: boolean }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $ok }) => $ok ? theme.colors.bgSuccess : theme.colors.bgError};
  color: ${({ $ok }) => $ok ? theme.colors.success : theme.colors.error};
  font-weight: 700; text-align: center; animation: ${pop} 0.25s ease;
`;
const RevealCard = styled.div<{ $color: string }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $color }) => $color + '10'}; border: 2px solid ${({ $color }) => $color + '40'};
  display: flex; flex-direction: column; gap: ${theme.spacing.xs}; animation: ${pop} 0.3s ease;
`;
const RevealName = styled.div`
  font-size: 1.1rem; font-weight: 700; color: ${theme.colors.text}; font-family: ${theme.fonts.body};
`;
const RevealMeta = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted};`;
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
const Empty = styled.div`color: ${theme.colors.textMuted};`;

interface Props { onAnswered: () => void; filterCategory?: string; }

export default function BioQuiz({ onAnswered, filterCategory = '' }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Rabbi | null>(null);
  const [options, setOptions] = useState<Rabbi[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback((list: Rabbi[], excludeIds: string[] = [], catFilter = '') => {
    const inCat = catFilter ? list.filter(r => r.category === catFilter) : list;
    if (inCat.length < 4) { setQuestion(null); return; }
    const pool = inCat.filter(r => r.bio.length >= 40 && !excludeIds.includes(r.id));
    if (pool.length === 0) {
      if (excludeIds.length > 0) { setAllDone(true); } else { setQuestion(null); }
      return;
    }
    setAllDone(false);
    const q = pool[Math.floor(Math.random() * pool.length)];
    const others = inCat.filter(r => r.id !== q.id).sort(() => Math.random() - 0.5).slice(0, 3);
    if (others.length < 3) { setQuestion(null); return; }
    setQuestion(q);
    setOptions([q, ...others].sort(() => Math.random() - 0.5));
    setSelected(null);
  }, []);

  useEffect(() => {
    setSeenIds([]);
    setAllDone(false);
    if (all.length >= 4) next(all, [], filterCategory);
  }, [all, filterCategory, next]);

  const pick = (id: string) => {
    if (selected !== null || !question) return;
    setSelected(id);
    const ok = id === question.id;
    addStat({ score: ok ? 1 : 0, content: question.name, mode: 'bio' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (!question) return;
    if (selected === question.id) {
      const nextSeen = [...seenIds, question.id];
      setSeenIds(nextSeen);
      next(all, nextSeen, filterCategory);
    } else {
      setSeenIds([]);
      next(all, [], filterCategory);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    next(all, [], filterCategory);
  };

  const colorOf = (r: Rabbi) => CATEGORY_COLORS[r.category as RabbiCategory] ?? theme.colors.primary;
  const btnState = (r: Rabbi): BtnState => {
    if (!selected) return 'idle';
    if (r.id === question?.id) return 'correct';
    if (r.id === selected) return 'wrong';
    return 'dim';
  };

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); next(all, [], filterCategory); }} /></Wrapper>;
  if (!question || options.length < 4) return <Wrapper><Empty>{HE.QUIZ_BIO_NOT_ENOUGH}</Empty></Wrapper>;

  const answered = selected !== null;
  const isOk = selected === question.id;
  const bio = question.bio.length > BIO_LEN ? question.bio.slice(0, BIO_LEN).trimEnd() + '...' : question.bio;

  return (
    <Wrapper>
      <Top>
        <Label>{HE.QUIZ_BIO_QUESTION}</Label>
        {streak > 0 && <Streak>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>
      <BioCard>{bio}</BioCard>
      <OptionsGrid>
        {options.map(r => (
          <OptionBtn key={r.id} $st={btnState(r)} $color={colorOf(r)} onClick={() => pick(r.id)}>
            {r.name}
          </OptionBtn>
        ))}
      </OptionsGrid>
      {answered && (
        <>
          <Banner $ok={isOk}>{isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}</Banner>
          <RevealCard $color={colorOf(question)}>
            <RevealName>{question.name}{question.fullName ? ` — ${question.fullName}` : ''}</RevealName>
            <RevealMeta>{CATEGORY_LABELS[question.category as RabbiCategory]} · {question.datePeriod}</RevealMeta>
          </RevealCard>
          <NextBtn onClick={handleNext}>{HE.QUIZ_NEXT}</NextBtn>
        </>
      )}
      {!answered && <SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn>}
    </Wrapper>
  );
}
