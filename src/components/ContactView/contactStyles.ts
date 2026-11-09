import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const rise = keyframes`from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; }`;

/** Entrance for the page's blocks, staggered by `$i`. */
export const enter = css<{ $i?: number }>`
  animation: ${rise} 0.55s ${theme.motion.outStrong} both;
  animation-delay: ${p => (p.$i ?? 0) * 70}ms;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const Panel = styled.section<{ $i?: number }>`
  ${enter}
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
  border-radius: ${theme.radii.xl};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.md};
  ${theme.media.sm} { padding: ${theme.spacing.lg} ${theme.spacing.md}; border-radius: 20px; }
`;

export const Field = styled.div`display: flex; flex-direction: column; gap: 6px; min-width: 0;`;

export const LabelRow = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: ${theme.spacing.sm};
`;

export const Label = styled.label`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.text};
  em { font-style: normal; font-weight: 500; color: ${theme.colors.textLight}; margin-inline-start: 6px; font-size: ${theme.fontSizes.xs}; }
`;

export const Hint = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.5;`;

const control = css`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1.5px solid ${theme.colors.border};
  background: ${theme.colors.background};
  color: ${theme.colors.text};
  font-family: ${theme.fonts.ui};
  /* 16px keeps iOS from zooming into the field. */
  font-size: 16px; line-height: 1.6;
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease;
  &::placeholder { color: ${theme.colors.textLight}; }
  &:focus {
    border-color: ${theme.colors.gold};
    background: ${theme.colors.surface};
    box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.gold} 18%, transparent);
  }
  &[aria-invalid='true'] {
    border-color: ${theme.colors.error};
    box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.error} 14%, transparent);
  }
`;

export const Input = styled.input`${control} min-height: 48px;`;

export const Textarea = styled.textarea`
  ${control}
  min-height: 148px; resize: none; overflow: hidden; display: block;
`;

export const Pair = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.md};
  ${theme.up.sm} { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

export const Counter = styled.span<{ $near: boolean }>`
  font-size: ${theme.fontSizes.xs}; font-variant-numeric: tabular-nums;
  color: ${p => (p.$near ? theme.colors.error : theme.colors.textLight)};
`;

export const Honeypot = styled.input`
  position: absolute; width: 1px; height: 1px; opacity: 0; pointer-events: none; inset-inline-start: -9999px;
`;
