'use client';

import { createContext } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

/* A page's tab row (StickyTabs) is portalled into this slot under the header
   bar, so header + tabs are ONE sticky element. Two stacked sticky elements
   drift apart while scrolling in the iOS home-screen app, which made the tab
   row look like it grows and shrinks. Null until the slot has mounted. */
export const HeaderSlotContext = createContext<HTMLElement | null>(null);

export const TopBar = styled.div`
  position: sticky;
  top: 0;
  z-index: ${theme.z.header};
  box-shadow: ${theme.shadows.sm};
`;

export const SlotRow = styled.div`
  background: ${theme.colors.background};
  & > div {
    max-width: ${theme.layout.content}; margin: 0 auto;
    padding-left: max(${theme.layout.gutter}, ${theme.safe.left});
    padding-right: max(${theme.layout.gutter}, ${theme.safe.right});
  }
  & > div:empty { display: none; }
`;
