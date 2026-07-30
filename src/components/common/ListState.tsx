'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

/* `grid-column` is ignored inside flex parents, so one block works for both
   the grid views and the list views. */
const Block = styled.div`
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.ms};
  text-align: center;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.xxl};
  font-size: ${theme.fontSizes.sm};
`;

const spin = keyframes`to { transform: rotate(360deg); }`;

const Spinner = styled.span`
  width: ${theme.spacing.lg};
  height: ${theme.spacing.lg};
  border-radius: 50%;
  border: 2px solid ${theme.colors.borderLight};
  border-top-color: ${theme.colors.primary};
  animation: ${spin} 0.8s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation-duration: 2.4s; }
`;

const ErrorText = styled.span`color: ${theme.colors.error}; font-weight: 600;`;

const RetryBtn = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.lg};
  border: 1px solid ${theme.colors.primary};
  border-radius: ${theme.radii.md};
  background: transparent;
  color: ${theme.colors.primary};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

export const InlineError = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid ${theme.colors.error};
  border-radius: ${theme.radii.md};
  background: ${theme.colors.bgError};
  color: ${theme.colors.error};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
`;

interface Props {
  loading: boolean;
  error: boolean;
  /** Shown when neither loading nor failing and the list has no items. */
  emptyText: string;
  onRetry: () => void;
}

/**
 * Loading / error / empty placeholder for a results area.
 * Render it *instead of* the list when any of the three states is active.
 */
export default function ListState({ loading, error, emptyText, onRetry }: Props) {
  if (loading) {
    return (
      <Block role="status" aria-live="polite">
        <Spinner aria-hidden="true" />
        {HE.LOADING}
      </Block>
    );
  }
  if (error) {
    return (
      <Block role="alert">
        <ErrorText>{HE.LOAD_ERROR}</ErrorText>
        <RetryBtn onClick={onRetry}>{HE.LOAD_ERROR_RETRY}</RetryBtn>
      </Block>
    );
  }
  return <Block>{emptyText}</Block>;
}
