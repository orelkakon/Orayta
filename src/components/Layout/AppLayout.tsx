'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import { LineIcon } from '@/components/common/LineIcons';
import { useDarkMode } from '@/components/common/ThemeContext';
import { useRole } from '@/components/common/RoleContext';
import NavDrawer from './NavDrawer';
import BottomTabBar from './BottomTabBar';
import { navItems } from './navItems';
import DedicationsTicker from './DedicationsTicker';
import AddToHomeScreen from '@/components/common/AddToHomeScreen';
import VisitTracker from '@/components/common/VisitTracker';

const TICKER_KEY = 'orayta_dedications_strip';

const Wrapper = styled.div`min-height: 100vh; display: flex; flex-direction: column;`;

const Header = styled.header`
  background: ${theme.colors.primary};
  color: ${theme.colors.onPrimary};
  padding: 0 ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.md};
  border-bottom: 2px solid ${theme.colors.secondary}55;
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 60px;
  @media (max-width: 480px) { padding: 0 ${theme.spacing.sm}; min-height: 52px; }
`;

const LogoGroup = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-shrink: 0;
`;

const LogoArea = styled(Link)`
  display: flex; align-items: center; gap: 8px;
`;

const LogoText = styled.div`
  display: flex; flex-direction: column; line-height: 1.15;
  @media (max-width: 520px) { display: none; }
`;

const AppName = styled.span`
  font-family: ${theme.fonts.body}; font-size: 1.25rem; font-weight: 700;
  letter-spacing: -0.01em;
`;

const Tagline = styled.span`
  font-size: 0.6rem; opacity: 0.55; letter-spacing: 0.06em;
`;

const ThemeBtn = styled.button`
  position: relative;
  width: 1.75rem; height: 1.75rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border-radius: ${theme.radii.sm};
  font-size: 0.95rem; color: ${theme.colors.onPrimary}; opacity: 0.7;
  transition: opacity ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
  &:active { transform: scale(0.9); }
  /* Keep the glyph small but give it a 44px touch target (WCAG 2.5.5). */
  &::before { content: ''; position: absolute; inset: -8px; }
`;

/* Desktop nav. Collapses to the drawer at 1100px: the full item set needs
   ~1240px, so below that it used to overflow into a scroll strip with a
   hidden scrollbar — items were silently unreachable. */
const Nav = styled.nav`
  display: flex; align-items: center; gap: 1px;
  flex: 1; justify-content: flex-end;
  overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  @media (max-width: 1100px) { display: none; }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  display: flex; align-items: center; gap: 4px;
  padding: 0 8px; height: 60px;
  font-size: 0.8rem; font-weight: 500; white-space: nowrap; flex-shrink: 0;
  border-bottom: 3px solid ${({ $active }) => ($active ? theme.colors.secondary : 'transparent')};
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.12)' : 'transparent')};
  transition: background 0.15s, border-color 0.15s;
  &:hover { background: rgba(255,255,255,0.12); }
  @media (max-width: 480px) { height: 52px; }
`;

const LogoutButton = styled.button`
  display: flex; align-items: center; gap: 4px;
  padding: 0 8px; height: 60px;
  font-size: 0.8rem; font-weight: 500; color: ${theme.colors.onPrimary}; opacity: 0.65;
  white-space: nowrap; flex-shrink: 0; border-bottom: 3px solid transparent;
  transition: all 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.12); }
  @media (max-width: 480px) { height: 52px; }
`;

const HamBtn = styled.button`
  display: none;
  color: ${theme.colors.onPrimary}; font-size: 1.35rem;
  width: 44px; height: 44px; flex-shrink: 0;
  align-items: center; justify-content: center;
  border-radius: ${theme.radii.sm};
  transition: background ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { background: rgba(255,255,255,0.15); }
  &:active { transform: scale(0.9); }
  @media (max-width: 1100px) { display: flex; }
`;

/* Content slides up softly on every route change (AppLayout re-mounts per
   page). The header renders identically each time, so only the page body
   reads as animating — a native-style push without a router library. */
const pageEnter = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
`;

const Main = styled.main`
  flex: 1; max-width: 1000px; width: 100%;
  margin: 0 auto; padding: ${theme.spacing.xl};
  animation: ${pageEnter} 0.3s ${theme.motion.out};
  @media (max-width: 600px) { padding: ${theme.spacing.md}; }
  @media (max-width: 768px) {
    /* Clear the fixed bottom tab bar. */
    padding-bottom: calc(76px + env(safe-area-inset-bottom) + ${theme.spacing.lg});
  }
`;

const SkipLink = styled.a.attrs({ className: 'skip-link' })``;


function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const { isDark, toggle } = useDarkMode();
  const role = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const [tickerOn, setTickerOn] = useState(true);

  useEffect(() => {
    try { setTickerOn(localStorage.getItem(TICKER_KEY) !== 'off'); } catch {}
  }, []);

  const toggleTicker = () => {
    setTickerOn(prev => {
      try { localStorage.setItem(TICKER_KEY, prev ? 'off' : 'on'); } catch {}
      return !prev;
    });
  };

  const handleLogout = async () => {
    // Quiz stats are the visitor's own per-device study record, not admin
    // session data — logging out of the admin role must not destroy them.
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  const isHome = pathname === '/';

  return (
    <Wrapper>
      <SkipLink href="#main">{HE.ARIA_SKIP_TO_CONTENT}</SkipLink>
      <Header>
        <LogoGroup>
          <LogoArea href="/">
            <OraytaLogo size={34} />
            <LogoText>
              <AppName>{HE.APP_NAME}</AppName>
              <Tagline>{HE.HEADER_TAGLINE}</Tagline>
            </LogoText>
          </LogoArea>
          <ThemeBtn
            onClick={toggle}
            aria-label={isDark ? HE.ARIA_THEME_TO_LIGHT : HE.ARIA_THEME_TO_DARK}
            aria-pressed={isDark}
            title={isDark ? HE.THEME_LIGHT : HE.THEME_DARK}
          >
            {isDark ? '☀' : '☾'}
          </ThemeBtn>
          {isHome && (
            <ThemeBtn
              onClick={toggleTicker}
              aria-label={tickerOn ? HE.ARIA_TICKER_HIDE : HE.ARIA_TICKER_SHOW}
              aria-pressed={tickerOn}
              title={tickerOn ? HE.DEDICATIONS_STRIP_HIDE : HE.DEDICATIONS_STRIP_SHOW}
              style={{ opacity: tickerOn ? undefined : 0.35 }}
            >
              🕯
            </ThemeBtn>
          )}
        </LogoGroup>

        <Nav>
          {navItems.map(item => {
            const active = item.match ? item.match(pathname) : isActive(item.href);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                $active={active}
                aria-current={active ? 'page' : undefined}
              >
                <LineIcon name={item.icon} size={15} /> {item.label}
              </NavLink>
            );
          })}
          {role === 'admin' && (
            <NavLink
              href="/admin"
              $active={isActive('/admin')}
              aria-current={isActive('/admin') ? 'page' : undefined}
            >
              <LineIcon name="chart" size={15} /> {HE.NAV_ADMIN_STATS}
            </NavLink>
          )}
          {role === 'admin'
            ? <LogoutButton onClick={handleLogout}><LineIcon name="logout" size={15} /> {HE.NAV_LOGOUT}</LogoutButton>
            : (
              <NavLink
                href="/login"
                $active={isActive('/login')}
                aria-current={isActive('/login') ? 'page' : undefined}
              >
                <LineIcon name="key" size={15} /> {HE.NAV_ADMIN_LOGIN}
              </NavLink>
            )
          }
        </Nav>

        <HamBtn
          onClick={() => setMenuOpen(o => !o)}
          aria-label={menuOpen ? HE.ARIA_MENU_CLOSE : HE.ARIA_MENU_OPEN}
          aria-expanded={menuOpen}
          aria-controls="nav-drawer"
        >
          {menuOpen ? '✕' : '☰'}
        </HamBtn>
      </Header>

      {isHome && tickerOn && <DedicationsTicker />}

      <NavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        onLogout={handleLogout}
        isAdmin={role === 'admin'}
      />

      <Main id="main" tabIndex={-1}>{children}</Main>
      <BottomTabBar
        pathname={pathname}
        onMore={() => setMenuOpen(true)}
        moreOpen={menuOpen}
      />
      <AddToHomeScreen />
      <VisitTracker />
    </Wrapper>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
