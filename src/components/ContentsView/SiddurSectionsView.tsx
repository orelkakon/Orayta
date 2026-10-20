'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { SiddurSection } from '@/lib/prayers/types';
import SiddurSectionBody from './SiddurSectionBody';
import { useSwipeNav } from '@/components/common/useSwipeNav';

const Wrap = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Controls = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

const Select = styled.select`
  padding: 6px ${theme.spacing.sm}; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border}; background: ${theme.colors.surface};
  color: ${theme.colors.text}; font-size: 0.88rem; font-family: ${theme.fonts.body};
  &:focus { outline: none; border-color: ${theme.colors.primary}; }
`;

const NavBtn = styled.button`
  padding: 6px 14px; border-radius: ${theme.radii.sm};
  border: 1.5px solid ${theme.colors.border};
  font-size: 0.88rem; color: ${theme.colors.textMuted};
  transition: all 0.15s;
  &:hover:not(:disabled) { border-color: ${theme.colors.primary}; color: ${theme.colors.primary}; }
  &:disabled { opacity: 0.3; }
`;

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
      <Controls>
        <NavBtn disabled={idx <= 0} onClick={() => setIdx(i => i - 1)}>→</NavBtn>
        <Select value={idx} onChange={e => setIdx(Number(e.target.value))}>
          {sections.map((s, i) => (
            <option key={i} value={i}>{s.name}</option>
          ))}
        </Select>
        <NavBtn disabled={idx >= sections.length - 1} onClick={() => setIdx(i => i + 1)}>←</NavBtn>
      </Controls>
      <SiddurSectionBody section={current} />
    </Wrap>
  );
}
