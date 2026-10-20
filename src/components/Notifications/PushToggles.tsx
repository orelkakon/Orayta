'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PushPrefs } from '@/types/push';

type ToggleKey = 'daily' | 'hilula' | 'omer';

const ROWS: { key: ToggleKey; icon: string; label: string; desc: string }[] = [
  { key: 'daily', icon: 'openbook', label: HE.PUSH_DAILY, desc: HE.PUSH_DAILY_DESC },
  { key: 'hilula', icon: 'candle', label: HE.PUSH_HILULA, desc: HE.PUSH_HILULA_DESC },
  { key: 'omer', icon: 'calendar', label: HE.PUSH_OMER, desc: HE.PUSH_OMER_DESC },
];

const List = styled.div`
  display: flex; flex-direction: column;
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.lg}; overflow: hidden;
`;
const Row = styled.button`
  display: flex; align-items: center; gap: ${theme.spacing.ms}; width: 100%;
  padding: ${theme.spacing.ms} ${theme.spacing.md}; text-align: right;
  border-bottom: 1px solid ${theme.colors.borderLight};
  transition: background ${theme.motion.fast};
  &:last-child { border-bottom: none; }
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;
const Icon = styled.span`color: ${theme.colors.secondary}; display: flex; flex-shrink: 0;`;
const Text = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px;`;
const Label = styled.span`font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.text};`;
const Desc = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;
const Switch = styled.span<{ $on: boolean }>`
  position: relative; width: 46px; height: 28px; border-radius: 999px; flex-shrink: 0;
  background: ${p => (p.$on ? theme.colors.success : theme.colors.border)};
  transition: background ${theme.motion.base};
  &::after {
    content: ''; position: absolute; top: 3px; right: 3px; width: 22px; height: 22px; border-radius: 50%;
    background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.25);
    transform: translateX(${p => (p.$on ? '-18px' : '0')});
    transition: transform ${theme.motion.base} ${theme.motion.spring};
  }
`;

interface Props { prefs: PushPrefs; onChange: (patch: Partial<PushPrefs>) => void; }

export default function PushToggles({ prefs, onChange }: Props) {
  return (
    <List>
      {ROWS.map(r => (
        <Row key={r.key} type="button" role="switch" aria-checked={prefs[r.key]} onClick={() => onChange({ [r.key]: !prefs[r.key] })}>
          <Icon><LineIcon name={r.icon} size={20} /></Icon>
          <Text><Label>{r.label}</Label><Desc>{r.desc}</Desc></Text>
          <Switch $on={prefs[r.key]} aria-hidden="true" />
        </Row>
      ))}
    </List>
  );
}
