'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import type { SiddurSection } from '@/lib/prayers/types';
import StaticGroupsView from './StaticGroupsView';
import SefariaPrayerView from './SefariaPrayerView';
import MenorahPsalmView from './MenorahPsalmView';

const PartBlock = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const PartTitle = styled.h3`
  font-family: ${theme.fonts.body}; font-size: calc(1.05rem * var(--siddur-scale, 1.22)); font-weight: 700;
  color: ${theme.colors.primary};
  padding-bottom: 6px; border-bottom: 1px solid color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
`;

/** Renders one SiddurSection by its kind: menorah, multi-part, Sefaria or static. */
export default function SiddurSectionBody({ section }: { section: SiddurSection }) {
  if (section.isMenorah) return <MenorahPsalmView />;
  if (section.parts) {
    return (
      <>
        {section.parts.map(p => (
          <PartBlock key={p.subtitle}>
            <PartTitle>{p.subtitle}</PartTitle>
            <SefariaPrayerView sefariaRef={p.sefariaRef} />
          </PartBlock>
        ))}
      </>
    );
  }
  if (section.sefariaRef) return <SefariaPrayerView sefariaRef={section.sefariaRef} jump={section.jump} />;
  return <StaticGroupsView groups={section.groups ?? []} />;
}
