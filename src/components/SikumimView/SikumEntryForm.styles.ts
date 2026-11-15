import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { Button } from '@/components/ui/Button';

const field = `
  border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  direction: rtl;
  &:focus { outline: 2px solid color-mix(in srgb, ${theme.colors.primary} 25%, transparent); border-color: ${theme.colors.primary}; }
`;

// Fills the sheet so the text field can take every pixel left under the details.
export const Form = styled.form`
  flex: 1 0 auto; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  ${theme.up.md} { gap: ${theme.spacing.md}; }
`;
export const Label = styled.label`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs}; min-width: 0;
  font-size: 0.9rem; font-weight: 600; color: ${theme.colors.text};
`;
export const TextLabel = styled(Label)`flex: 1 0 auto;`;
export const Input = styled.input`
  ${field}
  width: 100%; min-width: 0; min-height: 44px;
  padding: ${theme.spacing.sm} ${theme.spacing.md}; font-size: 1rem;
`;
// Grows with its text (useAutoGrow): the sheet scrolls, never the field itself.
export const Textarea = styled.textarea`
  ${field}
  flex: 1 0 auto; min-height: 220px; resize: none; overflow: hidden;
  padding: ${theme.spacing.md};
  /* 18px beats the phones' global 16px rule — writing in the serif face needs the size. */
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg} !important; line-height: 1.85;
  font-weight: 400;
  ${theme.up.md} { min-height: 320px; }
`;
export const Chips = styled.div`
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap; min-width: 0;
`;
export const ChipsLabel = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-weight: 600;`;
export const DraftBadge = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  font-size: 0.8rem; color: ${theme.colors.primary};
  background: color-mix(in srgb, ${theme.colors.primary} 7%, transparent); border: 1px solid color-mix(in srgb, ${theme.colors.primary} 16%, transparent);
  border-radius: ${theme.radii.sm}; padding: 2px 4px 2px 10px; padding-inline-start: 10px;
  button { min-height: 36px; padding: 0 10px; font-weight: 700; color: inherit; text-decoration: underline; }
`;
export const ErrorMsg = styled.p`font-size: 0.85rem; color: ${theme.colors.error}; margin-bottom: ${theme.spacing.xs};`;
export const SavedMsg = styled.p`font-size: 0.85rem; color: ${theme.colors.success}; font-weight: 600; margin-bottom: ${theme.spacing.xs};`;
export const TextHead = styled.span`
  display: flex; align-items: baseline; justify-content: space-between; gap: ${theme.spacing.sm};
`;
export const Status = styled.span`
  min-width: 0; font-size: ${theme.fontSizes.xs}; font-weight: 500; color: ${theme.colors.textMuted};
  font-variant-numeric: tabular-nums; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
`;
/** Save buttons in the sheet's title bar. */
export const HeadBtn = styled(Button)`
  flex: none; min-height: 40px; padding: 0 14px; font-weight: 700;
`;
