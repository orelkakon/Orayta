'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, shuffle,
} from './quizChrome';

type State = 'default' | 'correct' | 'wrong' | 'faded';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const RabbiName = styled.h2`
  font-family: ${theme.fonts.body}; font-size: 1.4rem; font-weight: 700;
  color: ${theme.colors.primary};
`;
const FullName = styled.div`font-size: 0.9rem; color: ${theme.colors.textMuted}; font-style: italic;`;
const BioText = styled.p`
  font-family: ${theme.fonts.body}; font-size: 1rem; line-height: 1.8;
  color: ${theme.colors.text}; overflow-wrap: break-word; word-break: break-word;
  border-right: 4px solid ${theme.colors.secondary}; padding-right: ${theme.spacing.md};
`;
const OptionsGrid = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const OptionBtn = styled.button<{ $state: State; $color: string }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; font-family: ${theme.fonts.body}; text-align: right;
  width: 100%;
  border: 2px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'default' ? $color + '55' : theme.colors.borderLight};
  background: ${({ $state }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : theme.colors.surface};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'faded' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $state }) => $state === 'faded' ? 0.5 : 1};
  cursor: ${({ $state }) => $state === 'default' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'default' ? 'none' : 'auto'};
`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

interface Props { onAnswered: () => void; }

export default function RabbiQuiz({ onAnswered }: Props) {
  const [allRabbis, setAllRabbis] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Rabbi | null>(null);
  const [options, setOptions] = useState<RabbiCategory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAllRabbis(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const loadQuestion = useCallback((list: Rabbi[], excludeIds: string[] = []) => {
    const available = excludeIds.length > 0 ? list.filter(r => !excludeIds.includes(r.id)) : list;
    if (available.length === 0) {
      if (excludeIds.length > 0) setAllDone(true);
      return;
    }
    setAllDone(false);
    const q = available[Math.floor(Math.random() * available.length)];
    const correct = q.category as RabbiCategory;
    const others = shuffle(CATEGORY_ORDER.filter(c => c !== correct)).slice(0, 3);
    setQuestion(q);
    setOptions(shuffle([correct, ...others]));
    setSelected(null);
  }, []);

  useEffect(() => {
    if (allRabbis.length > 0) {
      setSeenIds([]);
      setAllDone(false);
      loadQuestion(allRabbis, []);
    }
  }, [allRabbis, loadQuestion]);

  const handleSelect = (cat: RabbiCategory) => {
    if (selected !== null || !question || !loaded) return;
    setSelected(cat);
    const correct = cat === question.category;
    answerFeedback(correct);
    addStat({ score: correct ? 1 : 0, content: question.name, mode: 'rabbi' });
    setStreak(s => correct ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (selected === question?.category && question) {
      const next = [...seenIds, question.id];
      setSeenIds(next);
      loadQuestion(allRabbis, next);
    } else {
      setSeenIds([]);
      loadQuestion(allRabbis, []);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    loadQuestion(allRabbis, []);
  };

  const getState = (cat: RabbiCategory): State => {
    if (selected === null) return 'default';
    if (cat === question?.category) return 'correct';
    if (cat === selected) return 'wrong';
    return 'faded';
  };

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (allRabbis.length === 0 || !question) return <Wrapper><Empty>{HE.QUIZ_RABBI_NOT_ENOUGH}</Empty></Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); loadQuestion(allRabbis, []); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_RABBI_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={question.id}>
        <div>
          <RabbiName>{question.name}</RabbiName>
          {question.fullName && <FullName>{question.fullName}</FullName>}
        </div>
        <BioText>{question.bio}</BioText>
        <OptionsGrid>
          {options.map(cat => (
            <OptionBtn
              key={cat}
              $state={getState(cat)}
              $color={CATEGORY_COLORS[cat]}
              onClick={() => handleSelect(cat)}
            >
              {CATEGORY_LABELS[cat]}
            </OptionBtn>
          ))}
        </OptionsGrid>
        {selected !== null && (
          <ResultBanner $correct={selected === question.category}>
            {selected === question.category ? HE.QUIZ_CORRECT : HE.QUIZ_WRONG}
          </ResultBanner>
        )}
      </QuestionBlock>
      {selected !== null
        ? <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>
      }
    </Wrapper>
  );
}
