'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

const Wrap = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`;

/* Leading (right, in RTL) search glyph — tells the eye what the field is for
   before the placeholder is read. */
const SearchGlyph = styled.span`
  position: absolute;
  right: 12px;
  display: flex;
  align-items: center;
  color: ${theme.colors.textMuted};
  pointer-events: none;
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  padding-right: 38px;
  padding-left: 60px;
  border: 2px solid ${theme.colors.borderStrong};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  width: 100%;
  transition: border-color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  &:focus {
    border-color: ${theme.colors.primaryLight};
    box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.primaryLight} 18%, transparent);
  }
`;

const ClearBtn = styled.button<{ $visible: boolean }>`
  position: absolute;
  left: ${theme.spacing.sm};
  display: flex;
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
  opacity: ${p => (p.$visible ? 1 : 0)};
  visibility: ${p => (p.$visible ? 'visible' : 'hidden')};
  transform: ${p => (p.$visible ? 'scale(1)' : 'scale(0.85)')};
  transition: opacity ${theme.motion.fast} ease, transform ${theme.motion.fast} ease,
    visibility ${theme.motion.fast} ease, color ${theme.motion.fast} ease,
    background ${theme.motion.fast} ease;
  white-space: nowrap;
  &:hover {
    color: ${theme.colors.primary};
    border-color: ${theme.colors.border};
    background: ${theme.colors.surface};
  }
  &:active { transform: scale(0.92); }
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
      <SearchGlyph aria-hidden="true"><LineIcon name="search" size={16} /></SearchGlyph>
      {/* type="text": WebKit's built-in ✕ on type="search" doubled our custom clear button. */}
      <Input
        type="text"
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
