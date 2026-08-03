'use client';

import { useContext, useState } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { haptics } from '@/lib/haptics';
import type { StoryQuiz as StoryQuizData } from '@/types';
import { StoryPauseContext } from './ExpandableText';
import { KickerText, MainText, SourceChip, SubText, CREAM } from './StoryCardParts';
import type { StoryWhoRabbi as StoryWhoRabbiData } from '@/types';

const Options = styled.div<{ $stack?: boolean }>`
  position: relative; z-index: 3;
  display: grid; grid-template-columns: ${p => p.$stack ? '1fr' : '1fr 1fr'};
  gap: ${theme.spacing.sm};
  width: 100%; max-width: 320px;
`;

const Portrait = styled.img`
  width: 148px; height: 148px; border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(243, 214, 146, 0.9);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5);
`;

const Option = styled.button<{ $state: 'idle' | 'correct' | 'wrong' | 'dim' }>`
  font-family: ${theme.fonts.body};
  font-size: 1rem; font-weight: 700; color: ${CREAM};
  padding: 12px 8px; border-radius: ${theme.radii.md};
  border: 1px solid rgba(246, 234, 210, 0.3);
  background: rgba(255, 255, 255, 0.07);
  transition: transform ${theme.motion.fast} ${theme.motion.spring}, background ${theme.motion.fast}, opacity ${theme.motion.fast};
  &:hover { background: rgba(255, 255, 255, 0.14); }
  &:active { transform: scale(0.95); }
  ${p => p.$state === 'correct' && css`
    background: rgba(82, 183, 136, 0.32); border-color: #52B788; color: #d9f5e6;
  `}
  ${p => p.$state === 'wrong' && css`
    background: rgba(212, 96, 110, 0.3); border-color: #D4606E; color: #ffdde1;
  `}
  ${p => p.$state === 'dim' && css`opacity: 0.4;`}
`;

const Verdict = styled.span<{ $ok: boolean }>`
  position: relative; z-index: 3;
  font-size: 0.92rem; font-weight: 800;
  color: ${p => p.$ok ? '#7ee2ae' : '#f2a3ad'};
`;

/**
 * שאלת היום — tap one of four masechtot, no typing. Answering pauses the
 * story so the result (and the real source) can sink in.
 */
export default function StoryQuiz({ quiz }: { quiz: StoryQuizData }) {
  const setEngaged = useContext(StoryPauseContext);
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.correctIndex;

  const answer = (i: number) => {
    if (answered) return;
    setPicked(i);
    setEngaged(true);
    if (i === quiz.correctIndex) haptics.success();
    else haptics.error();
  };

  const stateOf = (i: number): 'idle' | 'correct' | 'wrong' | 'dim' => {
    if (!answered) return 'idle';
    if (i === quiz.correctIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'dim';
  };

  return (
    <>
      <KickerText $accent="110,214,190">{HE.STORY_QUIZ_PROMPT}</KickerText>
      <MainText $size="1.12rem" $clamp={6}>{quiz.question}</MainText>
      <Options>
        {quiz.options.map((opt, i) => (
          <Option key={opt} $state={stateOf(i)} onClick={() => answer(i)} disabled={answered}>
            {opt}
          </Option>
        ))}
      </Options>
      {answered && (
        <>
          <Verdict $ok={correct}>{correct ? HE.STORY_QUIZ_CORRECT : HE.STORY_QUIZ_WRONG}</Verdict>
          <SourceChip>{quiz.source}</SourceChip>
        </>
      )}
      {!answered && <SubText>{HE.STORY_LABELS.quiz}</SubText>}
    </>
  );
}

/** מי בתמונה? — a rabbi's portrait and three names, tap to guess. */
export function StoryWhoRabbi({ quiz }: { quiz: StoryWhoRabbiData }) {
  const setEngaged = useContext(StoryPauseContext);
  const [picked, setPicked] = useState<number | null>(null);
  const answered = picked !== null;
  const correct = picked === quiz.correctIndex;

  const answer = (i: number) => {
    if (answered) return;
    setPicked(i);
    setEngaged(true);
    if (i === quiz.correctIndex) haptics.success();
    else haptics.error();
  };

  const stateOf = (i: number): 'idle' | 'correct' | 'wrong' | 'dim' => {
    if (!answered) return 'idle';
    if (i === quiz.correctIndex) return 'correct';
    if (i === picked) return 'wrong';
    return 'dim';
  };

  return (
    <>
      <Portrait src={quiz.imageUrl} alt="" />
      <KickerText $accent="150,190,235">{HE.STORY_WHO_PROMPT}</KickerText>
      <Options $stack>
        {quiz.options.map((opt, i) => (
          <Option key={opt} $state={stateOf(i)} onClick={() => answer(i)} disabled={answered}>
            {opt}
          </Option>
        ))}
      </Options>
      {answered && (
        <Verdict $ok={correct}>{correct ? HE.STORY_QUIZ_CORRECT : HE.STORY_QUIZ_WRONG}</Verdict>
      )}
    </>
  );
}
