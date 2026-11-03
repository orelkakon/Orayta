'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { PRIMARY_NAV, NAV_GROUPS, NavItem, isNavActive } from './navItems';
import NavMenu, { MenuLink, MenuButton } from './NavMenu';

/**
 * Desktop (≥1100px) navigation: the four primary destinations as flat links,
 * then the grouped rest in dropdowns. Hidden on compact screens, where the
 * bottom tab bar + "עוד" sheet take over.
 */
const Nav = styled.nav`
  display: none;
  ${theme.up.wide} {
    display: flex; align-items: center; justify-content: center; gap: 2px;
  }
`;

const TopLink = styled(Link)<{ $active: boolean }>`
  position: relative;
  display: inline-flex; align-items: center; height: 40px; padding: 0 14px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: ${p => (p.$active ? 700 : 500)};
  color: ${p => (p.$active ? theme.colors.onChrome : `color-mix(in srgb, ${theme.colors.onChrome} 78%, transparent)`)};
  background: ${p => (p.$active ? `color-mix(in srgb, ${theme.colors.onChrome} 12%, transparent)` : 'transparent')};
  transition: background-color 0.15s ease, color 0.15s ease;
  &:hover { color: ${theme.colors.onChrome}; background: color-mix(in srgb, ${theme.colors.onChrome} 9%, transparent); }
`;

const MORE_ITEMS: NavItem[] = [
  ...NAV_GROUPS.find(g => g.id === 'prayer')!.items.filter(i => i.href !== '/content'),
  ...NAV_GROUPS.find(g => g.id === 'community')!.items,
];

interface Props { pathname: string; isAdmin: boolean; onLogout: () => void }

export default function DesktopNav({ pathname, isAdmin, onLogout }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => { setOpenId(null); }, [pathname]);

  useEffect(() => {
    if (!openId) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpenId(null); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [openId]);

  const toggle = (id: string) => setOpenId(cur => (cur === id ? null : id));
  const learn = NAV_GROUPS.find(g => g.id === 'learn')!;
  const nearby = NAV_GROUPS.find(g => g.id === 'nearby')!;
  const anyActive = (items: NavItem[]) => items.some(i => isNavActive(i, pathname));
  const links = (items: NavItem[]) => items.map(i => (
    <MenuLink key={i.href} href={i.href} $active={isNavActive(i, pathname)}>
      <span><LineIcon name={i.icon} size={18} /></span>{i.label}
    </MenuLink>
  ));

  return (
    <Nav ref={ref} aria-label={HE.HEADER_NAV_ARIA}>
      {PRIMARY_NAV.map(item => {
        const active = isNavActive(item, pathname);
        return (
          <TopLink key={item.href} href={item.href} $active={active} aria-current={active ? 'page' : undefined}>
            {item.label}
          </TopLink>
        );
      })}
      <NavMenu id="learn" label={learn.label} open={openId === 'learn'} active={anyActive(learn.items)} onToggle={toggle} columns={2}>
        {links(learn.items)}
      </NavMenu>
      <NavMenu id="nearby" label={nearby.label} open={openId === 'nearby'} active={anyActive(nearby.items)} onToggle={toggle}>
        {links(nearby.items)}
      </NavMenu>
      <NavMenu id="more" label={HE.NAV_GROUP_MORE} open={openId === 'more'} active={anyActive(MORE_ITEMS)} onToggle={toggle} align="end">
        {links(MORE_ITEMS)}
        {isAdmin && (
          <MenuLink href="/admin" $active={pathname.startsWith('/admin')}>
            <span><LineIcon name="chart" size={18} /></span>{HE.NAV_ADMIN_STATS}
          </MenuLink>
        )}
        {isAdmin
          ? <MenuButton type="button" onClick={onLogout}><span><LineIcon name="logout" size={18} /></span>{HE.NAV_LOGOUT}</MenuButton>
          : <MenuLink href="/login" $active={false}><span><LineIcon name="key" size={18} /></span>{HE.NAV_ADMIN_LOGIN}</MenuLink>}
      </NavMenu>
    </Nav>
  );
}
