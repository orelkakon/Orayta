import styled from 'styled-components';
import { theme } from '@/lib/theme';

const field = `
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  direction: rtl;
  &:focus { outline: 2px solid color-mix(in srgb, ${theme.colors.primary} 25%, transparent); border-color: ${theme.colors.primary}; }
`;

// Fills the sheet so the text field can take every pixel left under the details.
export const Form = styled.form`
  flex: 1 0 auto; display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;
export const Label = styled.label`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
`;
export const TextLabel = styled(Label)`flex: 1 0 auto;`;
export const Input = styled.input`
  ${field}
  padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: 0.95rem;
`;
// Grows with its text (useAutoGrow): the sheet scrolls, never the field itself.
export const Textarea = styled.textarea`
  ${field}
  flex: 1 0 auto; min-height: 220px; resize: none; overflow: hidden;
  padding: ${theme.spacing.md};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; line-height: 1.85;
  font-weight: 400;
  ${theme.up.md} { min-height: 320px; font-size: ${theme.fontSizes.lg}; }
`;
export const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  @media (max-width: 480px) { grid-template-columns: 1fr; }
`;
export const RangeToggle = styled.label`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: 0.82rem; color: ${theme.colors.textMuted}; cursor: pointer;
  user-select: none;
  input[type="checkbox"] { accent-color: ${theme.colors.primary}; width: 15px; height: 15px; }
`;
export const DraftBadge = styled.div`
  font-size: 0.76rem; color: ${theme.colors.primary};
  background: color-mix(in srgb, ${theme.colors.primary} 7%, transparent); border: 1px solid color-mix(in srgb, ${theme.colors.primary} 16%, transparent);
  border-radius: ${theme.radii.sm}; padding: 4px 10px; align-self: flex-start;
`;
export const ErrorMsg = styled.p`font-size: 0.82rem; color: ${theme.colors.error}; margin-bottom: ${theme.spacing.xs};`;
export const FootRow = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
`;
export const WordCount = styled.span`
  flex: 1; min-width: 0; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  font-variant-numeric: tabular-nums;
`;
