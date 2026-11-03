'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from './LineIcons';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

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

const Skels = styled.div`
  grid-column: 1 / -1; width: 100%;
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
`;

const SkelCard = styled.div`
  display: flex; flex-direction: column; gap: 10px; padding: ${theme.spacing.md};
  border-radius: 18px; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
`;

const StateIcon = styled.span`
  width: 56px; height: 56px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textLight}; background: ${theme.colors.surfaceAlt};
`;

const ErrorText = styled.span`color: ${theme.colors.text}; font-weight: 600; font-size: ${theme.fontSizes.md};`;

export const InlineError = styled.div`
  grid-column: 1 / -1;
  text-align: center;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 1px solid color-mix(in srgb, ${theme.colors.error} 40%, transparent);
  border-radius: 14px;
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
      <Skels role="status" aria-busy="true" aria-label={HE.LOADING}>
        {[0, 1, 2].map(i => (
          <SkelCard key={i}>
            <Skeleton $w="45%" $h="18px" />
            <SkeletonText lines={2} />
          </SkelCard>
        ))}
      </Skels>
    );
  }
  if (error) {
    return (
      <Block role="alert">
        <StateIcon aria-hidden="true"><LineIcon name="refresh" size={26} strokeWidth={1.7} /></StateIcon>
        <ErrorText>{HE.LOAD_ERROR}</ErrorText>
        <Button $variant="secondary" $size="sm" onClick={onRetry}>{HE.LOAD_ERROR_RETRY}</Button>
      </Block>
    );
  }
  return (
    <Block role="status">
      <StateIcon aria-hidden="true"><LineIcon name="search" size={24} strokeWidth={1.7} /></StateIcon>
      {emptyText}
    </Block>
  );
}
