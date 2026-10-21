'use client';

import { useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { usePublishHeight } from './usePublishHeight';

/* The tab row sticks under the header; each tab's own sticky bar (title,
   search, filters) sticks under the tab row at --subbar-top. That offset must
   equal the bar's natural distance from the tab row — row height + the gap
   below it + the bar's negative margin-top — or the bar shifts while the page
   scrolls and looks like it grows and shrinks. The row's height isn't fixed
   (font scaling, wrapping), so it is measured into --subnav-h. The offset is
   never positive: a gap there would let the list show through once stuck. */
const Wrapper = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  --subbar-top: calc(var(--header-h, 60px) + var(--subnav-h, 41px) + ${theme.spacing.lg} - ${theme.spacing.xl});
  @media (max-width: 600px) {
    gap: ${theme.spacing.md};
    --subbar-top: calc(var(--header-h, 52px) + var(--subnav-h, 41px));
  }
`;

const SubNav = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  position: sticky;
  top: var(--header-h, 60px);
  z-index: 51;
  background: ${theme.colors.background};
  @media (max-width: 480px) { top: var(--header-h, 52px); }
`;

export const TabBtn = styled.button<{ $active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  font-size: 0.95rem; font-weight: 600;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  border-bottom: 2px solid ${({ $active }) => ($active ? theme.colors.primary : 'transparent')};
  margin-bottom: -2px;
  transition: color 0.15s, border-color 0.15s;
  border-radius: ${theme.radii.sm} ${theme.radii.sm} 0 0;
  &:hover { color: ${theme.colors.primary}; }
`;

interface Props { tabs: React.ReactNode; children: React.ReactNode; }

export default function StickyTabs({ tabs, children }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  usePublishHeight(navRef, '--subnav-h', wrapRef);

  return (
    <Wrapper ref={wrapRef}>
      <SubNav ref={navRef}>{tabs}</SubNav>
      {children}
    </Wrapper>
  );
}
