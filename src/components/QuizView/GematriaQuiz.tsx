'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';

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

const QuestionLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const ValueBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.surfaceAlt};
  border-right: 4px solid ${theme.colors.secondary};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.xl};
`;

const ValueText = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 3rem;
  font-weight: 700;
  color: ${theme.colors.primary};
`;

const HintBtn = styled.button`
  align-self: flex-start;
  font-size: 0.85rem;
  color: ${theme.colors.primaryLight};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  transition: all 0.15s;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const HintBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1.2rem;
  font-family: ${theme.fonts.body};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  direction: rtl;
  text-align: center;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const BtnRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const PrimaryBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const SkipBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

const ResultBanner = styled.div<{ $correct: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $correct }) => ($correct ? theme.colors.bgSuccess : theme.colors.bgError)};
  color: ${({ $correct }) => ($correct ? theme.colors.success : theme.colors.error)};
  font-weight: 700;
`;

const AnswersBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const AnswersLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const AnswersText = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem;
  color: ${theme.colors.primary};
  font-weight: 700;
`;

const Empty = styled.div`color: ${theme.colors.textMuted};`;
const Top = styled.div`display: flex; align-items: center; justify-content: space-between;`;
const Streak = styled.div`
  background: linear-gradient(135deg, #FF6B35, #FF9F1C);
  color: white; font-size: 0.78rem; font-weight: 800; padding: 3px 12px; border-radius: 20px;
`;

interface Question { value: number; hint: string; }
interface Result { correct: boolean; answers: string[]; }

interface Props { onAnswered: () => void; }

export default function GematriaQuiz({ onAnswered }: Props) {
  const [question, setQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [seenValues, setSeenValues] = useState<number[]>([]);
  const [allDone, setAllDone] = useState(false);

  const loadQuestion = useCallback(async (excludeValues: number[] = []) => {
    setInput('');
    setResult(null);
    setHintShown(false);
    setNoResults(false);
    setAllDone(false);

    const params = new URLSearchParams();
    excludeValues.forEach(v => params.append('exclude', String(v)));

    const res = await fetch(`/api/quiz/gematria?${params}`);
    if (res.status === 404) {
      if (excludeValues.length > 0) setAllDone(true);
      else setNoResults(true);
      return;
    }
    setQuestion(await res.json() as Question);
  }, []);

  useEffect(() => { void loadQuestion(); }, [loadQuestion]);

  const handleSubmit = async () => {
    if (!question || !input.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/gematria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: question.value, response: input }),
      });
      const data = await res.json() as Result;
      setResult(data);
      addStat({ score: data.correct ? 1 : 0, content: String(question.value), mode: 'gematria' });
      setStreak(s => data.correct ? s + 1 : 0);
      onAnswered();
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (result?.correct && question) {
      const next = [...seenValues, question.value];
      setSeenValues(next);
      void loadQuestion(next);
    } else {
      setSeenValues([]);
      void loadQuestion([]);
    }
  };

  const handleSkip = () => {
    setSeenValues([]);
    setAllDone(false);
    void loadQuestion([]);
  };

  if (noResults) return <Wrapper><Empty>{HE.QUIZ_GEMATRIA_NOT_ENOUGH}</Empty></Wrapper>;
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenValues([]); setAllDone(false); void loadQuestion([]); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_GEMATRIA_QUESTION}</QuestionLabel>
        {streak > 0 && <Streak>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>
      <ValueBox>
        <ValueText>{question?.value ?? HE.LOADING}</ValueText>
      </ValueBox>

      {!result ? (
        <>
          {!hintShown && (
            <HintBtn type="button" onClick={() => setHintShown(true)}>{HE.QUIZ_HINT_BUTTON}</HintBtn>
          )}
          {hintShown && question && (
            <HintBox>{HE.QUIZ_GEMATRIA_HINT_LABEL} {question.hint}</HintBox>
          )}
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={HE.QUIZ_GEMATRIA_PLACEHOLDER}
            disabled={submitting}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
          />
          <BtnRow>
            <PrimaryBtn onClick={handleSubmit} disabled={!input.trim() || submitting}>
              {submitting ? HE.LOADING : HE.QUIZ_GEMATRIA_SUBMIT}
            </PrimaryBtn>
            <SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn>
          </BtnRow>
        </>
      ) : (
        <>
          <ResultBanner $correct={result.correct}>
            {result.correct ? HE.QUIZ_CORRECT : HE.QUIZ_WRONG}
          </ResultBanner>
          <AnswersBox>
            <AnswersLabel>{HE.QUIZ_GEMATRIA_ANSWERS}</AnswersLabel>
            <AnswersText>{result.answers.join(' / ')}</AnswersText>
          </AnswersBox>
          <PrimaryBtn onClick={handleNext}>{HE.QUIZ_NEXT}</PrimaryBtn>
        </>
      )}
    </Wrapper>
  );
}
