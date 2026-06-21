'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-left: 60px;
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  outline: none;
  width: 100%;
  transition: border-color 0.15s;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const ClearBtn = styled.button<{ $visible: boolean }>`
  position: absolute;
  left: ${theme.spacing.sm};
  display: ${p => (p.$visible ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  border-radius: ${theme.radii.sm};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.textLight};
  border: 1px solid ${theme.colors.borderLight};
  background: ${theme.colors.surfaceAlt};
  transition: all 0.15s;
  white-space: nowrap;
  &:hover {
    color: ${theme.colors.primary};
    border-color: ${theme.colors.border};
    background: ${theme.colors.surface};
  }
`;

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function SearchField({ value, onChange, placeholder, autoFocus }: Props) {
  return (
    <Wrap>
      <Input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder ?? ''}
        autoFocus={autoFocus}
      />
      <ClearBtn
        $visible={value.length > 0}
        onClick={() => onChange('')}
        type="button"
        tabIndex={-1}
        aria-label="נקה חיפוש"
      >
        {HE.SEARCH_CLEAR}
      </ClearBtn>
    </Wrap>
  );
}
