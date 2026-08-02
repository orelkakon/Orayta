'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, shuffle, popIn,
} from './quizChrome';

const BIO_LEN = 200;

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
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
const OptionBtn = styled.button<{ $state: BtnState; $color: string }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : $color + '55'};
  background: ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : $color + '0A'};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error :
    $state === 'dim' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $state }) => $state === 'dim' ? 0.42 : 1};
  font-size: 0.92rem; font-family: ${theme.fonts.body}; font-weight: 600;
  cursor: ${({ $state }) => $state === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'idle' ? 'none' : 'auto'};
  text-align: center; min-height: 60px;
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
`;
const CenterBanner = styled(ResultBanner)`text-align: center;`;
const RevealCard = styled.div<{ $color: string }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $color }) => $color + '10'}; border: 2px solid ${({ $color }) => $color + '40'};
  display: flex; flex-direction: column; gap: ${theme.spacing.xs}; animation: ${popIn} 0.3s ${theme.motion.spring};
`;
const RevealName = styled.div`
  font-size: 1.1rem; font-weight: 700; color: ${theme.colors.text}; font-family: ${theme.fonts.body};
`;
const RevealMeta = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted};`;
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
    const others = shuffle(inCat.filter(r => r.id !== q.id)).slice(0, 3);
    if (others.length < 3) { setQuestion(null); return; }
    setQuestion(q);
    setOptions(shuffle([q, ...others]));
    setSelected(null);
  }, []);

  useEffect(() => {
    setSeenIds([]);
    setAllDone(false);
    setStreak(0);
    if (all.length >= 4) next(all, [], filterCategory);
  }, [all, filterCategory, next]);

  const pick = (id: string) => {
    if (selected !== null || !question || !loaded) return;
    setSelected(id);
    const ok = id === question.id;
    answerFeedback(ok);
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
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); next(all, [], filterCategory); }} /></Wrapper>;
  if (!question || options.length < 4) return <Wrapper><Empty>{HE.QUIZ_BIO_NOT_ENOUGH}</Empty></Wrapper>;

  const answered = selected !== null;
  const isOk = selected === question.id;
  const bio = question.bio.length > BIO_LEN ? question.bio.slice(0, BIO_LEN).trimEnd() + '...' : question.bio;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_BIO_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={question.id}>
        <BioCard>{bio}</BioCard>
        <OptionsGrid>
          {options.map(r => (
            <OptionBtn key={r.id} $state={btnState(r)} $color={colorOf(r)} onClick={() => pick(r.id)}>
              {r.name}
            </OptionBtn>
          ))}
        </OptionsGrid>
        {answered && (
          <>
            <CenterBanner $correct={isOk}>{isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}</CenterBanner>
            <RevealCard $color={colorOf(question)}>
              <RevealName>{question.name}{question.fullName ? ` — ${question.fullName}` : ''}</RevealName>
              <RevealMeta>{CATEGORY_LABELS[question.category as RabbiCategory]} · {question.datePeriod}</RevealMeta>
            </RevealCard>
          </>
        )}
      </QuestionBlock>
      {answered
        ? <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>}
    </Wrapper>
  );
}
