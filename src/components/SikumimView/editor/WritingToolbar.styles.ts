import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

const pulse = keyframes`0%, 100% { box-shadow: 0 0 0 0 color-mix(in srgb, ${theme.colors.error} 45%, transparent); } 50% { box-shadow: 0 0 0 7px transparent; }`;

export const Bar = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm}; min-height: 44px;
`;
export const Group = styled.div`
  flex: 1; min-width: 0; display: flex; align-items: center; justify-content: flex-end; gap: 4px;
`;
export const Tool = styled.button<{ $wide?: boolean }>`
  min-width: 44px; min-height: 44px; padding: 0 ${p => (p.$wide ? '12px' : '0')};
  display: inline-flex; align-items: center; justify-content: center; gap: 5px;
  border-radius: ${theme.radii.md}; border: 1px solid ${theme.colors.borderLight};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  font-size: ${p => (p.$wide ? theme.fontSizes.sm : '1.3rem')}; font-weight: 600; line-height: 1;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none;
  &:active:not(:disabled) { transform: scale(0.94); background: ${theme.colors.borderLight}; }
  &:disabled { opacity: 0.45; }
  transition: transform 0.12s ${theme.motion.outStrong};
`;
export const MicTool = styled.button<{ $live?: boolean }>`
  flex: none; min-height: 44px; min-width: 44px; padding: 0 14px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: ${theme.radii.pill}; border: none;
  font-size: ${theme.fontSizes.sm}; font-weight: 700;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation; user-select: none;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  ${p => p.$live && css`
    padding: 0; width: 44px; background: ${theme.colors.error}; color: ${theme.colors.onPrimary};
    animation: ${pulse} 1.6s ${theme.motion.inOut} infinite;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
  &:active { transform: scale(0.95); }
  transition: transform 0.12s ${theme.motion.outStrong};
`;
export const Live = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;
export const LiveText = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm}; height: 26px;`;
export const LiveHint = styled.span`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
export const Clock = styled.span`
  flex: none; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  font-variant-numeric: tabular-nums; direction: ltr;
`;
export const Notice = styled.div<{ $error?: boolean }>`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm}; padding: 6px 6px 6px 12px; padding-inline-start: 12px;
  border-radius: ${theme.radii.md}; font-size: ${theme.fontSizes.sm};
  color: ${p => (p.$error ? theme.colors.error : theme.colors.text)};
  background: ${p => (p.$error ? theme.colors.bgError : `color-mix(in srgb, ${theme.colors.primary} 8%, transparent)`)};
`;
export const NoticeBtn = styled.button`
  flex: none; min-height: 36px; min-width: 36px; padding: 0 10px; border-radius: ${theme.radii.sm};
  font-weight: 700; color: inherit; background: transparent;
  -webkit-tap-highlight-color: transparent;
`;
