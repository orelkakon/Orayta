'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { INTEREST_IDS, Interest } from '@/lib/interests';
import { LineIcon } from '@/components/common/LineIcons';

/** Four toggle cards (2×2 on phones); several can be on. */
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${theme.spacing.sm};
`;

const Option = styled.button<{ $on: boolean }>`
  position: relative; min-height: 92px; padding: ${theme.spacing.ms};
  display: flex; flex-direction: column; align-items: flex-start; gap: 4px; text-align: start;
  border-radius: ${theme.radii.lg};
  border: 1.5px solid ${p => (p.$on ? theme.colors.gold : theme.colors.border)};
  background: ${p => (p.$on ? theme.colors.goldSoft : theme.colors.surface)};
  color: ${theme.colors.text};
  transition: border-color ${theme.motion.fast}, background-color ${theme.motion.fast}, transform ${theme.motion.fast};
  &:active { transform: scale(0.97); }
  & > svg { color: ${p => (p.$on ? theme.colors.primary : theme.colors.textMuted)}; }
`;

const Label = styled.span`font-weight: 800; font-size: ${theme.fontSizes.md};`;
const Sub = styled.span`font-size: ${theme.fontSizes.xs}; line-height: 1.4; color: ${theme.colors.textMuted};`;

const Check = styled.span<{ $on: boolean }>`
  position: absolute; top: 10px; inset-inline-end: 10px;
  width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center;
  border: 1.5px solid ${p => (p.$on ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$on ? theme.colors.primary : 'transparent')};
  color: ${theme.colors.onPrimary};
  transition: background-color ${theme.motion.fast}, border-color ${theme.motion.fast};
`;

interface Props { value: Interest[]; onChange: (next: Interest[]) => void }

export default function InterestPicker({ value, onChange }: Props) {
  const toggle = (id: Interest) =>
    onChange(value.includes(id) ? value.filter(v => v !== id) : INTEREST_IDS.filter(i => i === id || value.includes(i)));
  return (
    <Grid role="group" aria-label={HE.INTERESTS_GROUP_ARIA}>
      {INTEREST_IDS.map(id => {
        const t = HE.INTERESTS[id];
        const on = value.includes(id);
        return (
          <Option key={id} type="button" $on={on} aria-pressed={on} onClick={() => toggle(id)}>
            <LineIcon name={t.icon} size={22} strokeWidth={1.8} />
            <Label>{t.label}</Label>
            <Sub>{t.sub}</Sub>
            <Check $on={on} aria-hidden="true">{on && <LineIcon name="check" size={14} strokeWidth={3} />}</Check>
          </Option>
        );
      })}
    </Grid>
  );
}
