'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';

const Row = styled.div`
  display: flex; gap: 4px; width: 100%;
`;

const Seg = styled.div`
  flex: 1; height: 3px; border-radius: 2px;
  background: rgba(255, 248, 235, 0.28);
  overflow: hidden;
`;

/* RTL: segments flow right-to-left and each bar fills from its right edge,
   matching the reading direction. The active fill is driven imperatively by
   useStoryTimer via this ref (no re-render per frame). */
const Fill = styled.div`
  height: 100%; width: 100%; border-radius: 2px;
  background: #fdf6e6;
  transform-origin: right center;
  transform: scaleX(0);
`;

interface StoryProgressProps {
  count: number;
  current: number;
}

const StoryProgress = forwardRef<HTMLDivElement, StoryProgressProps>(
  function StoryProgress({ count, current }, barRef) {
    return (
      <Row aria-hidden="true">
        {Array.from({ length: count }, (_, i) => (
          <Seg key={i}>
            {i < current && <Fill style={{ transform: 'scaleX(1)' }} />}
            {i === current && <Fill ref={barRef} />}
          </Seg>
        ))}
      </Row>
    );
  },
);

export default StoryProgress;
