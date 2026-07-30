'use client';

import { useEffect, useState } from 'react';
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
  border: 2px solid ${theme.colors.borderStrong};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
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
  padding: 6px 10px;
  min-height: 28px;
  border-radius: ${theme.radii.sm};
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: ${theme.colors.textMuted};
  border: 1px solid ${theme.colors.border};
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
  /** Delay before `onChange` fires, in ms. 0 disables debouncing. */
  debounceMs?: number;
}

export default function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus,
  debounceMs = 250,
}: Props) {
  // The input stays instant while the reported value is debounced, so views
  // that refetch on change don't fire a request per keystroke.
  const [draft, setDraft] = useState(value);

  // Keep in sync when the parent resets the value externally.
  useEffect(() => { setDraft(value); }, [value]);

  useEffect(() => {
    if (draft === value) return;
    if (debounceMs === 0) { onChange(draft); return; }
    const id = setTimeout(() => onChange(draft), debounceMs);
    return () => clearTimeout(id);
    // `value`/`onChange` are intentionally omitted: re-running on the parent's
    // echo of our own update would cancel and restart the timer every cycle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, debounceMs]);

  const clear = () => { setDraft(''); onChange(''); };

  return (
    <Wrap>
      <Input
        type="search"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={placeholder ?? ''}
        autoFocus={autoFocus}
        enterKeyHint="search"
      />
      <ClearBtn
        $visible={draft.length > 0}
        onClick={clear}
        type="button"
        aria-label={HE.ARIA_SEARCH_CLEAR}
      >
        {HE.SEARCH_CLEAR}
      </ClearBtn>
    </Wrap>
  );
}
