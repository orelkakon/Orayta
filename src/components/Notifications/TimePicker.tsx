'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatMinutes, MINUTE_STEP } from '@/lib/push/schedule';

const PRESETS = [6 * 60 + 30, 8 * 60, 13 * 60, 20 * 60, 22 * 60];

const Box = styled.div`
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.md}; display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  background: linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%);
`;
const Label = styled.div`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.textMuted}; text-align: center;`;
/* Time reads left-to-right even inside the RTL sheet. */
const Stepper = styled.div`display: flex; align-items: center; justify-content: center; gap: ${theme.spacing.lg}; direction: ltr;`;
const StepBtn = styled.button`
  width: 44px; height: 44px; border-radius: 50%; font-size: 1.4rem; line-height: 1;
  color: ${theme.colors.primary}; border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  transition: transform ${theme.motion.fast} ${theme.motion.spring}, border-color ${theme.motion.fast};
  &:hover { border-color: ${theme.colors.primaryLight}; } &:active { transform: scale(0.88); }
`;
const Clock = styled.output`
  font-family: ${theme.fonts.ui}; font-variant-numeric: tabular-nums;
  font-size: 2.6rem; font-weight: 800; letter-spacing: 0.02em; color: ${theme.colors.primary};
  min-width: 5ch; text-align: center;
`;
const Chips = styled.div`display: flex; flex-wrap: wrap; justify-content: center; gap: ${theme.spacing.xs}; direction: ltr;`;
const Chip = styled.button<{ $on: boolean }>`
  padding: 5px 12px; border-radius: 999px; font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm};
  font-variant-numeric: tabular-nums; font-weight: 600;
  border: 1px solid ${p => (p.$on ? theme.colors.primary : theme.colors.borderLight)};
  background: ${p => (p.$on ? theme.colors.primary : theme.colors.surface)};
  color: ${p => (p.$on ? theme.colors.onPrimary : theme.colors.textMuted)};
  transition: background ${theme.motion.fast}, color ${theme.motion.fast};
`;
const Hint = styled.div`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-align: center;`;

interface Props { value: number; onChange: (minutes: number) => void; }

export default function TimePicker({ value, onChange }: Props) {
  const step = (dir: 1 | -1) => onChange((value + dir * MINUTE_STEP + 1440) % 1440);
  return (
    <Box>
      <Label id="push-time-label">{HE.PUSH_TIME_LABEL}</Label>
      <Stepper role="group" aria-labelledby="push-time-label">
        <StepBtn type="button" aria-label="-15" onClick={() => step(-1)}>−</StepBtn>
        <Clock aria-live="polite">{formatMinutes(value)}</Clock>
        <StepBtn type="button" aria-label="+15" onClick={() => step(1)}>+</StepBtn>
      </Stepper>
      <Chips>
        {PRESETS.map(m => (
          <Chip key={m} type="button" $on={m === value} aria-pressed={m === value} onClick={() => onChange(m)}>
            {formatMinutes(m)}
          </Chip>
        ))}
      </Chips>
      <Hint>{HE.PUSH_TIME_HINT}</Hint>
    </Box>
  );
}
