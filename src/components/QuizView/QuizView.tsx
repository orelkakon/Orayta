'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { Citation, Amud } from '@/types';
import { addStat } from '@/lib/statsStorage';
import { LineIcon } from '@/components/common/LineIcons';

import MultipleChoiceQuiz from './MultipleChoiceQuiz';
import CompletionQuiz from './CompletionQuiz';
import RabbiQuiz from './RabbiQuiz';
import GematriaQuiz from './GematriaQuiz';
import BooksQuiz from './BooksQuiz';
import WhoFirstQuiz from './WhoFirstQuiz';
import SederQuiz from './SederQuiz';
import BioQuiz from './BioQuiz';
import ImageQuiz from './ImageQuiz';
import { CATEGORY_LABELS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { RabbiCategory } from '@/types';

import StatsPanel from './StatsPanel';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, HintBtn, popIn, pressable, answerFeedback, isMilestone,
} from './quizChrome';

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
  ${pressable};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $active }) => ($active ? theme.colors.onPrimary : theme.colors.text)};
  font-size: 0.9rem;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const PrimaryBtn = styled.button`
  ${pressable};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; box-shadow: ${theme.shadows.md}; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const GhostBtn = styled.button`
  ${pressable};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

/* Local because classic mode has a third, half-credit state the shared
   two-state banner doesn't model. */
const ResultBanner = styled.div<{ $score: number }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $score }) =>
    $score >= 1 ? theme.colors.bgSuccess : $score > 0 ? theme.colors.bgWarning : theme.colors.bgError};
  border: 2px solid ${({ $score }) =>
    $score >= 1 ? theme.colors.success : $score > 0 ? '#F9A825' : theme.colors.error};
  color: ${({ $score }) =>
    $score >= 1 ? theme.colors.success : $score > 0 ? '#E65100' : theme.colors.error};
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  animation: ${popIn} 0.35s ${theme.motion.spring};
`;

const ScoreBadge = styled.span`
  font-size: 0.9rem;
  opacity: 0.85;
`;

const CorrectAnswer = styled.div`
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
`;

const ModeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${theme.spacing.sm};
  @media (max-width: 600px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const ModeButton = styled.button<{ $active?: boolean }>`
  ${pressable};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  min-width: 0;
  padding: ${theme.spacing.sm} ${theme.spacing.xs};
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.borderLight)};
  background: ${({ $active }) => ($active ? theme.colors.surfaceAlt : theme.colors.surface)};
  box-shadow: ${({ $active }) => ($active ? theme.shadows.md : theme.shadows.sm)};
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};

  @media (hover: hover) {
    &:hover {
      border-color: ${theme.colors.primaryLight};
      color: ${theme.colors.primary};
      transform: translateY(-1px);
    }
  }
`;

const ModeIcon = styled.span`
  display: inline-flex;
  line-height: 1;
`;

const ModeLabel = styled.span`
  font-size: 0.74rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.2;
  word-break: break-word;

  @media (max-width: 380px) {
    font-size: 0.7rem;
  }
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

type QuizMode = 'classic' | 'multiple' | 'completion' | 'rabbi' | 'gematria' | 'books' | 'whoFirst' | 'seder' | 'bio' | 'image';

export default function QuizView() {
  const [quizMode, setQuizMode] = useState<QuizMode>('classic');
  const [question, setQuestion] = useState<Citation | null>(null);
  const [noResults, setNoResults] = useState(false);
  const [filterSeder, setFilterSeder] = useState('');
  const [filterMasechet, setFilterMasechet] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [masechet, setMasechet] = useState('');
  const [daf, setDaf] = useState('');
  const [amud, setAmud] = useState<Amud | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [statsKey, setStatsKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  const hasAmud = question?.locations.some((l) => l.amud) ?? false;

  const loadQuestion = useCallback(async (excludeIds: string[] = [], seder = filterSeder, masechetF = filterMasechet) => {
    setResult(null);
    setMasechet('');
    setDaf('');
    setAmud(null);
    setHintShown(false);
    setNoResults(false);
    setAllDone(false);
    const params = new URLSearchParams();
    if (masechetF) params.set('masechet', masechetF);
    else if (seder) params.set('seder', seder);
    excludeIds.forEach(id => params.append('exclude', id));
    const res = await fetch(`/api/quiz?${params}`);
    if (res.status === 404) {
      setQuestion(null);
      if (excludeIds.length > 0) setAllDone(true);
      else setNoResults(true);
      return;
    }
    if (res.ok) setQuestion(await res.json() as Citation);
  }, [filterSeder, filterMasechet]);

  const bumpStats = () => setStatsKey(k => k + 1);

  useEffect(() => { void loadQuestion(); }, [loadQuestion]);

  const handleFilterSederChange = (val: string) => {
    setFilterSeder(val);
    setFilterMasechet('');
    setSeenIds([]);
    setAllDone(false);
    void loadQuestion([], val, '');
  };

  const handleFilterMasechetChange = (val: string) => {
    setFilterMasechet(val);
    setSeenIds([]);
    setAllDone(false);
    void loadQuestion([], filterSeder, val);
  };

  const handleSubmit = async () => {
    if (!question || !masechet || !daf.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ citationId: question.id, masechet, daf, amud }),
      });
      const data = await res.json() as AnswerResult;
      setResult(data);
      answerFeedback(data.score >= 1);
      addStat({ score: data.score, content: question.content.slice(0, 80), mode: 'classic' });
      setStreak(s => data.score >= 1 ? s + 1 : 0);
      bumpStats();
    } finally {
      // Without the finally, one failed POST left the submit button reading
      // "טוען..." forever.
      setLoading(false);
    }
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
    setStreak(0);
    setSeenIds([]);
    setAllDone(false);
    setFilterCategory('');
  };

  return (
    <Page>
      <TitleRow>
        <Title>{HE.QUIZ_TITLE}</Title>
      </TitleRow>

      <ModeGrid>
        <ModeButton $active={quizMode === 'classic'} onClick={() => handleModeSwitch('classic')}>
          <ModeIcon><LineIcon name="target" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_CLASSIC}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'multiple'} onClick={() => handleModeSwitch('multiple')}>
          <ModeIcon><LineIcon name="list" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_MULTIPLE}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'completion'} onClick={() => handleModeSwitch('completion')}>
          <ModeIcon><LineIcon name="pencil" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_COMPLETION}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'rabbi'} onClick={() => handleModeSwitch('rabbi')}>
          <ModeIcon><LineIcon name="user" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_RABBI}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'gematria'} onClick={() => handleModeSwitch('gematria')}>
          <ModeIcon><LineIcon name="aleph" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_GEMATRIA}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'books'} onClick={() => handleModeSwitch('books')}>
          <ModeIcon><LineIcon name="book" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_BOOKS}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'whoFirst'} onClick={() => handleModeSwitch('whoFirst')}>
          <ModeIcon><LineIcon name="hourglass" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_WHO_FIRST}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'seder'} onClick={() => handleModeSwitch('seder')}>
          <ModeIcon><LineIcon name="openbook" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_SEDER}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'bio'} onClick={() => handleModeSwitch('bio')}>
          <ModeIcon><LineIcon name="search" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_BIO}</ModeLabel>
        </ModeButton>
        <ModeButton $active={quizMode === 'image'} onClick={() => handleModeSwitch('image')}>
          <ModeIcon><LineIcon name="camera" size={21} /></ModeIcon>
          <ModeLabel>{HE.QUIZ_MODE_IMAGE}</ModeLabel>
        </ModeButton>
      </ModeGrid>

      <FilterBar style={{ display: quizMode === 'rabbi' || quizMode === 'gematria' || quizMode === 'books' || quizMode === 'whoFirst' || quizMode === 'seder' || quizMode === 'bio' || quizMode === 'image' ? 'none' : undefined }}>
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

      {quizMode === 'bio' && (
        <FilterBar>
          <FilterLabel>{HE.QUIZ_FILTER_CATEGORY}</FilterLabel>
          <FilterSelect value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="">{HE.QUIZ_FILTER_CATEGORY_ALL}</option>
            {CATEGORY_ORDER.map(c => (
              <option key={c} value={c}>{CATEGORY_LABELS[c as RabbiCategory]}</option>
            ))}
          </FilterSelect>
        </FilterBar>
      )}

      {quizMode === 'classic' && allDone ? (
        <AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); void loadQuestion([]); }} />
      ) : quizMode === 'classic' && noResults ? (
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
        ) : quizMode === 'gematria' ? (
          <GematriaQuiz onAnswered={bumpStats} />
        ) : quizMode === 'books' ? (
          <BooksQuiz onAnswered={bumpStats} />
        ) : quizMode === 'whoFirst' ? (
          <WhoFirstQuiz onAnswered={bumpStats} />
        ) : quizMode === 'seder' ? (
          <SederQuiz onAnswered={bumpStats} />
        ) : quizMode === 'bio' ? (
          <BioQuiz onAnswered={bumpStats} filterCategory={filterCategory} />
        ) : quizMode === 'image' ? (
          <ImageQuiz onAnswered={bumpStats} />
        ) : quizMode === 'completion' ? (
          <CompletionQuiz
            filterSeder={filterSeder}
            filterMasechet={filterMasechet}
            onAnswered={bumpStats}
          />
        ) : (
        <QuestionCard key={question?.id ?? 'loading'}>
          <Top>
            <QuestionLabel>{HE.QUIZ_QUESTION}</QuestionLabel>
            {streak > 0 && (
              <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
            )}
          </Top>
          <CitationText>{question?.content ?? HE.LOADING}</CitationText>

          {!result && !hintShown && (
            <HintBtn type="button" onClick={() => setHintShown(true)}>
              {HE.QUIZ_HINT_BUTTON}
            </HintBtn>
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
                    onKeyDown={(e) => { if (e.key === 'Enter') void handleSubmit(); }}
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
                <GhostBtn onClick={() => { setSeenIds([]); setAllDone(false); void loadQuestion([]); }}>{HE.QUIZ_SKIP}</GhostBtn>
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
                <PrimaryBtn autoFocus onClick={() => {
                  if (result.score >= 1 && question) {
                    const next = [...seenIds, question.id];
                    setSeenIds(next);
                    void loadQuestion(next);
                  } else {
                    setSeenIds([]);
                    void loadQuestion([]);
                  }
                }}>{HE.QUIZ_NEXT}</PrimaryBtn>
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
