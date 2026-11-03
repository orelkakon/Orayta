'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { usePublishHeight } from '@/components/common/usePublishHeight';
import { haptics } from '@/lib/haptics';
import { PRIMARY_NAV, isNavActive } from './navItems';

/**
 * Native-style bottom tab bar on compact screens (phones and tablets, <1100px):
 * בית · רגע של תורה · תפילות · יומי · עוד. Its live height is published as
 * --tabbar-h (0 when hidden) so floating buttons and the footer clear it.
 */
const Bar = styled.nav<{ $hidden: boolean }>`
  display: none;
  ${theme.media.compact} {
    display: ${p => (p.$hidden ? 'none' : 'flex')};
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: ${theme.z.tabbar};
    padding: 0 max(4px, ${theme.safe.right}) ${theme.safe.bottom} max(4px, ${theme.safe.left});
    background: ${theme.colors.surface};
    background: color-mix(in srgb, ${theme.colors.surface} 84%, transparent);
    -webkit-backdrop-filter: blur(20px) saturate(1.6);
    backdrop-filter: blur(20px) saturate(1.6);
    border-top: 0.5px solid ${theme.colors.border};
  }
`;

const tabStyles = `
  flex: 1; min-width: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 3px; min-height: 58px; padding: 7px 2px 6px;
  -webkit-tap-highlight-color: transparent;
`;

const Tab = styled(Link)<{ $active: boolean }>`
  ${tabStyles}
  color: ${p => (p.$active ? theme.colors.primary : theme.colors.textMuted)};
`;

const TabBtn = styled.button<{ $active: boolean }>`
  ${tabStyles}
  color: ${p => (p.$active ? theme.colors.primary : theme.colors.textMuted)};
`;

const Icon = styled.span<{ $active: boolean }>`
  display: flex; align-items: center; justify-content: center;
  width: 52px; height: 30px; border-radius: 15px;
  background: ${p => (p.$active ? `color-mix(in srgb, ${theme.colors.primary} 13%, transparent)` : 'transparent')};
  transition: background-color 0.2s ease, transform 0.16s ${theme.motion.outStrong};
  ${Tab}:active &, ${TabBtn}:active & { transform: scale(0.9); }
`;

const Label = styled.span<{ $active: boolean }>`
  max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: ${theme.fontSizes.xxs}; line-height: 1.1; letter-spacing: 0.01em;
  font-weight: ${p => (p.$active ? 700 : 500)};
`;

/** True while the software keyboard is up — native apps hide the tab bar. */
function useKeyboardOpen(): boolean {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    const onResize = () => { if (vv) setOpen(window.innerHeight - vv.height > 140); };
    const isField = (t: EventTarget | null) =>
      t instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName);
    const onFocusIn = (e: FocusEvent) => { if (isField(e.target)) setOpen(true); };
    const onFocusOut = () => {
      setTimeout(onResize, 100);
      setTimeout(() => { if (!isField(document.activeElement)) setOpen(false); }, 120);
    };
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

interface Props { pathname: string; onMore: () => void; moreOpen: boolean }

export default function BottomTabBar({ pathname, onMore, moreOpen }: Props) {
  const keyboardOpen = useKeyboardOpen();
  const ref = useRef<HTMLElement>(null);
  usePublishHeight(ref, '--tabbar-h');

  // On a page reached from "עוד" (or while the sheet is open), "עוד" is the
  // highlighted tab, so the bar always shows where you are.
  const moreActive = moreOpen || !PRIMARY_NAV.some(t => isNavActive(t, pathname));

  return (
    <Bar ref={ref} aria-label={HE.NAV_MENU} $hidden={keyboardOpen}>
      {PRIMARY_NAV.map(tab => {
        const active = !moreOpen && isNavActive(tab, pathname);
        return (
          <Tab key={tab.href} href={tab.href} $active={active} aria-current={active ? 'page' : undefined} onClick={() => haptics.tap()}>
            <Icon $active={active}><LineIcon name={tab.icon} size={22} strokeWidth={active ? 2 : 1.6} /></Icon>
            <Label $active={active}>{tab.label}</Label>
          </Tab>
        );
      })}
      <TabBtn type="button" $active={moreActive} aria-expanded={moreOpen} aria-haspopup="dialog" onClick={() => { haptics.tap(); onMore(); }}>
        <Icon $active={moreActive}><LineIcon name="grid" size={21} strokeWidth={moreActive ? 2 : 1.6} /></Icon>
        <Label $active={moreActive}>{HE.TAB_MORE}</Label>
      </TabBtn>
    </Bar>
  );
}
