'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation, CitationLocation } from '@/types';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn, HintBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, shuffle,
} from './quizChrome';

type OptionState = 'default' | 'correct' | 'wrong' | 'faded' | 'eliminated';

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

const CitationText = styled.blockquote`
  font-family: ${theme.fonts.body};
  font-size: 1.15rem;
  line-height: 1.9;
  color: ${theme.colors.text};
  border-right: 4px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const OptionBtn = styled.button<{ $state: OptionState }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  font-family: ${theme.fonts.body};
  text-align: right;
  width: 100%;
  display: ${({ $state }) => ($state === 'eliminated' ? 'none' : 'block')};
  border: 2px solid ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    theme.colors.border};
  background: ${({ $state }) =>
    $state === 'correct' ? theme.colors.bgSuccess :
    $state === 'wrong' ? theme.colors.bgError :
    theme.colors.surface};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'faded' ? theme.colors.textMuted :
    theme.colors.text};
  opacity: ${({ $state }) => ($state === 'faded' ? 0.5 : 1)};
  cursor: ${({ $state }) => ($state === 'default' ? 'pointer' : 'default')};
  pointer-events: ${({ $state }) => ($state !== 'default' ? 'none' : 'auto')};
  &:hover { border-color: ${theme.colors.primaryLight}; }
`;

interface Props {
  filterSeder: string;
  filterMasechet: string;
  onAnswered: () => void;
}

export default function MultipleChoiceQuiz({ filterSeder, filterMasechet, onAnswered }: Props) {
  const [question, setQuestion] = useState<Citation | null>(null);
  const [options, setOptions] = useState<CitationLocation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [eliminatedId, setEliminatedId] = useState<string | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  const loadQuestion = useCallback(async (excludeIds: string[] = []) => {
    setSelectedId(null);
    setEliminatedId(null);
    setScore(null);
    setNoResults(false);
    setAllDone(false);
    setLoading(true);

    try {
      const params = new URLSearchParams();
      if (filterMasechet) params.set('masechet', filterMasechet);
      else if (filterSeder) params.set('seder', filterSeder);
      excludeIds.forEach(id => params.append('exclude', id));

      const qRes = await fetch(`/api/quiz?${params}`);
      if (qRes.status === 404) {
        if (excludeIds.length > 0) setAllDone(true);
        else setNoResults(true);
        return;
      }
      const citation = await qRes.json() as Citation;

      const oParams = new URLSearchParams({ exclude: citation.id });
      if (filterMasechet) oParams.set('masechet', filterMasechet);
      else if (filterSeder) oParams.set('seder', filterSeder);

      const oRes = await fetch(`/api/quiz/options?${oParams}`);
      if (!oRes.ok) { setNoResults(true); return; }
      const distractors = await oRes.json() as CitationLocation[];

      setQuestion(citation);
      setOptions(shuffle([citation.locations[0], ...distractors]));
    } finally {
      setLoading(false);
    }
  }, [filterSeder, filterMasechet]);

  useEffect(() => {
    setSeenIds([]);
    setAllDone(false);
    void loadQuestion();
  }, [loadQuestion]);

  const handleHint = () => {
    const correctId = question?.locations[0]?.id;
    const wrong = options.find((o) => o.id !== correctId && o.id !== eliminatedId);
    if (wrong) setEliminatedId(wrong.id);
  };

  const handleSelect = async (opt: CitationLocation) => {
    // The loading guard closes the stale-question window: without it the
    // previous question stays clickable during the fetch and scores twice.
    if (selectedId !== null || !question || loading) return;
    setSelectedId(opt.id);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citationId: question.id, masechet: opt.masechet, daf: opt.daf, amud: opt.amud }),
      });
      const result = await res.json() as { score: number };
      const correct = result.score >= 1;
      setScore(result.score);
      answerFeedback(correct);
      addStat({ score: result.score, content: question.content.slice(0, 80), mode: 'multiple' });
      setStreak(s => correct ? s + 1 : 0);
      onAnswered();
    } catch {
      setSelectedId(null);
    }
  };

  const handleNext = () => {
    if (score !== null && score >= 1 && question) {
      const next = [...seenIds, question.id];
      setSeenIds(next);
      void loadQuestion(next);
    } else {
      setSeenIds([]);
      void loadQuestion([]);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    void loadQuestion([]);
  };

  const correctId = question?.locations[0]?.id;

  const getState = (opt: CitationLocation): OptionState => {
    if (opt.id === eliminatedId) return 'eliminated';
    if (selectedId === null) return 'default';
    if (opt.id === correctId) return 'correct';
    if (opt.id === selectedId) return 'wrong';
    return 'faded';
  };

  const formatOption = (loc: CitationLocation) => {
    let s = `${loc.masechet} ${loc.daf}`;
    if (loc.amud) s += ` עמוד ${loc.amud}`;
    return s;
  };

  if (noResults) return <Wrapper>{HE.QUIZ_MC_NOT_ENOUGH}</Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); void loadQuestion([]); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_MC_CHOOSE}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={question?.id ?? 'loading'}>
        <CitationText>{question?.content ?? HE.LOADING}</CitationText>
        {!selectedId && !eliminatedId && !loading && (
          <HintBtn onClick={handleHint}>{HE.QUIZ_HINT_BUTTON}</HintBtn>
        )}
        {options.map((opt) => (
          <OptionBtn key={opt.id} $state={getState(opt)} onClick={() => handleSelect(opt)}>
            {formatOption(opt)}
          </OptionBtn>
        ))}
        {score !== null && (
          <ResultBanner $correct={score >= 1}>
            {score >= 1 ? HE.QUIZ_CORRECT : HE.QUIZ_WRONG}
          </ResultBanner>
        )}
      </QuestionBlock>
      {selectedId !== null ? (
        <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
      ) : (
        <BtnRow>
          <SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn>
        </BtnRow>
      )}
    </Wrapper>
  );
}
