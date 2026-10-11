'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LevelPill } from './ReliabilityBadge';

const Details = styled.details`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  summary {
    cursor: pointer; font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.primary};
    min-height: 32px; display: flex; align-items: center;
  }
`;

const Badges = styled.div`display: flex; gap: 6px; flex-wrap: wrap; margin: ${theme.spacing.sm} 0;`;

const List = styled.ul`
  display: flex; flex-direction: column; gap: 6px; padding-inline-start: ${theme.spacing.md};
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;
`;

/** Plain-language explanation of how every reliability badge is derived. */
export default function ReliabilityLegend() {
  return (
    <Details>
      <summary>{HE.MN_LEGEND_TITLE}</summary>
      <Badges><LevelPill level="high" /><LevelPill level="medium" /><LevelPill level="low" /></Badges>
      <List>{HE.MN_LEGEND_ITEMS.map(item => <li key={item}>{item}</li>)}</List>
    </Details>
  );
}
