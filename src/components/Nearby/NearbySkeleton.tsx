'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton';

/** Map + result-card placeholders while the first search runs. */
const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;

const CardSkel = styled.div`
  display: flex; flex-direction: column; gap: 10px; padding: ${theme.spacing.md};
  border-radius: 18px; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
`;

const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: 10px;`;

export default function NearbySkeleton() {
  return (
    <Wrap aria-busy="true" aria-label={HE.LOADING}>
      <Skeleton $h="clamp(220px, 34svh, 360px)" $r="20px" />
      {[0, 1, 2].map(i => (
        <CardSkel key={i}>
          <Row><Skeleton $w="55%" $h="18px" /><Skeleton $w="44px" $h="44px" $r="14px" /></Row>
          <SkeletonText lines={2} />
        </CardSkel>
      ))}
    </Wrap>
  );
}
