'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';

/** Desktop dropdown: a pill trigger in the app bar + an origin-aware popover. */
const Wrap = styled.div`position: relative;`;

const Trigger = styled.button<{ $active: boolean; $open: boolean }>`
  display: inline-flex; align-items: center; gap: 4px; height: 40px; padding: 0 12px 0 14px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: ${p => (p.$active ? 700 : 500)};
  color: ${p => (p.$active || p.$open ? theme.colors.onChrome : `color-mix(in srgb, ${theme.colors.onChrome} 78%, transparent)`)};
  background: ${p => (p.$active || p.$open ? `color-mix(in srgb, ${theme.colors.onChrome} 12%, transparent)` : 'transparent')};
  transition: background-color 0.15s ease, color 0.15s ease;
  &:hover { color: ${theme.colors.onChrome}; background: color-mix(in srgb, ${theme.colors.onChrome} 9%, transparent); }
  svg { transition: transform 0.2s ${theme.motion.outStrong}; transform: rotate(${p => (p.$open ? 180 : 0)}deg); }
`;

const Pop = styled.div<{ $open: boolean; $columns: number; $align: 'start' | 'end' }>`
  position: absolute; top: calc(100% + 10px); z-index: ${theme.z.popover};
  ${p => (p.$align === 'end' ? css`left: 0; transform-origin: top left;` : css`right: 0; transform-origin: top right;`)}
  display: grid; grid-template-columns: repeat(${p => p.$columns}, minmax(200px, 1fr)); gap: 2px;
  padding: 8px; border-radius: 18px;
  background: ${theme.colors.elevated};
  border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.lg};
  opacity: ${p => (p.$open ? 1 : 0)};
  visibility: ${p => (p.$open ? 'visible' : 'hidden')};
  transform: ${p => (p.$open ? 'none' : 'translateY(-4px) scale(0.97)')};
  transition: opacity 0.16s ease, transform 0.18s ${theme.motion.outStrong}, visibility 0.18s;
`;

const itemStyles = css<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 10px; min-height: 44px; padding: 6px 10px;
  border-radius: 12px; text-align: start; width: 100%;
  font-size: ${theme.fontSizes.sm}; font-weight: ${p => (p.$active ? 700 : 500)};
  color: ${theme.colors.text};
  background: ${p => (p.$active ? theme.colors.goldSoft : 'transparent')};
  transition: background-color 0.12s ease;
  &:hover { background: ${theme.colors.surfaceAlt}; }
  & > span {
    width: 32px; height: 32px; border-radius: 10px; flex-shrink: 0;
    display: inline-flex; align-items: center; justify-content: center;
    color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt};
  }
`;

export const MenuLink = styled(Link)<{ $active: boolean }>`${itemStyles}`;
export const MenuButton = styled.button<{ $active?: boolean }>`${itemStyles}`;

interface Props {
  id: string;
  label: string;
  open: boolean;
  active: boolean;
  onToggle: (id: string) => void;
  columns?: number;
  align?: 'start' | 'end';
  children: ReactNode;
}

export default function NavMenu({ id, label, open, active, onToggle, columns = 1, align = 'start', children }: Props) {
  const popId = `nav-menu-${id}`;
  return (
    <Wrap>
      <Trigger
        type="button"
        $active={active}
        $open={open}
        aria-expanded={open}
        aria-controls={popId}
        onClick={() => onToggle(id)}
      >
        {label}
        <LineIcon name="chevronDown" size={15} strokeWidth={2} />
      </Trigger>
      {/* visibility:hidden (after the exit transition) also takes the closed
          menu out of the tab order and the accessibility tree. */}
      <Pop id={popId} $open={open} $columns={columns} $align={align}>
        {children}
      </Pop>
    </Wrap>
  );
}
