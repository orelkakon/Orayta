'use client';

import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { haptics } from '@/lib/haptics';

/**
 * Shared quiz chrome — the answer-feedback vocabulary every quiz mode speaks:
 * banner pop, correct-button pulse, wrong-button shake, streak flame, pressed
 * states. One copy here instead of ten drifting copies in the mode files.
 */

export const popIn = keyframes`
  0%   { opacity: 0; transform: scale(0.92) translateY(4px); }
  60%  { transform: scale(1.02) translateY(0); }
  100% { opacity: 1; transform: scale(1); }
`;

export const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-6px); }
  40% { transform: translateX(6px); }
  60% { transform: translateX(-3px); }
  80% { transform: translateX(3px); }
`;

export const correctPop = keyframes`
  0%   { transform: scale(1); }
  40%  { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const questionSwap = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

/** Wrap per-question content and set key={question.id} so it re-animates on every swap. */
export const QuestionBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  min-width: 0;
  animation: ${questionSwap} 0.3s ${theme.motion.out};
`;

/** Pressed-state + unified transition for any tappable control. */
export const pressable = css`
  transition: transform ${theme.motion.fast} ease, background ${theme.motion.fast} ease,
    border-color ${theme.motion.fast} ease, color ${theme.motion.fast} ease,
    box-shadow ${theme.motion.fast} ease, opacity ${theme.motion.fast} ease;
  &:active { transform: scale(0.96); }
`;

/**
 * Answer-state motion for option buttons: pass the button's $state through.
 * Correct answers pulse, wrong ones shake — layered on top of each mode's own
 * colors so category tinting keeps working.
 */
export const answerMotion = css<{ $state: string }>`
  ${({ $state }) => $state === 'correct' && css`animation: ${correctPop} 0.4s ${theme.motion.spring};`}
  ${({ $state }) => $state === 'wrong' && css`animation: ${shake} 0.4s ease;`}
`;

export const Top = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const QuestionLabel = styled.div`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

/** Render with key={streak} so it pops every time the number climbs. */
export const Streak = styled.div<{ $milestone?: boolean }>`
  background: linear-gradient(135deg, #FF6B35, #FF9F1C);
  color: #3A1A00;
  font-size: 0.78rem;
  font-weight: 800;
  padding: 3px 12px;
  border-radius: 20px;
  animation: ${popIn} 0.35s ${theme.motion.spring};
  box-shadow: ${({ $milestone }) => ($milestone ? '0 0 16px rgba(255, 140, 26, 0.55)' : 'none')};
`;

export const ResultBanner = styled.div<{ $correct: boolean }>`
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  background: ${({ $correct }) => ($correct ? theme.colors.bgSuccess : theme.colors.bgError)};
  color: ${({ $correct }) => ($correct ? theme.colors.success : theme.colors.error)};
  font-weight: 700;
  animation: ${popIn} 0.35s ${theme.motion.spring};
`;

export const BtnRow = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
`;

export const NextBtn = styled.button`
  ${pressable};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  &:hover { background: ${theme.colors.primaryLight}; box-shadow: ${theme.shadows.md}; }
`;

export const SkipBtn = styled.button`
  ${pressable};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: ${theme.colors.textMuted};
  &:hover { border-color: ${theme.colors.primaryLight}; color: ${theme.colors.primary}; }
`;

export const HintBtn = styled.button`
  ${pressable};
  align-self: flex-start;
  font-size: 0.85rem;
  color: ${theme.colors.primaryLight};
  border: 1px dashed ${theme.colors.border};
  border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

/** Streak milestones get the glow treatment. */
export const isMilestone = (streak: number) => streak > 0 && streak % 5 === 0;

/** One call per answer: haptic feedback matched to the outcome. */
export function answerFeedback(correct: boolean): void {
  if (correct) haptics.success();
  else haptics.error();
}

/** Uniform Fisher-Yates — replaces the biased sort(() => Math.random() - 0.5). */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
