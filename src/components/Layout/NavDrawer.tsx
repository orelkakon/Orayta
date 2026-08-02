'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { navItems } from './navItems';
import { LineIcon } from '@/components/common/LineIcons';

/* Breakpoint must match the header's hamburger cutoff (1100px in AppLayout):
   below that the drawer is the only navigation, so a narrower media query
   here left tablets with a hamburger that opened nothing. */
const Backdrop = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 1100px) {
    display: block;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.45);
    -webkit-backdrop-filter: blur(3px);
    backdrop-filter: blur(3px);
    z-index: ${theme.z.drawer - 10};
    opacity: ${p => (p.$open ? 1 : 0)};
    visibility: ${p => (p.$open ? 'visible' : 'hidden')};
    transition: opacity ${theme.motion.base} ease, visibility ${theme.motion.base} ease;
  }
`;

const Drawer = styled.div<{ $open: boolean }>`
  display: none;
  @media (max-width: 1100px) {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; right: 0; bottom: 0;
    width: 240px;
    background: ${theme.colors.primary};
    z-index: ${theme.z.drawer};
    transform: translateX(${p => (p.$open ? '0' : '100%')});
    transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1);
    /* Crisp seam on the leading edge + one wide soft shadow. A mid-size
       offset shadow rendered as a detached band next to the panel. */
    border-left: 1px solid rgba(255, 255, 255, 0.14);
    box-shadow: ${p => (p.$open ? '-40px 0 80px rgba(0, 0, 0, 0.45)' : 'none')};
    padding: ${theme.spacing.md};
    padding-bottom: calc(${theme.spacing.md} + env(safe-area-inset-bottom));
    gap: 2px;
    overflow-y: auto;
    overscroll-behavior: contain;
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
  color: ${theme.colors.onPrimary};
`;

const CloseBtn = styled.button`
  position: relative;
  width: 44px; height: 44px;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.onPrimary}; opacity: 0.8; font-size: 1rem;
  border-radius: ${theme.radii.sm};
  transition: opacity 0.15s, background 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

const DrawerLink = styled(Link)<{ $active?: boolean }>`
  padding: 10px ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 500;
  color: ${theme.colors.onPrimary};
  display: flex; align-items: center; gap: 8px;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};
  transition: background ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { background: rgba(255,255,255,0.15); }
  &:active { transform: scale(0.97); background: rgba(255,255,255,0.2); }
`;

const DrawerLogout = styled.button`
  margin-top: auto;
  padding: 10px ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  font-size: 0.95rem;
  font-weight: 500;
  color: ${theme.colors.onPrimary};
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
  isAdmin: boolean;
}

const HOME_LINK = { href: '/', label: HE.NAV_HOME, icon: 'home' };

export default function NavDrawer({ open, onClose, pathname, onLogout, isAdmin }: Props) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const links = [HOME_LINK, ...navItems];

  const isActive = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname.startsWith(href);

  // Close on Escape and move focus into the drawer when it opens, restoring it
  // to whatever opened it (the hamburger) on close.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    drawerRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      // Trap Tab inside the drawer while it is open.
      const focusables = drawerRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusables || focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, onClose]);

  return (
    <>
      <Backdrop $open={open} onClick={onClose} />
      {/* Off-screen when closed, so it must also leave the tab order and the
          accessibility tree — a translate alone leaves it reachable. */}
      <Drawer
        id="nav-drawer"
        ref={drawerRef}
        $open={open}
        role="dialog"
        aria-modal="true"
        aria-label={HE.NAV_MENU}
        aria-hidden={!open}
        tabIndex={-1}
      >
        <DrawerHeader>
          <DrawerTitle>{HE.APP_NAME}</DrawerTitle>
          <CloseBtn onClick={onClose} aria-label={HE.ARIA_MENU_CLOSE}>✕</CloseBtn>
        </DrawerHeader>
        {links.map(l => (
          <DrawerLink
            key={l.href}
            href={l.href}
            $active={isActive(l.href)}
            aria-current={isActive(l.href) ? 'page' : undefined}
            tabIndex={open ? undefined : -1}
            onClick={onClose}
          >
            <LineIcon name={l.icon} size={17} /> {l.label}
          </DrawerLink>
        ))}
        {isAdmin && (
          <DrawerLink
            href="/admin"
            $active={isActive('/admin')}
            aria-current={isActive('/admin') ? 'page' : undefined}
            tabIndex={open ? undefined : -1}
            onClick={onClose}
          >
            <LineIcon name="chart" size={17} /> {HE.NAV_ADMIN_STATS}
          </DrawerLink>
        )}
        <Divider />
        {isAdmin
          ? <DrawerLogout onClick={onLogout} tabIndex={open ? undefined : -1}>{HE.NAV_LOGOUT} →</DrawerLogout>
          : (
            <DrawerLink
              href="/login"
              $active={isActive('/login')}
              aria-current={isActive('/login') ? 'page' : undefined}
              tabIndex={open ? undefined : -1}
              onClick={onClose}
            >
              <LineIcon name="key" size={17} /> {HE.NAV_ADMIN_LOGIN}
            </DrawerLink>
          )
        }
      </Drawer>
    </>
  );
}
