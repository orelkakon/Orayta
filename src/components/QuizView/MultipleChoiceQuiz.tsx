'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation, CitationLocation } from '@/types';

type OptionState = 'default' | 'correct' | 'wrong' | 'faded';

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
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  font-family: ${theme.fonts.body};
  text-align: right;
  width: 100%;
  transition: all 0.15s;
  border: 2px solid ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    theme.colors.border};
  background: ${({ $state }) =>
    $state === 'correct' ? '#E8F5E9' :
    $state === 'wrong' ? '#FDECEA' :
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

const ResultBanner = styled.div<{ $correct: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $correct }) => ($correct ? '#E8F5E9' : '#FDECEA')};
  color: ${({ $correct }) => ($correct ? theme.colors.success : theme.colors.error)};
  font-weight: 700;
`;

const NextBtn = styled.button`
  align-self: flex-start;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const SkipBtn = styled.button`
  align-self: flex-start;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
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
  const [score, setScore] = useState<number | null>(null);
  const [noResults, setNoResults] = useState(false);

  const loadQuestion = useCallback(async () => {
    setSelectedId(null);
    setScore(null);
    setNoResults(false);

    const params = new URLSearchParams();
    if (filterMasechet) params.set('masechet', filterMasechet);
    else if (filterSeder) params.set('seder', filterSeder);

    const qRes = await fetch(`/api/quiz?${params}`);
    if (qRes.status === 404) { setNoResults(true); return; }
    const citation = await qRes.json() as Citation;

    const oParams = new URLSearchParams({ exclude: citation.id });
    if (filterMasechet) oParams.set('masechet', filterMasechet);
    else if (filterSeder) oParams.set('seder', filterSeder);

    const oRes = await fetch(`/api/quiz/options?${oParams}`);
    if (!oRes.ok) { setNoResults(true); return; }
    const distractors = await oRes.json() as CitationLocation[];

    const all = [citation.locations[0], ...distractors].sort(() => Math.random() - 0.5);
    setQuestion(citation);
    setOptions(all);
  }, [filterSeder, filterMasechet]);

  useEffect(() => { void loadQuestion(); }, [loadQuestion]);

  const handleSelect = async (opt: CitationLocation) => {
    if (selectedId !== null || !question) return;
    setSelectedId(opt.id);
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citationId: question.id, masechet: opt.masechet, daf: opt.daf, amud: opt.amud }),
    });
    const result = await res.json() as { score: number };
    setScore(result.score);
    onAnswered();
  };

  const correctId = question?.locations[0]?.id;

  const getState = (opt: CitationLocation): OptionState => {
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

  return (
    <Wrapper>
      <QuestionLabel>{HE.QUIZ_MC_CHOOSE}</QuestionLabel>
      <CitationText>{question?.content ?? HE.LOADING}</CitationText>
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
      {selectedId !== null ? (
        <NextBtn onClick={loadQuestion}>{HE.QUIZ_NEXT}</NextBtn>
      ) : (
        <SkipBtn onClick={loadQuestion}>{HE.QUIZ_SKIP}</SkipBtn>
      )}
    </Wrapper>
  );
}
