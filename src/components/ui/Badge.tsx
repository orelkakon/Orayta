'use client';

import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';

/** Small status pill: gold (today / special), new, live, success, muted. */
export type BadgeTone = 'gold' | 'new' | 'live' | 'success' | 'muted';

const TONES: Record<BadgeTone, ReturnType<typeof css>> = {
  gold: css`
    background: ${theme.colors.goldSoft}; color: ${theme.colors.secondaryText};
    border-color: color-mix(in srgb, ${theme.colors.gold} 45%, transparent);
  `,
  new: css`background: ${theme.colors.accent}; color: ${theme.onMedia.ink};`,
  live: css`background: ${theme.colors.error}; color: ${theme.onMedia.ink};`,
  success: css`background: ${theme.colors.bgSuccess}; color: ${theme.colors.success};`,
  muted: css`background: ${theme.colors.surfaceAlt}; color: ${theme.colors.textMuted};`,
};

const Badge = styled.span<{ $tone?: BadgeTone }>`
  display: inline-flex; align-items: center; gap: 4px;
  height: 22px; padding: 0 9px;
  border-radius: ${theme.radii.pill};
  border: 1px solid transparent;
  font-size: ${theme.fontSizes.xxs}; font-weight: 700; line-height: 1;
  white-space: nowrap;
  ${p => TONES[p.$tone ?? 'gold']}
`;

export default Badge;
