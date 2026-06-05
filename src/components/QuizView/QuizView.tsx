'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { Citation, Amud } from '@/types';
import { addStat } from '@/lib/statsStorage';

import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import CompletionQuiz from './CompletionQuiz';
import RabbiQuiz from './RabbiQuiz';
import StatsPanel from './StatsPanel';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xl};
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Title = styled.h1`
  font-size: 1.8rem;
  color: ${theme.colors.primary};
`;

const FilterBar = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md};
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const FilterLabel = styled.span`
  font-size: 0.82rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  white-space: nowrap;
`;

const FilterSelect = styled.select`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.9rem;
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  outline: none;
  flex: 1;
  min-width: 140px;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const NoResultsCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.sm};
  text-align: center;
  color: ${theme.colors.textMuted};
  font-size: 1rem;
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
  min-width: 0;
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

const ResetButton = styled.button`
  font-size: 0.78rem;
  color: ${theme.colors.error};
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.radii.sm};
  padding: 3px ${theme.spacing.sm};
  margin-top: ${theme.spacing.xs};
  opacity: 0.7;
  transition: opacity 0.15s;
  &:hover { opacity: 1; background: rgba(155,35,53,0.06); }
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
  min-width: 0;
`;

const TabRow = styled.div`
  display: flex;
  gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: 0;
`;

const TabButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  border-radius: ${theme.radii.md} ${theme.radii.md} 0 0;
  font-size: 0.9rem;
  font-weight: 600;
  border-bottom: 2px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  margin-bottom: -2px;
  transition: all 0.15s;
  &:hover { color: ${theme.colors.primary}; }
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

type QuizMode = 'classic' | 'multiple' | 'completion' | 'rabbi';

export default function QuizView() {
  const [quizMode, setQuizMode] = useState<QuizMode>('classic');
  const [question, setQuestion] = useState<Citation | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [filterSeder, setFilterSeder] = useState('');
  const [filterMasechet, setFilterMasechet] = useState('');
  const [masechet, setMasechet] = useState('');
  const [daf, setDaf] = useState('');
  const [amud, setAmud] = useState<Amud | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [statsKey, setStatsKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hintShown, setHintShown] = useState(false);

  const hasAmud = question?.locations.some((l) => l.amud) ?? false;

  const loadQuestion = useCallback(async (seder = filterSeder, masechetF = filterMasechet) => {
    setResult(null);
    setMasechet('');
    setDaf('');
    setAmud(null);
    setHintShown(false);
    setNoResults(false);
    const params = new URLSearchParams();
    if (masechetF) params.set('masechet', masechetF);
    else if (seder) params.set('seder', seder);
    const res = await fetch(`/api/quiz?${params}`);
    if (res.status === 404) { setQuestion(null); setNoResults(true); return; }
    if (res.ok) setQuestion(await res.json() as Citation);
  }, [filterSeder, filterMasechet]);

  const bumpStats = () => setStatsKey(k => k + 1);

  useEffect(() => { void loadQuestion(); }, [loadQuestion]);

  const handleFilterSederChange = (val: string) => {
    setFilterSeder(val);
    setFilterMasechet('');
    void loadQuestion(val, '');
  };

  const handleFilterMasechetChange = (val: string) => {
    setFilterMasechet(val);
    void loadQuestion(filterSeder, val);
  };

  const handleSubmit = async () => {
    if (!question || !masechet || !daf.trim()) return;
    setLoading(true);
    const res = await fetch('/api/quiz', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citationId: question.id, masechet, daf, amud }),
    });
    const data = await res.json() as AnswerResult;
    setResult(data);
    addStat({ score: data.score, content: question.content.slice(0, 80), mode: 'classic' });
    setLoading(false);
    bumpStats();
  };

  const formatLocation = (loc: Citation['locations'][0]) => {
    let s = `${loc.masechet} ${loc.daf}`;
    if (loc.amud) s += ` עמוד ${loc.amud}`;
    return s;
  };

  const hintSeder = question?.locations[0]?.seder ?? '';
  const filterMasechtot = filterSeder
    ? MASECHTOT.filter((m) => m.seder === filterSeder)
    : MASECHTOT;

  const handleModeSwitch = (mode: QuizMode) => {
    setQuizMode(mode);
    setNoResults(false);
  };

  return (
    <Page>
      <TitleRow>
        <Title>{HE.QUIZ_TITLE}</Title>
      </TitleRow>

      <TabRow>
        <TabButton $active={quizMode === 'classic'} onClick={() => handleModeSwitch('classic')}>
          {HE.QUIZ_MODE_CLASSIC}
        </TabButton>
        <TabButton $active={quizMode === 'multiple'} onClick={() => handleModeSwitch('multiple')}>
          {HE.QUIZ_MODE_MULTIPLE}
        </TabButton>
        <TabButton $active={quizMode === 'completion'} onClick={() => handleModeSwitch('completion')}>
          {HE.QUIZ_MODE_COMPLETION}
        </TabButton>
        <TabButton $active={quizMode === 'rabbi'} onClick={() => handleModeSwitch('rabbi')}>
          {HE.QUIZ_MODE_RABBI}
        </TabButton>
      </TabRow>

      <FilterBar style={{ display: quizMode === 'rabbi' ? 'none' : undefined }}>
        <FilterLabel>{HE.QUIZ_FILTER_TITLE}</FilterLabel>
        <FilterSelect value={filterSeder} onChange={(e) => handleFilterSederChange(e.target.value)}>
          <option value="">{HE.QUIZ_FILTER_ALL}</option>
          {SEDARIM.map((s) => <option key={s} value={s}>{s}</option>)}
        </FilterSelect>
        <FilterSelect value={filterMasechet} onChange={(e) => handleFilterMasechetChange(e.target.value)}>
          <option value="">{HE.STUDY_FILTER_ALL}</option>
          {filterMasechtot.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
        </FilterSelect>
      </FilterBar>

      {quizMode === 'classic' && noResults ? (
        <NoResultsCard>{HE.QUIZ_NO_RESULTS}</NoResultsCard>
      ) : (
      <QuizGrid>
        {quizMode === 'multiple' ? (
          <MultipleChoiceQuiz
            filterSeder={filterSeder}
            filterMasechet={filterMasechet}
            onAnswered={bumpStats}
          />
        ) : quizMode === 'rabbi' ? (
          <RabbiQuiz onAnswered={bumpStats} />
        ) : quizMode === 'completion' ? (
          <CompletionQuiz
            filterSeder={filterSeder}
            filterMasechet={filterMasechet}
            onAnswered={bumpStats}
          />
        ) : (
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
                <GhostBtn onClick={() => loadQuestion()}>{HE.QUIZ_SKIP}</GhostBtn>
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
                <PrimaryBtn onClick={() => loadQuestion()}>{HE.QUIZ_NEXT}</PrimaryBtn>
              </ButtonRow>
            </>
          )}
        </QuestionCard>
        )}

        <StatsPanel statsKey={statsKey} />
      </QuizGrid>
      )}
    </Page>
  );
}
