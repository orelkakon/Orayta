'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import { useDarkMode } from '@/components/common/ThemeContext';
import { clearStats } from '@/lib/statsStorage';
import NavDrawer from './NavDrawer';

const Wrapper = styled.div`min-height: 100vh; display: flex; flex-direction: column;`;

const Header = styled.header`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: 100;
  min-height: 56px;
  @media (max-width: 480px) { padding: 8px ${theme.spacing.sm}; min-height: 50px; }
`;

const LogoGroup = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-shrink: 0;
`;

const LogoArea = styled(Link)`
  display: flex; align-items: center; gap: 6px;
`;

const LogoText = styled.div`
  display: flex; flex-direction: column; line-height: 1.1;
  @media (max-width: 520px) { display: none; }
`;

const AppName = styled.span`
  font-family: ${theme.fonts.body}; font-size: 1.2rem; font-weight: 700;
`;

const Bsd = styled.span`
  font-family: ${theme.fonts.body}; font-size: 0.6rem; opacity: 0.7;
  letter-spacing: 0.05em; text-align: left;
`;

const ThemeBtn = styled.button`
  width: 1.75rem; height: 1.75rem;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; border-radius: ${theme.radii.sm};
  font-size: 0.9rem; color: white; opacity: 0.75;
  transition: opacity 0.15s; line-height: 1;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

/* Desktop nav — hidden on mobile */
const Nav = styled.nav`
  display: flex; align-items: center; gap: 2px;
  min-width: 0; flex-shrink: 1;
  overflow-x: auto; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
  @media (max-width: 768px) { display: none; }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 5px 7px; border-radius: ${theme.radii.sm};
  font-size: 0.82rem; font-weight: 500; white-space: nowrap; flex-shrink: 0;
  transition: background 0.15s;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};
  &:hover { background: rgba(255,255,255,0.15); }
`;

const LogoutButton = styled.button`
  padding: 5px 7px; border-radius: ${theme.radii.sm};
  font-size: 0.82rem; font-weight: 500; color: white; opacity: 0.7;
  white-space: nowrap; flex-shrink: 0; transition: all 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

/* Hamburger — only on mobile */
const HamBtn = styled.button`
  display: none;
  color: white; font-size: 1.35rem;
  width: 36px; height: 36px;
  align-items: center; justify-content: center;
  border-radius: ${theme.radii.sm}; flex-shrink: 0;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.15); }
  @media (max-width: 768px) { display: flex; }
`;

const Main = styled.main`
  flex: 1; max-width: 1000px; width: 100%;
  margin: 0 auto; padding: ${theme.spacing.xl};
  @media (max-width: 600px) { padding: ${theme.spacing.md}; }
`;

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname   = usePathname();
  const { isDark, toggle } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    clearStats();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <Wrapper>
      <Header>
        <LogoGroup>
          <LogoArea href="/">
            <OraytaLogo size={36} />
            <LogoText>
              <AppName>{HE.APP_NAME}</AppName>
              <Bsd>בס״ד</Bsd>
            </LogoText>
          </LogoArea>
          <ThemeBtn onClick={toggle} title={isDark ? HE.THEME_LIGHT : HE.THEME_DARK}>
            {isDark ? '☀' : '☾'}
          </ThemeBtn>
        </LogoGroup>

        <Nav>
          <NavLink href="/rabbis"    $active={isActive('/rabbis')}>👥 {HE.NAV_RABBIS}</NavLink>
          <NavLink href="/books"     $active={isActive('/books')}>📖 {HE.NAV_BOOKS}</NavLink>
          <NavLink href="/study"     $active={isActive('/study') || pathname === '/add'}>📜 {HE.NAV_TALMUD}</NavLink>
          <NavLink href="/gematria"  $active={isActive('/gematria')}>🔢 {HE.NAV_GEMATRIA}</NavLink>
          <NavLink href="/chidushim" $active={isActive('/chidushim')}>💡 {HE.NAV_CHIDUSHIM}</NavLink>
          <NavLink href="/quiz"      $active={isActive('/quiz')}>🎯 {HE.NAV_LEARN}</NavLink>
          <NavLink href="/today"     $active={isActive('/today')}>🗓️ {HE.NAV_TODAY}</NavLink>
          <NavLink href="/contact"   $active={isActive('/contact')}>📞 {HE.NAV_CONTACT}</NavLink>
          <NavLink href="/about"     $active={isActive('/about')}>ℹ️ {HE.NAV_ABOUT}</NavLink>
          <LogoutButton onClick={handleLogout}>🚪 {HE.NAV_LOGOUT}</LogoutButton>
        </Nav>

        <HamBtn onClick={() => setMenuOpen(o => !o)} aria-label="תפריט">
          {menuOpen ? '✕' : '☰'}
        </HamBtn>
      </Header>

      <NavDrawer
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        pathname={pathname}
        onLogout={handleLogout}
      />

      <Main>{children}</Main>
    </Wrapper>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
