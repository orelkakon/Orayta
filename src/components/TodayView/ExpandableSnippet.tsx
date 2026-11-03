'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

/** Clamped text that offers "read more" only when it actually overflows. */
const Text = styled.div<{ $open: boolean; $lines: number }>`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; color: ${theme.colors.text};
  line-height: 1.7; margin-top: 2px; white-space: pre-line;
  ${p => !p.$open && `display: -webkit-box; -webkit-line-clamp: ${p.$lines}; -webkit-box-orient: vertical; overflow: hidden;`}
`;

const More = styled.button`
  align-self: flex-start; display: inline-flex; align-items: center; gap: 4px;
  min-height: 36px; padding: 0 2px;
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondaryText};
  svg { transition: transform 0.2s ${theme.motion.outStrong}; }
  &[aria-expanded='true'] svg { transform: rotate(180deg); }
`;

export default function ExpandableSnippet({ text, lines = 5 }: { text: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 2);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text, open]);

  return (
    <>
      <Text ref={ref} $open={open} $lines={lines}>{text}</Text>
      {(overflows || open) && (
        <More type="button" aria-expanded={open} onClick={() => setOpen(o => !o)}>
          {open ? HE.LEARN_LESS_TEXT : HE.LEARN_MORE_TEXT}
          <LineIcon name="chevronDown" size={16} strokeWidth={2.2} />
        </More>
      )}
    </>
  );
}
