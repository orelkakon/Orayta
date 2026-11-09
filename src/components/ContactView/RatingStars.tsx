'use client';

import { KeyboardEvent, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

// Two identical keyframes: alternating between them replays the pop on every pick.
const POP = [
  keyframes`0% { transform: scale(1); } 40% { transform: scale(1.32) rotate(-8deg); } 100% { transform: scale(1); }`,
  keyframes`0% { transform: scale(1); } 40% { transform: scale(1.32) rotate(-8deg); } 100% { transform: scale(1); }`,
];

const Row = styled.div`display: flex; align-items: center; gap: ${theme.spacing.md}; flex-wrap: wrap;`;
const Stars = styled.div`display: flex; gap: 2px; direction: ltr;`;

const Star = styled.button<{ $on: boolean; $pop: number; $d: number }>`
  width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center;
  border-radius: 12px; color: ${p => (p.$on ? theme.colors.gold : theme.colors.border)};
  transition: color 0.2s ease, transform 0.16s ${theme.motion.outStrong};
  svg { transition: filter 0.2s ease; }
  ${p => p.$on && css`svg { filter: drop-shadow(0 2px 6px color-mix(in srgb, ${theme.colors.gold} 45%, transparent)); }`}
  ${p => p.$pop > 0 && css`
    svg { animation: ${POP[p.$pop % 2]} 0.42s ${theme.motion.outStrong} both; animation-delay: ${p.$d * 45}ms; }
    @media (prefers-reduced-motion: reduce) { svg { animation: none; } }
  `}
  &:active { transform: scale(0.9); }
  &:focus-visible { outline: 2px solid ${theme.colors.gold}; outline-offset: 1px; }
`;

const Word = styled.span<{ $on: boolean }>`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; min-height: 1.4em;
  color: ${p => (p.$on ? theme.colors.primary : theme.colors.textLight)};
  transition: color 0.2s ease;
`;

const StarIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 2.8l2.75 5.9 6.45.72-4.8 4.37 1.33 6.36L12 16.9l-5.73 3.25 1.33-6.36-4.8-4.37 6.45-.72z" />
  </svg>
);

/** 1–5 stars as a radio group; tapping the chosen star again clears it. */
export default function RatingStars({ value, onChange, labelId }: { value: number; onChange: (n: number) => void; labelId: string }) {
  const [hover, setHover] = useState(0);
  const [popped, setPopped] = useState(0);
  const shown = hover || value;

  const pick = (n: number) => { const next = value === n ? 0 : n; onChange(next); setPopped(next ? popped + 1 : 0); };
  const onKey = (e: KeyboardEvent) => {
    // Visual order is LTR (1 on the left) on an RTL page.
    if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); onChange(Math.min(5, value + 1)); }
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); onChange(Math.max(1, value - 1)); }
  };

  return (
    <Row>
      <Stars role="radiogroup" aria-labelledby={labelId} onPointerLeave={() => setHover(0)} onKeyDown={onKey}>
        {[1, 2, 3, 4, 5].map(n => (
          <Star key={n} type="button" role="radio" aria-checked={value === n}
            aria-label={HE.CONTACT_RATING_ARIA(n)} tabIndex={n === (value || 1) ? 0 : -1}
            $on={n <= shown} $pop={n <= value ? popped : 0} $d={n}
            onPointerEnter={e => { if (e.pointerType === 'mouse') setHover(n); }} onClick={() => pick(n)}>
            <StarIcon />
          </Star>
        ))}
      </Stars>
      <Word $on={shown > 0} aria-live="polite">{HE.CONTACT_RATING_WORDS[shown] ?? ''}</Word>
    </Row>
  );
}
