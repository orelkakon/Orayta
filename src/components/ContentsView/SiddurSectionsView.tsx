'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { SiddurSection } from '@/lib/prayers/types';
import SiddurSectionBody from './SiddurSectionBody';
import { Chip, ChipRow } from '@/components/ui/Chip';
import { useSwipeNav } from '@/components/common/useSwipeNav';

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

interface Props { sections: SiddurSection[]; }

export default function SiddurSectionsView({ sections }: Props) {
  const [idx, setIdx] = useState(0);
  const current = sections[idx];
  const swipe = useSwipeNav({
    onNext: () => setIdx(i => i + 1),
    onPrev: () => setIdx(i => i - 1),
    canNext: idx < sections.length - 1,
    canPrev: idx > 0,
    enabled: sections.length > 1,
  });

  return (
    <Wrap {...swipe}>
      <ChipRow role="tablist">
        {sections.map((s, i) => (
          <Chip key={i} role="tab" aria-selected={i === idx} $selected={i === idx} onClick={() => setIdx(i)}>
            {s.name}
          </Chip>
        ))}
      </ChipRow>
      <SiddurSectionBody section={current} />
    </Wrap>
  );
}
