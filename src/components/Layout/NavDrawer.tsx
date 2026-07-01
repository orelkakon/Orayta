'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const Backdrop = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${p => (p.$open ? 'block' : 'none')};
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    z-index: 150;
  }
`;

const Drawer = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 220px;
    background: ${theme.colors.primary};
    z-index: 160;
    transform: translateX(${p => (p.$open ? '0' : '100%')});
    transition: transform 0.25s ease;
    padding: ${theme.spacing.md};
    gap: 2px;
    overflow-y: auto;
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0 ${theme.spacing.md};
  border-bottom: 1px solid rgba(255,255,255,0.15);
  margin-bottom: ${theme.spacing.sm};
`;

const DrawerTitle = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.1rem;
  font-weight: 700;
  color: white;
`;

const CloseBtn = styled.button`
  width: 28px; height: 28px;
  display: flex; align-items: center; justify-content: center;
  color: white; opacity: 0.8; font-size: 1rem;
  border-radius: ${theme.radii.sm};
  transition: opacity 0.15s, background 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
  display: block;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.15); }
`;

const DrawerLogout = styled.button`
  margin-top: auto;
  padding: 10px ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 500;
  color: white;
  opacity: 0.75;
  text-align: right;
  transition: all 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

const Divider = styled.div`
  height: 1px;
  background: rgba(255,255,255,0.1);
  margin: ${theme.spacing.xs} 0;
`;

interface Props {
  open: boolean;
  onClose: () => void;
  pathname: string;
  onLogout: () => void;
}

export default function NavDrawer({ open, onClose, pathname, onLogout }: Props) {
  const links = [
    { href: '/',           label: HE.HOME_SECTIONS.find(s => s.href === '/')?.label ?? 'בית',   icon: '🏠' },
    { href: '/rabbis',     label: HE.NAV_RABBIS_AND_BOOKS, icon: '👥' },
    { href: '/sikumim',    label: HE.NAV_SIKUMIM,          icon: '📝' },
    { href: '/study',      label: HE.NAV_TALMUD,           icon: '📜' },
    { href: '/gematria',   label: HE.NAV_GEMATRIA,         icon: '🔢' },
    { href: '/content',    label: HE.NAV_CONTENTS,         icon: '📚' },
    { href: '/chidushim',  label: HE.NAV_CHIDUSHIM,        icon: '💡' },
    { href: '/quiz',       label: HE.NAV_LEARN,            icon: '🎯' },
    { href: '/today',      label: HE.NAV_TODAY,            icon: '📅' },
    { href: '/contact',    label: HE.NAV_CONTACT,          icon: '📞' },
    { href: '/about',      label: HE.NAV_ABOUT,            icon: 'ℹ️' },
  ];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);

  return (
    <>
      <Backdrop $open={open} onClick={onClose} />
      <Drawer $open={open}>
        <DrawerHeader>
          <DrawerTitle>{HE.APP_NAME}</DrawerTitle>
          <CloseBtn onClick={onClose} aria-label="סגור תפריט">✕</CloseBtn>
        </DrawerHeader>
        {links.map(l => (
          <DrawerLink key={l.href} href={l.href} $active={isActive(l.href)} onClick={onClose}>
            {l.icon} {l.label}
          </DrawerLink>
        ))}
        <Divider />
        <DrawerLogout onClick={onLogout}>{HE.NAV_LOGOUT} →</DrawerLogout>
      </Drawer>
    </>
  );
}
