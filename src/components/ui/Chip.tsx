'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Filter / choice chip. Pass `aria-pressed` (toggle) or use inside a
 * radiogroup with `role="radio"` + `aria-checked`; `$selected` drives the look.
 */
export const Chip = styled.button.attrs<{ type?: string }>(p => ({ type: p.type ?? 'button' }))<{
  $selected?: boolean;
  $size?: 'sm' | 'md';
}>`
  flex-shrink: 0;
  display: inline-flex; align-items: center; gap: 6px;
  min-height: ${p => (p.$size === 'sm' ? '32px' : '38px')};
  padding: 0 ${p => (p.$size === 'sm' ? '12px' : '15px')};
  border-radius: ${theme.radii.pill};
  font-family: ${theme.fonts.ui};
  font-size: ${p => (p.$size === 'sm' ? theme.fontSizes.xs : theme.fontSizes.sm)};
  font-weight: 600; white-space: nowrap;
  border: 1px solid ${p => (p.$selected ? theme.colors.primary : theme.colors.border)};
  background: ${p => (p.$selected ? theme.colors.primary : theme.colors.surface)};
  color: ${p => (p.$selected ? theme.colors.onPrimary : theme.colors.text)};
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease,
    border-color 0.15s ease, color 0.15s ease;
  &:active { transform: scale(0.96); }
  @media (hover: hover) and (pointer: fine) {
    &:hover { border-color: ${p => (p.$selected ? theme.colors.primary : theme.colors.borderStrong)}; }
  }
  /* Keep a 44px tap height without a 44px-tall chip. */
  position: relative;
  &::after { content: ''; position: absolute; inset: -4px 0; }
`;

export const ChipCount = styled.span`
  font-variant-numeric: tabular-nums;
  font-size: 0.85em; opacity: 0.7;
`;

/**
 * Horizontally scrolling chip row that bleeds to the screen edges on mobile
 * and fades out at both ends instead of clipping hard.
 */
export const ChipRow = styled.div`
  display: flex; gap: ${theme.spacing.sm};
  overflow-x: auto; overscroll-behavior-x: contain;
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
  padding: 4px ${theme.layout.gutter};
  margin: 0 calc(-1 * ${theme.layout.gutter});
  scroll-padding-inline: ${theme.layout.gutter};
  -webkit-mask-image: linear-gradient(to left, transparent 0, #000 ${theme.spacing.md}, #000 calc(100% - ${theme.spacing.md}), transparent 100%);
  mask-image: linear-gradient(to left, transparent 0, #000 ${theme.spacing.md}, #000 calc(100% - ${theme.spacing.md}), transparent 100%);
  ${theme.up.md} {
    flex-wrap: wrap; overflow: visible; margin: 0; padding: 4px 0;
    -webkit-mask-image: none; mask-image: none;
  }
`;
