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
  display: flex; align-items: center; gap: 2px;
  margin: 8px 0; padding: 3px;
  border-radius: ${theme.radii.pill};
  background: color-mix(in srgb, ${theme.colors.text} 6%, ${theme.colors.background});
  overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  ${({ $inline }) => $inline && `
    position: sticky; top: var(--header-h, 60px); z-index: 51;
    margin-top: -${theme.spacing.xl};
    @media (max-width: 600px) { margin-top: -${theme.spacing.md}; }
  `}
`;

export const TabBtn = styled.button<{ $active: boolean }>`
  flex: 1 0 auto; min-height: 38px; padding: 0 ${theme.spacing.md};
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: ${({ $active }) => ($active ? 700 : 500)}; white-space: nowrap;
  color: ${({ $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  background: ${({ $active }) => ($active ? theme.colors.surface : 'transparent')};
  box-shadow: ${({ $active }) => ($active ? theme.shadows.sm : 'none')};
  transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
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
