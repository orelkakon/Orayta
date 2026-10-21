'use client';

import { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { FEED_GOLD } from '@/components/FeedView/feedTypes';
import { contextLocations, type ContextCitation } from './useCitationContext';
import ContextSheet from './ContextSheet';

/** `card` — study cards; `inline` — quiz reveals; `feed` — the dark רגע של תורה slides. */
export type ContextButtonVariant = 'card' | 'inline' | 'feed';

const Btn = styled.button<{ $v: ContextButtonVariant }>`
  -webkit-tap-highlight-color: transparent;
  display: inline-flex; align-items: center; gap: 6px; white-space: nowrap;
  font-family: ${theme.fonts.ui}; font-weight: 600; cursor: pointer;
  transition: background ${theme.motion.fast}, border-color ${theme.motion.fast}, transform ${theme.motion.fast};
  &:active { transform: scale(0.96); }
  &:focus-visible { outline: 2px solid ${theme.colors.primaryLight}; outline-offset: 2px; }

  ${p => p.$v === 'card' && css`
    height: 34px; font-size: 0.82rem; padding: 0 14px; border-radius: 999px;
    color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt};
    border: 1px solid ${theme.colors.border};
    &:hover { border-color: ${theme.colors.primaryLight}; background: ${theme.colors.background}; }
  `}
  ${p => p.$v === 'inline' && css`
    align-self: flex-start; font-size: ${theme.fontSizes.sm}; padding: 6px 14px; border-radius: 999px;
    color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt};
    border: 1px solid ${theme.colors.borderLight};
    &:hover { border-color: ${theme.colors.primaryLight}; }
  `}
  ${p => p.$v === 'feed' && css`
    font-size: 0.78rem; padding: 5px 13px; border-radius: 999px;
    color: rgba(${FEED_GOLD}, 0.98); background: rgba(${FEED_GOLD}, 0.1);
    -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
    border: 1px solid rgba(${FEED_GOLD}, 0.42);
    &:hover { background: rgba(${FEED_GOLD}, 0.18); }
  `}
`;

interface Props { citation: ContextCitation; variant?: ContextButtonVariant }

/** "הצג בהקשר" — opens the citation inside its Talmud page; renders nothing when no location is openable. */
export default function ContextButton({ citation, variant = 'card' }: Props) {
  const [open, setOpen] = useState(false);
  const usable = useMemo(() => contextLocations(citation.locations).length > 0, [citation.locations]);
  if (!usable) return null;

  return (
    <>
      <Btn
        type="button" $v={variant} title={HE.TC_OPEN_ARIA} aria-haspopup="dialog"
        onClick={e => { e.stopPropagation(); setOpen(true); }}
      >
        <LineIcon name="openbook" size={variant === 'card' ? 14 : 15} strokeWidth={1.8} />
        {HE.TC_OPEN}
      </Btn>
      {open && <ContextSheet citation={citation} onClose={() => setOpen(false)} />}
    </>
  );
}
