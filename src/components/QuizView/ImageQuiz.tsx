'use client';

import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS, CATEGORY_ORDER } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';
import AllDoneCard from './AllDoneCard';
import {
  Top, QuestionLabel, Streak, ResultBanner, BtnRow, NextBtn, SkipBtn,
  QuestionBlock, pressable, answerMotion, answerFeedback, isMilestone, shuffle, popIn,
} from './quizChrome';

const Wrapper = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg}; min-width: 0;
`;
const FilterSection = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const FilterTitle = styled.div`
  font-size: 0.78rem; font-weight: 700; color: ${theme.colors.textMuted};
  text-transform: uppercase; letter-spacing: 0.05em;
`;
const ChipsRow = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.xs};`;
const AllChip = styled.button<{ $active: boolean }>`
  ${pressable};
  padding: 4px 14px; border-radius: 20px; font-size: 0.78rem; font-weight: 700;
  border: 2px solid ${({ $active }) => $active ? theme.colors.primary : theme.colors.borderLight};
  background: ${({ $active }) => $active ? theme.colors.primary : theme.colors.surface};
  color: ${({ $active }) => $active ? 'white' : theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primary}; color: ${({ $active }) => $active ? 'white' : theme.colors.primary}; }
`;
const CategoryChip = styled.button<{ $active: boolean; $color: string }>`
  ${pressable};
  padding: 4px 12px; border-radius: 20px; font-size: 0.76rem; font-weight: 600;
  border: 2px solid ${({ $active, $color }) => $active ? $color : $color + '44'};
  background: ${({ $active, $color }) => $active ? $color : $color + '10'};
  color: ${({ $active, $color }) => $active ? 'white' : $color};
  &:hover { border-color: ${({ $color }) => $color}; background: ${({ $color, $active }) => $active ? $color : $color + '20'}; }
`;
const ImageFrame = styled.div`
  border-radius: ${theme.radii.lg}; overflow: hidden;
  background: ${theme.colors.surfaceAlt}; border: 2px solid ${theme.colors.borderLight};
  display: flex; align-items: center; justify-content: center;
  min-height: 220px; max-height: 340px; position: relative;
`;
const RabbiImg = styled.img`
  width: 100%; max-height: 340px; object-fit: cover; object-position: top; display: block;
`;
const Grid = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.sm};`;
type BtnState = 'idle' | 'correct' | 'wrong' | 'dim';
const OptionBtn = styled.button<{ $state: BtnState; $color: string }>`
  ${pressable};
  ${answerMotion};
  padding: ${theme.spacing.md} ${theme.spacing.sm}; border-radius: ${theme.radii.md};
  border: 2px solid ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error : $color + '55'};
  background: ${({ $state, $color }) =>
    $state === 'correct' ? theme.colors.bgSuccess : $state === 'wrong' ? theme.colors.bgError : $color + '0A'};
  color: ${({ $state }) =>
    $state === 'correct' ? theme.colors.success : $state === 'wrong' ? theme.colors.error :
    $state === 'dim' ? theme.colors.textMuted : theme.colors.text};
  opacity: ${({ $state }) => $state === 'dim' ? 0.42 : 1};
  font-size: 0.9rem; font-family: ${theme.fonts.body}; font-weight: 600;
  cursor: ${({ $state }) => $state === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $state }) => $state !== 'idle' ? 'none' : 'auto'};
  text-align: center; min-height: 58px;
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
`;
const CenterBanner = styled(ResultBanner)`text-align: center;`;
const RevealCard = styled.div<{ $color: string }>`
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md};
  background: ${({ $color }) => $color + '10'}; border: 2px solid ${({ $color }) => $color + '40'};
  display: flex; flex-direction: column; gap: ${theme.spacing.xs}; animation: ${popIn} 0.3s ${theme.motion.spring};
`;
const RevealName = styled.div`
  font-size: 1.1rem; font-weight: 700; color: ${theme.colors.text}; font-family: ${theme.fonts.body};
`;
const RevealMeta = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted};`;
const Empty = styled.div`color: ${theme.colors.textMuted}; font-size: 0.95rem; line-height: 1.6;`;

interface Props { onAnswered: () => void; }

export default function ImageQuiz({ onAnswered }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Rabbi | null>(null);
  const [options, setOptions] = useState<Rabbi[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [selectedCats, setSelectedCats] = useState<RabbiCategory[]>([]);
  const [seenIds, setSeenIds] = useState<string[]>([]);
  const [allDone, setAllDone] = useState(false);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback((list: Rabbi[], cats: RabbiCategory[], excludeIds: string[] = []) => {
    const withImg = list.filter(r => r.imageUrl);
    const pool = cats.length > 0 ? withImg.filter(r => cats.includes(r.category as RabbiCategory)) : withImg;
    if (pool.length < 4) { setQuestion(null); return; }
    const available = excludeIds.length > 0 ? pool.filter(r => !excludeIds.includes(r.id)) : pool;
    if (available.length === 0) {
      if (excludeIds.length > 0) setAllDone(true);
      return;
    }
    setAllDone(false);
    const q = available[Math.floor(Math.random() * available.length)];
    const others = shuffle(pool.filter(r => r.id !== q.id)).slice(0, 3);
    setQuestion(q);
    setOptions(shuffle([q, ...others]));
    setSelected(null);
  }, []);

  useEffect(() => { if (all.length >= 1) next(all, selectedCats, []); }, [all, next, selectedCats]);

  const toggleCat = (cat: RabbiCategory) => {
    setSeenIds([]);
    setAllDone(false);
    setStreak(0);
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const clearCats = () => {
    setSeenIds([]);
    setAllDone(false);
    setStreak(0);
    setSelectedCats([]);
  };

  const pick = (id: string) => {
    if (selected !== null || !question || !loaded) return;
    setSelected(id);
    const ok = id === question.id;
    answerFeedback(ok);
    addStat({ score: ok ? 1 : 0, content: question.name, mode: 'image' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
  };

  const handleNext = () => {
    if (!question) return;
    if (selected === question.id) {
      const nextSeen = [...seenIds, question.id];
      setSeenIds(nextSeen);
      next(all, selectedCats, nextSeen);
    } else {
      setSeenIds([]);
      next(all, selectedCats, []);
    }
  };

  const handleSkip = () => {
    setSeenIds([]);
    setAllDone(false);
    next(all, selectedCats, []);
  };

  const colorOf = (r: Rabbi) => CATEGORY_COLORS[r.category as RabbiCategory] ?? theme.colors.primary;
  const btnState = (r: Rabbi): BtnState => {
    if (!selected) return 'idle';
    if (r.id === question?.id) return 'correct';
    if (r.id === selected) return 'wrong';
    return 'dim';
  };

  if (!loaded) return <Wrapper><Empty>{HE.LOADING}</Empty></Wrapper>;

  const withImg = all.filter(r => r.imageUrl);
  const pool = selectedCats.length > 0
    ? withImg.filter(r => selectedCats.includes(r.category as RabbiCategory))
    : withImg;
  const catsWithImages = CATEGORY_ORDER.filter(cat => withImg.some(r => r.category === cat));

  const filterChips = (
    <FilterSection>
      <FilterTitle>{HE.QUIZ_IMAGE_FILTER_TITLE}</FilterTitle>
      <ChipsRow>
        <AllChip $active={selectedCats.length === 0} onClick={clearCats}>
          {HE.QUIZ_IMAGE_FILTER_ALL}
        </AllChip>
        {catsWithImages.map(cat => (
          <CategoryChip key={cat} $active={selectedCats.includes(cat)}
            $color={CATEGORY_COLORS[cat]} onClick={() => toggleCat(cat)}>
            {CATEGORY_LABELS[cat]}
          </CategoryChip>
        ))}
      </ChipsRow>
    </FilterSection>
  );

  if (allDone) return (
    <Wrapper>
      {filterChips}
      <AllDoneCard onReset={() => { setSeenIds([]); setAllDone(false); setStreak(0); next(all, selectedCats, []); }} />
    </Wrapper>
  );

  if (pool.length < 4 || !question) return (
    <Wrapper>{filterChips}<Empty>{HE.QUIZ_IMAGE_NOT_ENOUGH}</Empty></Wrapper>
  );

  const answered = selected !== null;
  const isOk = selected === question.id;

  return (
    <Wrapper>
      <Top>
        <QuestionLabel>{HE.QUIZ_IMAGE_QUESTION}</QuestionLabel>
        {streak > 0 && (
          <Streak key={streak} $milestone={isMilestone(streak)}>🔥 {HE.QUIZ_STREAK(streak)}</Streak>
        )}
      </Top>
      {filterChips}
      <QuestionBlock key={question.id}>
        <ImageFrame>
          {question.imageUrl && (
            <RabbiImg src={question.imageUrl} alt="?" onError={() => next(all, selectedCats, seenIds)} />
          )}
        </ImageFrame>
        <Grid>
          {options.map(r => (
            <OptionBtn key={r.id} $state={btnState(r)} $color={colorOf(r)} onClick={() => pick(r.id)}>
              {r.name}
            </OptionBtn>
          ))}
        </Grid>
        {answered && (
          <>
            <CenterBanner $correct={isOk}>{isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}</CenterBanner>
            <RevealCard $color={colorOf(question)}>
              <RevealName>{question.name}{question.fullName ? ` — ${question.fullName}` : ''}</RevealName>
              <RevealMeta>{CATEGORY_LABELS[question.category as RabbiCategory]} · {question.datePeriod}</RevealMeta>
            </RevealCard>
          </>
        )}
      </QuestionBlock>
      {answered
        ? <NextBtn onClick={handleNext} autoFocus>{HE.QUIZ_NEXT}</NextBtn>
        : <BtnRow><SkipBtn onClick={handleSkip}>{HE.QUIZ_SKIP}</SkipBtn></BtnRow>}
    </Wrapper>
  );
}
