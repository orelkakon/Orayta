'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Citation } from '@/types';
import { addStat } from '@/lib/statsStorage';

function getStartWordCount(content: string): number {
  const n = content.trim().split(/\s+/).length;
  const start = n <= 10 ? 3 : n <= 20 ? 4 : 5;
  return Math.min(start, n - 1);
}

function getHintWordCount(remaining: number): number {
  if (remaining <= 3) return 0;
  if (remaining <= 8) return 1;
  if (remaining <= 15) return 2;
  return 3;
}

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

const PromptBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border-right: 4px solid ${theme.colors.secondary};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
`;

const PromptText = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem;
  line-height: 1.8;
  color: ${theme.colors.text};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const Ellipsis = styled.span`
  color: ${theme.colors.textMuted};
  font-size: 1.2rem;
  margin-right: ${theme.spacing.xs};
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

const Textarea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-family: ${theme.fonts.body};
  line-height: 1.7;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  resize: vertical;
  outline: none;
  direction: rtl;
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
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ScorePct = styled.span` font-size: 0.9rem; opacity: 0.85; `;

const FullCitationBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const FullLabel = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const FullText = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 1rem;
  line-height: 1.8;
  color: ${theme.colors.text};
  overflow-wrap: break-word;
  word-break: break-word;
`;

const SourceRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  margin-top: ${theme.spacing.xs};
  padding-top: ${theme.spacing.xs};
  border-top: 1px solid ${theme.colors.borderLight};
`;

const SourceLabel = styled.span`
  font-size: 0.78rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const SourceValue = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.88rem;
  color: ${theme.colors.primary};
  font-weight: 600;
  direction: rtl;
`;

interface Props {
  filterSeder: string;
  filterMasechet: string;
  onAnswered: () => void;
}

interface ResultLocation {
  masechet: string;
  daf: string;
  amud: string | null;
}

interface Result {
  score: number;
  correct: boolean;
  fullContent: string;
  locations: ResultLocation[];
}

function formatLoc(loc: ResultLocation): string {
  let s = `${loc.masechet} ${loc.daf}`;
  if (loc.amud) s += ` ${loc.amud}`;
  return s;
}

export default function CompletionQuiz({ filterSeder, filterMasechet, onAnswered }: Props) {
  const [question, setQuestion] = useState<Citation | null>(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [noResults, setNoResults] = useState(false);
  const [hintUsed, setHintUsed] = useState(false);

  const loadQuestion = useCallback(async () => {
    setInput('');
    setResult(null);
    setNoResults(false);
    setHintUsed(false);

    const params = new URLSearchParams();
    if (filterMasechet) params.set('masechet', filterMasechet);
    else if (filterSeder) params.set('seder', filterSeder);

    const res = await fetch(`/api/quiz?${params}`);
    if (res.status === 404) { setNoResults(true); return; }
    setQuestion(await res.json() as Citation);
  }, [filterSeder, filterMasechet]);

  useEffect(() => { void loadQuestion(); }, [loadQuestion]);

  const handleSubmit = async () => {
    if (!question || !input.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/quiz/completion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citationId: question.id, response: input }),
      });
      const data = await res.json() as Result;
      setResult(data);
      addStat({ score: data.correct ? 1 : 0, content: question.content.slice(0, 80), mode: 'completion' });
      onAnswered();
    } finally {
      setSubmitting(false);
    }
  };

  if (noResults) return <Wrapper>{HE.QUIZ_NO_RESULTS}</Wrapper>;

  const allWords = question?.content.trim().split(/\s+/) ?? [];
  const startCount = question ? getStartWordCount(question.content) : 3;
  const remaining = allWords.length - startCount;
  const hintExtra = getHintWordCount(remaining);
  const shownCount = hintUsed ? Math.min(startCount + hintExtra, allWords.length - 1) : startCount;
  const prompt = allWords.slice(0, shownCount).join(' ');

  return (
    <Wrapper>
      <QuestionLabel>{HE.QUIZ_COMPLETION_PROMPT}</QuestionLabel>
      <PromptBox>
        <PromptText>{prompt} <Ellipsis>...</Ellipsis></PromptText>
      </PromptBox>

      {!result ? (
        <>
          {!hintUsed && hintExtra > 0 && (
            <HintBtn onClick={() => setHintUsed(true)}>{HE.QUIZ_HINT_BUTTON}</HintBtn>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={HE.QUIZ_COMPLETION_PLACEHOLDER}
            rows={4}
            disabled={submitting}
          />
          <BtnRow>
            <PrimaryBtn onClick={handleSubmit} disabled={!input.trim() || submitting}>
              {submitting ? HE.LOADING : HE.QUIZ_COMPLETION_SUBMIT}
            </PrimaryBtn>
            <SkipBtn onClick={loadQuestion}>{HE.QUIZ_SKIP}</SkipBtn>
          </BtnRow>
        </>
      ) : (
        <>
          <ResultBanner $correct={result.correct}>
            <span>{result.correct ? HE.QUIZ_CORRECT : HE.QUIZ_WRONG}</span>
            <ScorePct>{Math.round(result.score * 100)}%</ScorePct>
          </ResultBanner>
          <FullCitationBox>
            <FullLabel>{HE.QUIZ_COMPLETION_FULL}</FullLabel>
            <FullText>{result.fullContent}</FullText>
            {result.locations.length > 0 && (
              <SourceRow>
                <SourceLabel>{HE.QUIZ_COMPLETION_SOURCE}</SourceLabel>
                <SourceValue>
                  {result.locations.map(formatLoc).join(' / ')}
                </SourceValue>
              </SourceRow>
            )}
          </FullCitationBox>
          <PrimaryBtn onClick={loadQuestion}>{HE.QUIZ_NEXT}</PrimaryBtn>
        </>
      )}
    </Wrapper>
  );
}
