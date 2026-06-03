'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { Citation, Amud, QuizStats } from '@/types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const QuizGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: ${theme.spacing.xl};
  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

const QuestionCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.md};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  animation: ${fadeIn} 0.3s ease;
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
`;

const HintBox = styled.div`
  background: ${theme.colors.surfaceAlt};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
  animation: ${fadeIn} 0.2s ease;
`;

const HintButton = styled.button`
  align-self: flex-start;
  font-size: 0.85rem;
  color: ${theme.colors.primaryLight};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  transition: all 0.15s;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
  @media (max-width: 500px) { grid-template-columns: 1fr; }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const FieldLabel = styled.label`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const AmudRow = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const AmudBtn = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $active }) => ($active ? 'white' : theme.colors.text)};
  font-size: 0.9rem;
  transition: all 0.15s;
`;

const ButtonRow = styled.div`
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
  transition: background 0.15s;
  &:hover { background: ${theme.colors.primaryLight}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

const ResultBanner = styled.div<{ $score: number }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $score }) =>
    $score >= 1 ? '#E8F5E9' : $score > 0 ? '#FFF8E1' : '#FDECEA'};
  border: 2px solid ${({ $score }) =>
    $score >= 1 ? theme.colors.success : $score > 0 ? '#F9A825' : theme.colors.error};
  color: ${({ $score }) =>
    $score >= 1 ? theme.colors.success : $score > 0 ? '#E65100' : theme.colors.error};
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ScoreBadge = styled.span`
  font-size: 0.9rem;
  opacity: 0.85;
`;

const CorrectAnswer = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
`;

const StatsCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.lg};
  box-shadow: ${theme.shadows.sm};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  height: fit-content;
`;

const StatsTitle = styled.h3`
  font-size: 1rem;
  color: ${theme.colors.primary};
`;

const StatRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xs} 0;
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
`;

const StatValue = styled.span`
  font-weight: 700;
  color: ${theme.colors.text};
`;

const AccuracyBar = styled.div<{ $pct: number }>`
  height: 8px;
  border-radius: 4px;
  background: ${theme.colors.borderLight};
  overflow: hidden;
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${({ $pct }) => $pct}%;
    background: ${theme.colors.success};
    border-radius: 4px;
    transition: width 0.5s ease;
  }
`;

const HistoryList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  max-height: 240px;
  overflow-y: auto;
`;

const HistoryItem = styled.div<{ $score: number }>`
  font-size: 0.78rem;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  background: ${({ $score }) =>
    $score >= 1 ? '#E8F5E9' : $score > 0 ? '#FFF8E1' : '#FDECEA'};
  color: ${({ $score }) =>
    $score >= 1 ? theme.colors.success : $score > 0 ? '#E65100' : theme.colors.error};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface AnswerResult {
  score: number;
  correctLocations: Citation['locations'];
}

function scoreIcon(score: number) {
  if (score >= 1) return '✓';
  if (score > 0) return '½';
  return '✗';
}

function scoreLabel(score: number) {
  if (score >= 1) return HE.QUIZ_CORRECT;
  if (score > 0) return HE.QUIZ_HALF;
  return HE.QUIZ_WRONG;
}

export default function QuizView() {
  const [question, setQuestion] = useState<Citation | null>(null);
  const [masechet, setMasechet] = useState('');
  const [daf, setDaf] = useState('');
  const [amud, setAmud] = useState<Amud | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const hasAmud = question?.locations.some((l) => l.amud) ?? false;

  const loadQuestion = useCallback(async () => {
    setResult(null);
    setMasechet('');
    setDaf('');
    setAmud(null);
    setHintShown(false);
    const res = await fetch('/api/quiz');
    if (res.ok) setQuestion(await res.json() as Citation);
  }, []);

  const loadStats = useCallback(async () => {
    const res = await fetch('/api/quiz/stats');
    if (res.ok) setStats(await res.json() as QuizStats);
  }, []);

  useEffect(() => { void loadQuestion(); void loadStats(); }, [loadQuestion, loadStats]);

  const handleSubmit = async () => {
    if (!question || !masechet || !daf.trim()) return;
    setLoading(true);
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citationId: question.id, masechet, daf, amud }),
    });
    setResult(await res.json() as AnswerResult);
    setLoading(false);
    void loadStats();
  };

  const formatLocation = (loc: Citation['locations'][0]) => {
    let s = `${loc.masechet} ${loc.daf}`;
    if (loc.amud) s += ` עמוד ${loc.amud}`;
    return s;
  };

  const hintSeder = question?.locations[0]?.seder ?? '';

  return (
    <Page>
      <Title>{HE.QUIZ_TITLE}</Title>
      <QuizGrid>
        <QuestionCard>
          <QuestionLabel>{HE.QUIZ_QUESTION}</QuestionLabel>
          <CitationText>{question?.content ?? HE.LOADING}</CitationText>

          {!result && !hintShown && (
            <HintButton type="button" onClick={() => setHintShown(true)}>
              {HE.QUIZ_HINT_BUTTON}
            </HintButton>
          )}
          {!result && hintShown && (
            <HintBox>{HE.QUIZ_HINT_LABEL} {hintSeder}</HintBox>
          )}

          {!result ? (
            <>
              <Row>
                <Field>
                  <FieldLabel>{HE.ADD_MASECHET_LABEL}</FieldLabel>
                  <Select value={masechet} onChange={(e) => setMasechet(e.target.value)}>
                    <option value="">{HE.QUIZ_SELECT_MASECHET}</option>
                    {SEDARIM.map((s) => (
                      <optgroup key={s} label={s}>
                        {MASECHTOT.filter((m) => m.seder === s).map((m) => (
                          <option key={m.name} value={m.name}>{m.name}</option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>{HE.ADD_DAF_LABEL}</FieldLabel>
                  <Input
                    value={daf}
                    onChange={(e) => setDaf(e.target.value)}
                    placeholder={HE.ADD_DAF_PLACEHOLDER}
                  />
                </Field>
              </Row>

              {hasAmud && (
                <Field>
                  <FieldLabel>{HE.QUIZ_AMUD_OPTIONAL}</FieldLabel>
                  <AmudRow>
                    {(['none', 'א', 'ב'] as const).map((v) => (
                      <AmudBtn
                        key={v}
                        type="button"
                        $active={amud === (v === 'none' ? null : v)}
                        onClick={() => setAmud(v === 'none' ? null : v)}
                      >
                        {v === 'none' ? HE.ADD_AMUD_NONE : v}
                      </AmudBtn>
                    ))}
                  </AmudRow>
                </Field>
              )}

              <ButtonRow>
                <PrimaryBtn onClick={handleSubmit} disabled={!masechet || !daf.trim() || loading}>
                  {loading ? HE.LOADING : HE.QUIZ_SUBMIT}
                </PrimaryBtn>
                <GhostBtn onClick={loadQuestion}>{HE.QUIZ_SKIP}</GhostBtn>
              </ButtonRow>
            </>
          ) : (
            <>
              <ResultBanner $score={result.score}>
                <span>{scoreLabel(result.score)}</span>
                <ScoreBadge>{result.score >= 1 ? '1' : result.score > 0 ? '½' : '0'} / 1</ScoreBadge>
              </ResultBanner>
              <CorrectAnswer>
                {HE.QUIZ_ANSWER_WAS}{' '}
                {result.correctLocations.map(formatLocation).join(' / ')}
              </CorrectAnswer>
              <ButtonRow>
                <PrimaryBtn onClick={loadQuestion}>{HE.QUIZ_NEXT}</PrimaryBtn>
              </ButtonRow>
            </>
          )}
        </QuestionCard>

        {stats && (
          <StatsCard>
            <StatsTitle>{HE.QUIZ_STATS_TITLE}</StatsTitle>
            <AccuracyBar $pct={stats.accuracy} />
            <StatRow><span>{HE.QUIZ_ACCURACY}</span><StatValue>{stats.accuracy}%</StatValue></StatRow>
            <StatRow><span>{HE.QUIZ_TOTAL}</span><StatValue>{stats.total}</StatValue></StatRow>
            <StatRow>
              <span>{HE.QUIZ_TOTAL_SCORE}</span>
              <StatValue>{stats.totalScore.toFixed(1)} / {stats.total}</StatValue>
            </StatRow>
            {stats.recentResults.length > 0 && (
              <>
                <StatsTitle>{HE.QUIZ_HISTORY}</StatsTitle>
                <HistoryList>
                  {stats.recentResults.map((r, i) => (
                    <HistoryItem key={i} $score={r.score}>
                      {scoreIcon(r.score)} {r.citationContent}
                    </HistoryItem>
                  ))}
                </HistoryList>
              </>
            )}
          </StatsCard>
        )}
      </QuizGrid>
    </Page>
  );
}
