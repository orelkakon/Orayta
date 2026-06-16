'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Book } from '@/types';
import { addStat } from '@/lib/statsStorage';

type State = 'default' | 'correct' | 'wrong' | 'faded' | 'eliminated';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const Label = styled.div`
  font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;
const BookTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: 1.4rem; font-weight: 700;
  color: ${theme.colors.primary}; border-right: 4px solid ${theme.colors.secondary};
  padding-right: ${theme.spacing.md}; overflow-wrap: break-word; word-break: break-word;
`;
const OptionsGrid = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const OptionBtn = styled.button<{ $state: State }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; font-family: ${theme.fonts.body}; text-align: right;
  width: 100%; transition: all 0.15s;
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
const ResultBanner = styled.div<{ $correct: boolean }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $correct }) => ($correct ? theme.colors.bgSuccess : theme.colors.bgError)};
  color: ${({ $correct }) => ($correct ? theme.colors.success : theme.colors.error)};
  font-weight: 700;
`;
const NextBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl}; background: ${theme.colors.primary};
  color: white; border-radius: ${theme.radii.md}; font-size: 1rem; font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; }
`;
const SkipBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 1rem; color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;
const BtnRow = styled.div`display: flex; gap: ${theme.spacing.md};`;
const Empty = styled.div`color: ${theme.colors.textMuted};`;

interface Props { onAnswered: () => void; }

export default function BooksQuiz({ onAnswered }: Props) {
  const [allBooks, setAllBooks] = useState<Book[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Book | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [eliminated, setEliminated] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/books')
      .then(r => r.json())
      .then(data => { setAllBooks(data as Book[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const loadQuestion = useCallback((list: Book[]) => {
    if (list.length === 0) return;
    const q = list[Math.floor(Math.random() * list.length)];
    const correct = q.author;
    const otherAuthors = Array.from(new Set(
      list.filter(b => b.author !== correct).map(b => b.author)
    )).sort(() => Math.random() - 0.5).slice(0, 3);
    setQuestion(q);
    setOptions([correct, ...otherAuthors].sort(() => Math.random() - 0.5));
    setSelected(null);
    setEliminated(null);
  }, []);

  useEffect(() => { if (allBooks.length > 0) loadQuestion(allBooks); }, [allBooks, loadQuestion]);

  const handleHint = () => {
    if (!question) return;
    const wrong = options.find(a => a !== question.author && a !== eliminated);
    if (wrong) setEliminated(wrong);
  };

  const handleSelect = (author: string) => {
    if (selected !== null || !question) return;
    setSelected(author);
    const correct = author === question.author;
    addStat({ score: correct ? 1 : 0, content: question.title, mode: 'books' });
    onAnswered();
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

  return (
    <Wrapper>
      <Label>{HE.QUIZ_BOOKS_QUESTION}</Label>
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
      {selected !== null
        ? <NextBtn onClick={() => loadQuestion(allBooks)}>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={() => loadQuestion(allBooks)}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>
      }
    </Wrapper>
  );
}
