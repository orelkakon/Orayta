import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

const reveal = keyframes`from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: none; }`;

/** The folded date · location row — one 48px tap target. */
export const Summary = styled.button`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; width: 100%; min-height: 48px;
  padding: 0 ${theme.spacing.md}; border-radius: ${theme.radii.md};
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface};
  color: ${theme.colors.text}; font-size: ${theme.fontSizes.sm}; font-weight: 600; text-align: start;
  -webkit-tap-highlight-color: transparent; touch-action: manipulation;
  &:active { background: ${theme.colors.borderLight}; }
`;
export const SumPart = styled.span<{ $muted?: boolean }>`
  display: inline-flex; align-items: center; gap: 6px; min-width: 0;
  color: ${p => (p.$muted ? theme.colors.textMuted : theme.colors.text)};
  font-weight: ${p => (p.$muted ? 500 : 600)};
  svg { flex: none; color: ${theme.colors.primary}; }
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
`;
export const SumSep = styled.span`width: 1px; height: 18px; flex: none; background: ${theme.colors.border};`;
export const SumChevron = styled.span<{ $open: boolean }>`
  margin-inline-start: auto; display: inline-flex; color: ${theme.colors.textMuted};
  transform: rotate(${p => (p.$open ? '180deg' : '0deg')}); transition: transform 0.2s ${theme.motion.outStrong};
`;
export const Panel = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.md};
  border-radius: ${theme.radii.md}; background: color-mix(in srgb, ${theme.colors.primary} 4%, ${theme.colors.surface});
  border: 1px solid ${theme.colors.borderLight};
  animation: ${reveal} 0.2s ${theme.motion.outStrong};
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;
export const Field = styled.div`display: flex; flex-direction: column; gap: 6px; min-width: 0;`;
export const FieldHead = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  min-height: 32px; font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
`;
/* iOS draws date fields at their own intrinsic width, past the column — keep it in its box. */
export const DateInput = styled.input`
  display: block; width: 100%; max-width: 100%; min-width: 0; min-height: 44px;
  -webkit-appearance: none; appearance: none; text-align: start;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: 1rem; direction: rtl;
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  &::-webkit-date-and-time-value { text-align: start; }
  &:focus { outline: 2px solid color-mix(in srgb, ${theme.colors.primary} 25%, transparent); border-color: ${theme.colors.primary}; }
`;
export const RangeToggle = styled.label`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; min-height: 44px;
  font-size: 0.88rem; color: ${theme.colors.textMuted}; cursor: pointer;
  user-select: none; -webkit-tap-highlight-color: transparent;
  input[type="checkbox"] { accent-color: ${theme.colors.primary}; width: 20px; height: 20px; flex: none; }
`;
