'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { isWideRoute } from '@/lib/routes';
import { useRole } from '@/components/common/RoleContext';
import { usePublishHeight } from '@/components/common/usePublishHeight';
import AddToHomeScreen from '@/components/common/AddToHomeScreen';
import VisitTracker from '@/components/common/VisitTracker';
import { HeaderSlotContext, TopBar, SlotRow } from './HeaderSlot';
import AppHeader from './AppHeader';
import BottomTabBar from './BottomTabBar';
import MoreSheet from './MoreSheet';
import DedicationsTicker from './DedicationsTicker';
import SiteFooter from './SiteFooter';

const TICKER_KEY = 'orayta_dedications_strip';

const Wrapper = styled.div`
  min-height: 100vh; min-height: 100dvh;
  display: flex; flex-direction: column;
`;

/* Each page fades up softly when it mounts; the shell around it stays put,
   so navigation reads as a native push rather than a page reload. */
const pageEnter = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
`;

const Main = styled.main<{ $wide: boolean }>`
  flex: 1; width: 100%;
  max-width: ${p => (p.$wide ? theme.layout.wide : theme.layout.content)};
  margin: 0 auto;
  padding-top: ${theme.spacing.xl};
  padding-bottom: ${theme.spacing.xl};
  padding-left: max(${theme.layout.gutter}, ${theme.safe.left});
  padding-right: max(${theme.layout.gutter}, ${theme.safe.right});
  ${theme.media.sm} { padding-top: ${theme.spacing.md}; padding-bottom: ${theme.spacing.lg}; }
  &:focus { outline: none; }
`;

const Page = styled.div`
  animation: ${pageEnter} 0.28s ${theme.motion.outStrong};
`;

const SkipLink = styled.a.attrs({ className: 'skip-link' })``;

export default function ShellChrome({ pathname, children }: { pathname: string; children: React.ReactNode }) {
  // Sticky sub-bars sit exactly under the header (+ a page's tab row, see
  // HeaderSlot), whose height varies (safe area, font scale, tabs) — so its
  // real height is published as --header-h.
  const headerRef = useRef<HTMLDivElement>(null);
  const [slot, setSlot] = useState<HTMLDivElement | null>(null);
  usePublishHeight(headerRef, '--header-h');
  const isAdmin = useRole() === 'admin';
  const [moreOpen, setMoreOpen] = useState(false);
  const [tickerOn, setTickerOn] = useState(true);

  useEffect(() => {
    try { setTickerOn(localStorage.getItem(TICKER_KEY) !== 'off'); } catch {}
  }, []);

  useEffect(() => { setMoreOpen(false); }, [pathname]);

  const changeTicker = useCallback((on: boolean) => {
    try { localStorage.setItem(TICKER_KEY, on ? 'on' : 'off'); } catch {}
    setTickerOn(on);
  }, []);

  const logout = useCallback(async () => {
    // Quiz stats are the visitor's own study record, not admin session data —
    // logging out of the admin role must not destroy them.
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  }, []);

  const closeMore = useCallback(() => setMoreOpen(false), []);

  return (
    <HeaderSlotContext.Provider value={slot}>
      <Wrapper>
        <SkipLink href="#main">{HE.ARIA_SKIP_TO_CONTENT}</SkipLink>
        <TopBar ref={headerRef}>
          <AppHeader pathname={pathname} isAdmin={isAdmin} onLogout={logout} />
          <SlotRow><div ref={setSlot} /></SlotRow>
        </TopBar>

        {pathname === '/' && tickerOn && <DedicationsTicker />}

        <Main id="main" tabIndex={-1} $wide={isWideRoute(pathname)}>
          <Page key={pathname}>{children}</Page>
        </Main>
        <SiteFooter />

        <BottomTabBar pathname={pathname} onMore={() => setMoreOpen(true)} moreOpen={moreOpen} />
        <MoreSheet
          open={moreOpen}
          onClose={closeMore}
          pathname={pathname}
          isAdmin={isAdmin}
          onLogout={logout}
          tickerOn={tickerOn}
          onTickerChange={changeTicker}
        />
        <AddToHomeScreen />
        <VisitTracker />
      </Wrapper>
    </HeaderSlotContext.Provider>
  );
}
