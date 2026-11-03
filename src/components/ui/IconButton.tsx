'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Round icon-only button. Always a ≥44px touch target, even when the visible
 * disc is smaller (`sm` draws 36px and extends the hit area invisibly).
 * Icon-only buttons must carry an aria-label.
 */
export type IconButtonVariant = 'plain' | 'tonal' | 'surface' | 'chrome' | 'glass' | 'primary';

const VARIANTS: Record<IconButtonVariant, ReturnType<typeof css>> = {
  plain: css`
    color: ${theme.colors.textMuted};
    @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.colors.surfaceAlt}; color: ${theme.colors.text}; } }
  `,
  tonal: css`
    color: ${theme.colors.text};
    background: color-mix(in srgb, ${theme.colors.text} 7%, transparent);
    @media (hover: hover) and (pointer: fine) { &:hover { background: color-mix(in srgb, ${theme.colors.text} 12%, transparent); } }
  `,
  surface: css`
    color: ${theme.colors.text};
    background: ${theme.colors.surface};
    border: 1px solid ${theme.colors.borderLight};
    box-shadow: ${theme.shadows.sm};
  `,
  chrome: css`
    color: ${theme.colors.onChrome};
    @media (hover: hover) and (pointer: fine) { &:hover { background: color-mix(in srgb, ${theme.colors.onChrome} 12%, transparent); } }
  `,
  glass: css`
    color: ${theme.onMedia.ink};
    background: ${theme.onMedia.glass};
    -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px);
    border: 1px solid ${theme.onMedia.line};
  `,
  primary: css`
    color: ${theme.colors.onPrimary};
    background: ${theme.colors.primary};
    box-shadow: ${theme.shadows.sm};
  `,
};

const IconButton = styled.button.attrs<{ type?: string }>(p => ({ type: p.type ?? 'button' }))<{
  $variant?: IconButtonVariant;
  $size?: 'sm' | 'md' | 'lg';
}>`
  position: relative;
  flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  width: ${p => (p.$size === 'sm' ? '36px' : p.$size === 'lg' ? '52px' : '44px')};
  height: ${p => (p.$size === 'sm' ? '36px' : p.$size === 'lg' ? '52px' : '44px')};
  border-radius: ${theme.radii.pill};
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease, color 0.15s ease;
  ${p => VARIANTS[p.$variant ?? 'plain']}
  &:active { transform: scale(0.92); }
  &:disabled { opacity: 0.45; pointer-events: none; }
  /* Small discs keep a 44px invisible hit area. */
  &::after {
    content: ''; position: absolute;
    inset: ${p => (p.$size === 'sm' ? '-4px' : '0')};
  }
  svg { display: block; }
`;

export default IconButton;
