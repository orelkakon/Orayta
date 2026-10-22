'use client';

import { useContext } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HeaderSlotContext } from '@/components/Layout/HeaderSlot';

/* The tab row is portalled into the header's slot (see HeaderSlot), so the
   header and the tabs stick as one element. Until the slot exists (server
   render, before hydration) it renders inline, pulled up under the header
   with the same spacing, so nothing shifts when it moves. */
const Wrapper = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.xl};
  @media (max-width: 600px) { gap: ${theme.spacing.md}; }
`;

const SubNav = styled.div<{ $inline: boolean }>`
  display: flex; align-items: center; gap: ${theme.spacing.xs};
  border-bottom: 2px solid ${theme.colors.borderLight};
  background: ${theme.colors.background};
  ${({ $inline }) => $inline && `
    position: sticky; top: var(--header-h, 60px); z-index: 51;
    margin-top: -${theme.spacing.xl};
    @media (max-width: 600px) { margin-top: -${theme.spacing.md}; }
  `}
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
  const slot = useContext(HeaderSlotContext);
  return (
    <Wrapper>
      {slot ? createPortal(<SubNav $inline={false}>{tabs}</SubNav>, slot) : <SubNav $inline>{tabs}</SubNav>}
      {children}
    </Wrapper>
  );
}
