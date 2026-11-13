import styled from 'styled-components';
import { theme } from '@/lib/theme';

export const Form = styled.form`display: flex; flex-direction: column;`;
export const Field = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm}; border: none; margin: 0; padding: 0; min-width: 0;
`;
export const Label = styled.label`font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.text}; padding: 0;`;
export const Hint = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; line-height: 1.5; color: ${theme.colors.textMuted};`;
/* 16px: anything smaller makes iOS zoom in on focus. */
export const Input = styled.input`
  height: 48px; padding: 0 ${theme.spacing.ms}; border-radius: ${theme.radii.md}; min-width: 0; width: 100%; flex-shrink: 0;
  font-family: ${theme.fonts.ui}; font-size: 16px; color: ${theme.colors.text};
  border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  transition: border-color ${theme.motion.fast};
  &:focus { outline: none; border-color: ${theme.colors.secondary}; }
  /* iOS draws date fields at their own intrinsic width, past the column. */
  &[type='date'] { -webkit-appearance: none; appearance: none; display: block; text-align: start; }
  &::-webkit-date-and-time-value { text-align: start; }
`;
export const Area = styled.textarea`
  min-height: 88px; padding: ${theme.spacing.sm} ${theme.spacing.ms}; border-radius: ${theme.radii.md}; resize: vertical;
  font-family: ${theme.fonts.ui}; font-size: 16px; line-height: 1.5; color: ${theme.colors.text};
  border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  &:focus { outline: none; border-color: ${theme.colors.secondary}; }
`;
export const ErrorLine = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.error};`;
export { Honeypot } from '@/components/ui/Honeypot';
