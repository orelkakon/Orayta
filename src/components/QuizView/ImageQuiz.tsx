'use client';

import { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/rabbisData';
import { addStat } from '@/lib/statsStorage';

const pop = keyframes`
  0%   { transform: scale(0.92); opacity: 0; }
  60%  { transform: scale(1.03); }
  100% { transform: scale(1);    opacity: 1; }
`;

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

const Top = styled.div`display: flex; align-items: center; justify-content: space-between;`;

const Label = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const Streak = styled.div`
  background: linear-gradient(135deg, #FF6B35, #FF9F1C);
  color: white; font-size: 0.78rem; font-weight: 800; padding: 3px 12px; border-radius: 20px;
`;

const ImageFrame = styled.div`
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  background: ${theme.colors.surfaceAlt};
  border: 2px solid ${theme.colors.borderLight};
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
  max-height: 340px;
  position: relative;
`;

const RabbiImg = styled.img`
  width: 100%;
  max-height: 340px;
  object-fit: cover;
  object-position: top;
  display: block;
`;

const ImgPlaceholder = styled.div`
  font-size: 4rem;
  color: ${theme.colors.border};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.sm};
`;

type BtnState = 'idle' | 'correct' | 'wrong' | 'dim';

const OptionBtn = styled.button<{ $st: BtnState; $color: string }>`
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-radius: ${theme.radii.md};
  border: 2px solid ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.success :
    $st === 'wrong'   ? theme.colors.error :
    $color + '55'};
  background: ${({ $st, $color }) =>
    $st === 'correct' ? theme.colors.bgSuccess :
    $st === 'wrong'   ? theme.colors.bgError :
    $color + '0A'};
  color: ${({ $st }) =>
    $st === 'correct' ? theme.colors.success :
    $st === 'wrong'   ? theme.colors.error :
    $st === 'dim'     ? theme.colors.textMuted :
    theme.colors.text};
  opacity: ${({ $st }) => $st === 'dim' ? 0.42 : 1};
  font-size: 0.9rem;
  font-family: ${theme.fonts.body};
  font-weight: 600;
  cursor: ${({ $st }) => $st === 'idle' ? 'pointer' : 'default'};
  pointer-events: ${({ $st }) => $st !== 'idle' ? 'none' : 'auto'};
  transition: all 0.15s;
  text-align: center;
  min-height: 58px;
  &:hover { transform: translateY(-2px); box-shadow: 0 5px 14px ${({ $color }) => $color}28; border-color: ${({ $color }) => $color}; }
  &:active { transform: scale(0.97); }
`;

const Banner = styled.div<{ $ok: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $ok }) => $ok ? theme.colors.bgSuccess : theme.colors.bgError};
  color: ${({ $ok }) => $ok ? theme.colors.success : theme.colors.error};
  font-weight: 700;
  text-align: center;
  animation: ${pop} 0.25s ease;
`;

const RevealCard = styled.div<{ $color: string }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $color }) => $color + '10'};
  border: 2px solid ${({ $color }) => $color + '40'};
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  animation: ${pop} 0.3s ease;
`;

const RevealName = styled.div`
  font-size: 1.1rem; font-weight: 700; color: ${theme.colors.text}; font-family: ${theme.fonts.body};
`;

const RevealMeta = styled.div`font-size: 0.8rem; color: ${theme.colors.textMuted};`;

const NextBtn = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary}; color: white;
  border-radius: ${theme.radii.md}; font-size: 1rem; font-weight: 600; width: 100%;
  transition: background 0.15s;
  &:hover { background: ${theme.colors.primaryLight}; }
`;

const SkipBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1.5px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.md};
  font-size: 0.9rem; color: ${theme.colors.textMuted}; align-self: flex-start;
  transition: all 0.15s;
  &:hover { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
`;

const Empty = styled.div`color: ${theme.colors.textMuted}; font-size: 0.95rem; line-height: 1.6;`;

interface Props { onAnswered: () => void; }

export default function ImageQuiz({ onAnswered }: Props) {
  const [all, setAll] = useState<Rabbi[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [question, setQuestion] = useState<Rabbi | null>(null);
  const [options, setOptions] = useState<Rabbi[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [streak, setStreak] = useState(0);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    fetch('/api/rabbis')
      .then(r => r.json())
      .then(data => { setAll(data as Rabbi[]); setLoaded(true); })
      .catch(() => setLoaded(true));
  }, []);

  const next = useCallback((list: Rabbi[]) => {
    const withImg = list.filter(r => r.imageUrl);
    if (withImg.length < 1) return;
    const q = withImg[Math.floor(Math.random() * withImg.length)];
    const others = list.filter(r => r.id !== q.id).sort(() => Math.random() - 0.5).slice(0, 3);
    setQuestion(q);
    setOptions([q, ...others].sort(() => Math.random() - 0.5));
    setSelected(null);
    setImgError(false);
  }, []);

  useEffect(() => { if (all.length >= 1) next(all); }, [all, next]);

  const pick = (id: string) => {
    if (selected !== null || !question) return;
    setSelected(id);
    const ok = id === question.id;
    addStat({ score: ok ? 1 : 0, content: question.name, mode: 'image' });
    setStreak(s => ok ? s + 1 : 0);
    onAnswered();
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
  if (withImg.length < 1 || !question) {
    return <Wrapper><Empty>{HE.QUIZ_IMAGE_NOT_ENOUGH}</Empty></Wrapper>;
  }

  const answered = selected !== null;
  const isOk = selected === question.id;

  return (
    <Wrapper>
      <Top>
        <Label>{HE.QUIZ_IMAGE_QUESTION}</Label>
        {streak > 0 && <Streak>🔥 {HE.QUIZ_STREAK(streak)}</Streak>}
      </Top>

      <ImageFrame>
        {question.imageUrl && !imgError ? (
          <RabbiImg
            src={question.imageUrl}
            alt="?"
            onError={() => setImgError(true)}
          />
        ) : (
          <ImgPlaceholder>🧔</ImgPlaceholder>
        )}
      </ImageFrame>

      <Grid>
        {options.map(r => (
          <OptionBtn key={r.id} $st={btnState(r)} $color={colorOf(r)} onClick={() => pick(r.id)}>
            {r.name}
          </OptionBtn>
        ))}
      </Grid>

      {answered && (
        <>
          <Banner $ok={isOk}>{isOk ? `✓ ${HE.QUIZ_CORRECT}` : `✗ ${HE.QUIZ_WRONG}`}</Banner>
          <RevealCard $color={colorOf(question)}>
            <RevealName>{question.name}{question.fullName ? ` — ${question.fullName}` : ''}</RevealName>
            <RevealMeta>{CATEGORY_LABELS[question.category as RabbiCategory]} · {question.datePeriod}</RevealMeta>
          </RevealCard>
          <NextBtn onClick={() => next(all)}>{HE.QUIZ_NEXT}</NextBtn>
        </>
      )}
      {!answered && <SkipBtn onClick={() => next(all)}>{HE.QUIZ_SKIP}</SkipBtn>}
    </Wrapper>
  );
}
