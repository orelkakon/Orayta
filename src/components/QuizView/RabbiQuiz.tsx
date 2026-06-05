'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';

type State = 'default' | 'correct' | 'wrong' | 'faded';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const Label = styled.div`
  font-size: 0.8rem; font-weight: 600; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
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
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; font-family: ${theme.fonts.body}; text-align: right;
  width: 100%; transition: all 0.15s;
  border: 2px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'default' ? $color + '55' : theme.colors.borderLight};
  background: ${({ $state }) =>
    $state === 'correct' ? '#E8F5E9' : $state === 'wrong' ? '#FDECEA' : theme.colors.surface};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success :
    $state === 'wrong' ? theme.colors.error :
    $state === 'faded' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $state }) => $state === 'faded' ? 0.5 : 1};
  cursor: ${({ $state }) => $state === 'default' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'default' ? 'none' : 'auto'};
`;
const ResultBanner = styled.div<{ $correct: boolean }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $correct }) => ($correct ? '#E8F5E9' : '#FDECEA')};
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

export default function RabbiQuiz({ onAnswered }: Props) {
  const [allRabbis, setAllRabbis] = useState<Rabbi[]>([]);
  const [question, setQuestion] = useState<Rabbi | null>(null);
  const [options, setOptions] = useState<RabbiCategory[]>([]);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    void fetch('/api/rabbis').then(r => r.json()).then(setAllRabbis as (v: unknown) => void);
  }, []);

  const loadQuestion = useCallback((list: Rabbi[]) => {
    if (list.length === 0) return;
    const q = list[Math.floor(Math.random() * list.length)];
    const correct = q.category as RabbiCategory;
    const others = CATEGORY_ORDER.filter(c => c !== correct).sort(() => Math.random() - 0.5).slice(0, 3);
    setQuestion(q);
    setOptions([correct, ...others].sort(() => Math.random() - 0.5));
    setSelected(null);
  }, []);

  useEffect(() => { if (allRabbis.length > 0) loadQuestion(allRabbis); }, [allRabbis, loadQuestion]);

  const handleSelect = (cat: RabbiCategory) => {
    if (selected !== null || !question) return;
    setSelected(cat);
    const correct = cat === question.category;
    addStat({ score: correct ? 1 : 0, content: question.name, mode: 'rabbi' });
    onAnswered();
  };

  const getState = (cat: RabbiCategory): State => {
    if (selected === null) return 'default';
    if (cat === question?.category) return 'correct';
    if (cat === selected) return 'wrong';
    return 'faded';
  };

  if (allRabbis.length === 0) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;
  if (!question) return <Wrapper><Empty>{HE.QUIZ_RABBI_NOT_ENOUGH}</Empty></Wrapper>;

  return (
    <Wrapper>
      <Label>{HE.QUIZ_RABBI_QUESTION}</Label>
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
      {selected !== null
        ? <NextBtn onClick={() => loadQuestion(allRabbis)}>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={() => loadQuestion(allRabbis)}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>
      }
    </Wrapper>
  );
}
