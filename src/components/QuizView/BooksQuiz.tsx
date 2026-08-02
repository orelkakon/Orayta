'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn, HintBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, shuffle,
} from './quizChrome';

type State = 'default' | 'correct' | 'wrong' | 'faded' | 'eliminated';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const BookTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: 1.4rem; font-weight: 700;
  color: ${theme.colors.primary}; border-right: 4px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md}; overflow-wrap: break-word; word-break: break-word;
`;
const OptionsGrid = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const OptionBtn = styled.button<{ $state: State }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; font-family: ${theme.fonts.body}; text-align: right;
  width: 100%;
  display: ${({ $state }) => ($state === 'eliminated' ? 'none' : 'block')};
  border: 2px solid ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error : theme.colors.border};
  background: ${({ $state }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : theme.colors.surface};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'faded' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $state }) => $state === 'faded' ? 0.5 : 1};
  cursor: ${({ $state }) => $state === 'default' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'default' ? 'none' : 'auto'};
  &:hover { border-color: ${theme.colors.primaryLight}; }
`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

interface Props { onAnswered: () => void; }

export default function BooksQuiz({ onAnswered }: Props) {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Book | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch('/api/books')
      .then(r => r.json())
      .then(data => { setAllBooks(data as Book[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const loadQuestion = useCallback((list: Book[], excludeIds: string[] = []) => {
    const available = excludeIds.length > 0
      ? list.filter(b => !excludeIds.includes(b.id))
      : list;
    if (available.length === 0) {
      if (excludeIds.length > 0) setAllDone(true);
      return;
    }
    setAllDone(false);
    const q = available[Math.floor(Math.random() * available.length)];
    const correct = q.author;
    const otherAuthors = shuffle(Array.from(new Set(
      list.filter(b => b.author !== correct).map(b => b.author)
    ))).slice(0, 3);
    setQuestion(q);
    setOptions(shuffle([correct, ...otherAuthors]));
    setSelected(null);
    setEliminated(null);
  }, []);

  useEffect(() => {
    if (allBooks.length > 0) {
      setSeenIds([]);
      setAllDone(false);
      loadQuestion(allBooks, []);
    }
  }, [allBooks, loadQuestion]);

  const handleHint = () => {
    if (!question) return;
    const wrong = options.find(a => a !== question.author && a !== eliminated);
    if (wrong) setEliminated(wrong);
  };

  const handleSelect = (author: string) => {
    if (selected !== null || !question || !loaded) return;
    setSelected(author);
    const correct = author === question.author;
    answerFeedback(correct);
    addStat({ score: correct ? 1 : 0, content: question.title, mode: 'books' });
    setStreak(s => correct ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (selected === question?.author && question) {
      const next = [...seenIds, question.id];
      setSeenIds(next);
      loadQuestion(allBooks, next);
    } else {
      setSeenIds([]);
      loadQuestion(allBooks, []);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    loadQuestion(allBooks, []);
  };

  const getState = (author: string): State => {
    if (author === eliminated) return 'eliminated';
    if (selected === null) return 'default';
    if (author === question?.author) return 'correct';
    if (author === selected) return 'wrong';
    return 'faded';
  };

  const distinctAuthors = new Set(allBooks.map(b => b.author)).size;

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (allBooks.length === 0 || distinctAuthors < 2 || !question) {
    return <Wrapper><Empty>{HE.QUIZ_BOOKS_NOT_ENOUGH}</Empty></Wrapper>;
  }
  if (allDone) return <Wrapper><AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); loadQuestion(allBooks, []); }} /></Wrapper>;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_BOOKS_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      <QuestionBlock key={question.id}>
        <BookTitle>{question.title}</BookTitle>
        {selected === null && !eliminated && (
          <HintBtn onClick={handleHint}>{HE.QUIZ_HINT_BUTTON}</HintBtn>
        )}
        <OptionsGrid>
          {options.map(author => (
            <OptionBtn
              key={author}
              $state={getState(author)}
              onClick={() => handleSelect(author)}
            >
              {author}
            </OptionBtn>
          ))}
        </OptionsGrid>
        {selected !== null && (
          <ResultBanner $correct={selected === question.author}>
            {selected === question.author ? HE.QUIZ_CORRECT : HE.QUIZ_WRONG}
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
