'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';
import { haptics } from '@/lib/haptics';
import { NavItem, isNavActive } from './navItems';

/** App-launcher style grid of destinations (the "עוד" sheet, home quick access). */
export const GroupTitle = styled.h3`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  color: ${theme.colors.textMuted};
  margin: ${theme.spacing.lg} 4px ${theme.spacing.sm};
`;

const Grid = styled.ul<{ $cols?: number }>`
  list-style: none;
  display: grid; grid-template-columns: repeat(${p => p.$cols ?? 3}, 1fr); gap: 6px;
  @media (min-width: 480px) { grid-template-columns: repeat(${p => p.$cols ?? 4}, 1fr); }
`;

const Tile = styled(Link)<{ $active: boolean }>`
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  padding: 12px 4px 10px; border-radius: 18px; min-height: 96px;
  text-align: center; color: ${theme.colors.text};
  background: ${p => (p.$active ? theme.colors.goldSoft : 'transparent')};
  transition: transform 0.16s ${theme.motion.outStrong}, background-color 0.15s ease;
  &:active { transform: scale(0.95); background: ${theme.colors.surfaceAlt}; }
  @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.colors.surfaceAlt}; } }
`;

const Disc = styled.span`
  width: 52px; height: 52px; border-radius: 16px;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.primary};
  background: linear-gradient(160deg, ${theme.colors.surface} 0%, ${theme.colors.goldSoft} 100%);
  border: 1px solid color-mix(in srgb, ${theme.colors.gold} 30%, transparent);
  box-shadow: ${theme.shadows.sm};
`;

const Label = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 600; line-height: 1.25;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

interface Props {
  items: NavItem[];
  pathname: string;
  onNavigate?: () => void;
  /** Fixed column count (default: 3, or 4 from 480px). */
  columns?: number;
}

export default function MoreGrid({ items, pathname, onNavigate, columns }: Props) {
  return (
    <Grid $cols={columns}>
      {items.map(item => {
        const active = isNavActive(item, pathname);
        return (
          <li key={item.href + item.label}>
            <Tile
              href={item.href}
              $active={active}
              aria-current={active ? 'page' : undefined}
              onClick={() => { haptics.tap(); onNavigate?.(); }}
            >
              <Disc aria-hidden="true"><LineIcon name={item.icon} size={24} strokeWidth={1.7} /></Disc>
              <Label>{item.label}</Label>
            </Tile>
          </li>
        );
      })}
    </Grid>
  );
}
