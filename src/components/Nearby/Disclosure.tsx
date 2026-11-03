'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';

/** Collapsible "more" block on result cards — native <details>, so it works without JS and with the keyboard. */
const Details = styled.details`
  border-top: 1px solid ${theme.colors.borderLight};
  margin-top: 2px;
  summary {
    list-style: none; cursor: pointer;
    display: flex; align-items: center; justify-content: space-between; gap: 8px;
    min-height: 44px; padding-top: 6px;
    font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.secondaryText};
    &::-webkit-details-marker { display: none; }
    svg { transition: transform 0.2s ${theme.motion.outStrong}; }
  }
  &[open] summary svg { transform: rotate(180deg); }
`;

const Body = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; padding-bottom: 4px;`;

export default function Disclosure({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Details>
      <summary>{label}<LineIcon name="chevronDown" size={18} strokeWidth={2} /></summary>
      <Body>{children}</Body>
    </Details>
  );
}
