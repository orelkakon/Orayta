'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * A settings row with an iOS-style switch. The whole row is the control
 * (role="switch"), so the label is part of the 44px+ tap target.
 */
const Row = styled.button`
  width: 100%; min-height: 52px;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 8px ${theme.spacing.md};
  text-align: start; color: ${theme.colors.text};
  font-size: ${theme.fontSizes.md}; font-weight: 500;
  transition: background-color 0.15s ease;
  &:active { background: color-mix(in srgb, ${theme.colors.text} 5%, transparent); }
`;

const Label = styled.span`flex: 1; min-width: 0;`;

const Icon = styled.span`
  display: inline-flex; color: ${theme.colors.textMuted};
`;

const Track = styled.span<{ $on: boolean }>`
  position: relative; flex-shrink: 0;
  width: 46px; height: 28px; border-radius: 14px;
  background: ${p => (p.$on ? theme.colors.success : `color-mix(in srgb, ${theme.colors.text} 16%, transparent)`)};
  transition: background-color 0.2s ease;
  &::after {
    content: ''; position: absolute; top: 2px; right: 2px;
    width: 24px; height: 24px; border-radius: 50%;
    background: ${theme.onMedia.ink};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
    /* RTL: "on" slides the knob to the left (inline-end). */
    transform: translateX(${p => (p.$on ? '-18px' : '0')});
    transition: transform 0.22s ${theme.motion.outStrong};
  }
`;

interface SwitchRowProps {
  label: ReactNode;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon?: ReactNode;
}

export default function SwitchRow({ label, checked, onChange, icon }: SwitchRowProps) {
  return (
    <Row type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}>
      {icon && <Icon aria-hidden="true">{icon}</Icon>}
      <Label>{label}</Label>
      <Track $on={checked} aria-hidden="true" />
    </Row>
  );
}

/** Grouped list container (iOS "inset grouped" style) for rows. */
export const RowGroup = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg};
  overflow: hidden;
  & > * + * { border-top: 1px solid ${theme.colors.borderLight}; }
`;
