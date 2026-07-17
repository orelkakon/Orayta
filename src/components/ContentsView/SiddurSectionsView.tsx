'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { SiddurSection } from '@/lib/prayers/types';
import StaticGroupsView from './StaticGroupsView';
import SefariaPrayerView from './SefariaPrayerView';
import MenorahPsalmView from './MenorahPsalmView';

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

const PartBlock = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const PartTitle = styled.h3`
  font-family: ${theme.fonts.body}; font-size: 1.1rem; font-weight: 700;
  color: ${theme.colors.primary};
  padding-bottom: 4px; border-bottom: 2px solid ${theme.colors.border};
`;

interface Props { sections: SiddurSection[]; }

export default function SiddurSectionsView({ sections }: Props) {
  const [idx, setIdx] = useState(0);
  const current = sections[idx];

  return (
    <Wrap>
      <Controls>
        <NavBtn disabled={idx <= 0} onClick={() => setIdx(i => i - 1)}>→</NavBtn>
        <Select value={idx} onChange={e => setIdx(Number(e.target.value))}>
          {sections.map((s, i) => (
            <option key={i} value={i}>{s.name}</option>
          ))}
        </Select>
        <NavBtn disabled={idx >= sections.length - 1} onClick={() => setIdx(i => i + 1)}>←</NavBtn>
      </Controls>
      {current.isMenorah
        ? <MenorahPsalmView />
        : current.parts
          ? current.parts.map(p => (
              <PartBlock key={p.subtitle}>
                <PartTitle>{p.subtitle}</PartTitle>
                <SefariaPrayerView sefariaRef={p.sefariaRef} />
              </PartBlock>
            ))
          : current.sefariaRef
            ? <SefariaPrayerView sefariaRef={current.sefariaRef} jump={current.jump} />
            : <StaticGroupsView groups={current.groups ?? []} />
      }
    </Wrap>
  );
}
