'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { haptics } from '@/lib/haptics';

/**
 * Native-style bottom tab bar — mobile only. The four daily destinations get
 * one-tap access; everything else lives behind "עוד" (opens the drawer).
 * The /feed route renders fullscreen without AppLayout, so the bar never
 * covers the immersive feed.
 */

const TABS = [
  { href: '/',      label: HE.NAV_HOME,  icon: 'home' },
  { href: '/feed',  label: HE.TAB_FEED,  icon: 'sparkle' },
  { href: '/quiz',  label: HE.TAB_QUIZ,  icon: 'target' },
  { href: '/today', label: HE.TAB_TODAY, icon: 'calendar' },
];

const Bar = styled.nav<{ $hidden: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${p => (p.$hidden ? 'none' : 'flex')};
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: ${theme.z.header};
    background: ${theme.colors.surface};
    background: color-mix(in srgb, ${theme.colors.surface} 86%, transparent);
    -webkit-backdrop-filter: blur(18px) saturate(1.5);
    backdrop-filter: blur(18px) saturate(1.5);
    border-top: 1px solid ${theme.colors.borderLight};
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.06);
    padding-bottom: env(safe-area-inset-bottom);
  }
`;

const TabItem = styled(Link)<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 0 9px;
  min-height: 64px;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  transition: color ${theme.motion.fast} ease;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.92); transition: transform 0.1s ease; }
`;

const TabButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  padding: 10px 0 9px;
  min-height: 64px;
  color: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.textMuted)};
  transition: color ${theme.motion.fast} ease;
  -webkit-tap-highlight-color: transparent;

  &:active { transform: scale(0.92); transition: transform 0.1s ease; }
`;

const IconWrap = styled.span<{ $active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px; height: 26px;
  border-radius: 13px;
  background: ${({ $active }) =>
    $active ? `color-mix(in srgb, ${theme.colors.primary} 14%, transparent)` : 'transparent'};
  transform: ${({ $active }) => ($active ? 'translateY(-1px)' : 'none')};
  transition: background ${theme.motion.base} ease, transform ${theme.motion.base} ${theme.motion.spring};
`;

const TabLabel = styled.span<{ $active: boolean }>`
  font-size: 0.65rem;
  font-weight: ${({ $active }) => ($active ? 700 : 500)};
  letter-spacing: 0.01em;
  line-height: 1;
`;

interface Props {
  pathname: string;
  onMore: () => void;
  moreOpen: boolean;
}

/**
 * True while the software keyboard is up. With the keyboard open, mobile
 * browsers pin fixed-bottom elements to the shrunken visual viewport — the
 * bar lands mid-page and floats around while scrolling. Native apps hide
 * their tab bar under the keyboard; so do we.
 */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const onResize = () => {
      if (vv) setOpen(window.innerHeight - vv.height > 140);
    };
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
    // Focus events as fallback for browsers without visualViewport.
    const onFocusIn = (e: FocusEvent) => { if (isField(e.target)) setOpen(true); };
    const onFocusOut = () => { setTimeout(onResize, 100); setTimeout(() => {
      if (!isField(document.activeElement)) setOpen(false);
    }, 120); };
    vv?.addEventListener('resize', onResize);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      vv?.removeEventListener('resize', onResize);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);
  return open;
}

export default function BottomTabBar({ pathname, onMore, moreOpen }: Props) {
  const keyboardOpen = useKeyboardOpen();
  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // While the drawer is open (or the user is on a page reached from it),
  // "עוד" is the highlighted tab so the bar always shows where you are.
  const anyTabActive = TABS.some(t => isActive(t.href));
  const moreActive = moreOpen || !anyTabActive;

  return (
    <Bar aria-label={HE.NAV_MENU} $hidden={keyboardOpen}>
      {TABS.map(tab => {
        const active = isActive(tab.href);
        return (
          <TabItem
            key={tab.href}
            href={tab.href}
            $active={active}
            aria-current={active ? 'page' : undefined}
            onClick={() => haptics.tap()}
          >
            <IconWrap $active={active}>
              <LineIcon name={tab.icon} size={21} strokeWidth={active ? 2 : 1.6} />
            </IconWrap>
            <TabLabel $active={active}>{tab.label}</TabLabel>
          </TabItem>
        );
      })}
      <TabButton
        type="button"
        $active={moreActive}
        aria-expanded={moreOpen}
        aria-controls="nav-drawer"
        onClick={() => { haptics.tap(); onMore(); }}
      >
        <IconWrap $active={moreActive}>
          <LineIcon name="dots" size={21} strokeWidth={moreActive ? 2 : 1.6} />
        </IconWrap>
        <TabLabel $active={moreActive}>{HE.TAB_MORE}</TabLabel>
      </TabButton>
    </Bar>
  );
}
