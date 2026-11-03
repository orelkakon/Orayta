import styled from 'styled-components';
import { theme } from '@/lib/theme';

// Shared controls + text surface used by the chapter readers (תנ״ך, תהילים, תיקון הכללי)
export const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

export const Controls = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

export const Select = styled.select`
  min-height: 44px; padding: 0 36px 0 14px; border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border}; background-color: ${theme.colors.surface};
  color: ${theme.colors.text}; font-size: 1rem; font-weight: 600; font-family: ${theme.fonts.body};
  box-shadow: ${theme.shadows.sm};
  &:focus-visible { border-color: ${theme.colors.gold}; }
`;

/** Round previous/next chapter button (pass a chevron icon as the child). */
export const NavBtn = styled.button`
  min-width: 44px; height: 44px; padding: 0 12px; border-radius: ${theme.radii.pill}; flex-shrink: 0;
  font-size: ${theme.fontSizes.sm}; font-weight: 600;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid ${theme.colors.border}; background: ${theme.colors.surface};
  color: ${theme.colors.text}; box-shadow: ${theme.shadows.sm};
  transition: transform 0.16s ${theme.motion.outStrong}, border-color 0.15s ease;
  &:active:not(:disabled) { transform: scale(0.92); }
  &:hover:not(:disabled) { border-color: ${theme.colors.gold}; }
  &:disabled { opacity: 0.35; }
`;

export const JumpBtn = styled.button`
  min-height: 38px; padding: 0 14px; border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.primary};
  background: color-mix(in srgb, ${theme.colors.primary} 9%, transparent);
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease;
  &:active:not(:disabled) { transform: scale(0.96); }
  &:disabled { opacity: 0.45; }
`;

// Pushes the trailing item (e.g. the speak button) to the far end of the row
export const Spacer = styled.div`flex: 1;`;

// Secondary row of quick-jump chips under the main navigation
export const Shortcuts = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

export const CardTitle = styled.h2`
  font-family: ${theme.fonts.body}; font-size: calc(1.1rem * var(--siddur-scale, 1.22)); font-weight: 700;
  color: ${theme.colors.primary}; text-align: center;
  padding-bottom: ${theme.spacing.sm}; margin-bottom: ${theme.spacing.md};
  border-bottom: 1px solid color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
`;

export const CardSubtitle = styled.div`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 600; color: ${theme.colors.textMuted};
  margin-top: 4px;
`;

/** The reading surface — quiet, so the text carries the page. */
export const TextCard = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: 20px;
  padding: ${theme.spacing.lg};
  ${theme.media.sm} { padding: ${theme.spacing.md}; border-radius: 16px; }
`;

export const Loading = styled.div`
  text-align: center; color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl}; font-size: 0.95rem;
`;
