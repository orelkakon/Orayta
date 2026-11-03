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
  position: absolute; right: 14px;
  display: flex; align-items: center;
  color: ${theme.colors.textMuted};
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%; height: 48px;
  padding: 0 44px 0 48px;
  border: 1px solid ${theme.colors.border};
  border-radius: 14px;
  font-size: 1rem;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  box-shadow: ${theme.shadows.sm};
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  &::placeholder { color: ${theme.colors.textLight}; }
  &:focus {
    outline: none;
    border-color: color-mix(in srgb, ${theme.colors.gold} 70%, ${theme.colors.border});
    box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.gold} 20%, transparent);
  }
`;

const ClearBtn = styled.button<{ $visible: boolean }>`
  position: absolute; left: 6px;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textMuted};
  background: color-mix(in srgb, ${theme.colors.text} 7%, transparent);
  opacity: ${p => (p.$visible ? 1 : 0)};
  visibility: ${p => (p.$visible ? 'visible' : 'hidden')};
  transform: scale(${p => (p.$visible ? 1 : 0.85)});
  transition: opacity 0.15s ease, transform 0.16s ${theme.motion.outStrong}, visibility 0.15s;
  &:active { transform: scale(0.9); }
`;

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  /** Delay before `onChange` fires, in ms. 0 disables debouncing. */
  debounceMs?: number;
  /** Accessible name; defaults to the placeholder. */
  ariaLabel?: string;
}

export default function SearchField({
  value,
  onChange,
  placeholder,
  autoFocus,
  debounceMs = 250,
  ariaLabel,
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
      <SearchGlyph aria-hidden="true"><LineIcon name="search" size={19} strokeWidth={1.8} /></SearchGlyph>
      {/* type="text": WebKit's built-in ✕ on type="search" doubled our custom clear button. */}
      <Input
        type="text"
        value={draft}
        onChange={e => setDraft(e.target.value)}
        placeholder={placeholder ?? ''}
        autoFocus={autoFocus}
        enterKeyHint="search"
        aria-label={ariaLabel ?? placeholder}
      />
      <ClearBtn
        $visible={draft.length > 0}
        onClick={clear}
        type="button"
        aria-label={HE.ARIA_SEARCH_CLEAR}
        title={HE.SEARCH_CLEAR}
      >
        <LineIcon name="close" size={16} strokeWidth={2.2} />
      </ClearBtn>
    </Wrap>
  );
}
