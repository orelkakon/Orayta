'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { StatusBadge } from './ConfidenceBadge';

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

/** Plain-language explanation of how every badge on the page is derived. */
export default function ReliabilityLegend() {
  return (
    <Details>
      <summary>{HE.MN_LEGEND_TITLE}</summary>
      <Badges>
        <StatusBadge status="verified" />
        <StatusBadge status="reported" />
        <StatusBadge status="unknown" />
      </Badges>
      <List>{HE.MN_LEGEND_ITEMS.map(item => <li key={item}>{item}</li>)}</List>
    </Details>
  );
}
