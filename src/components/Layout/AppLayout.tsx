'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import { useDarkMode } from '@/components/common/ThemeContext';
import { clearStats } from '@/lib/statsStorage';

const Wrapper = styled.div`min-height: 100vh; display: flex; flex-direction: column;`;

const Header = styled.header`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: 100;
  min-width: 0;
  overflow: hidden;

  @media (max-width: 480px) {
    padding: 6px ${theme.spacing.sm};
  }
`;

const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  flex-shrink: 0;
`;

const LogoArea = styled(Link)`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;

  @media (max-width: 520px) { display: none; }
`;

const AppName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.2rem;
  font-weight: 700;
`;

const Bsd = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.6rem;
  opacity: 0.7;
  letter-spacing: 0.05em;
  text-align: left;
`;

const ThemeBtn = styled.button`
  width: 1.75rem;
  height: 1.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: ${theme.radii.sm};
  font-size: 0.9rem;
  color: white;
  opacity: 0.75;
  transition: opacity 0.15s;
  line-height: 1;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 2px;
  min-width: 0;
  flex-shrink: 1;
  overflow-x: auto;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: 5px 7px;
  border-radius: ${theme.radii.sm};
  font-size: 0.82rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
  transition: background 0.15s;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};
  &:hover { background: rgba(255,255,255,0.15); }

  @media (max-width: 600px) {
    font-size: 0.74rem;
    padding: 4px 5px;
  }
  @media (max-width: 400px) {
    font-size: 0.68rem;
    padding: 3px 4px;
  }
`;

const LogoutButton = styled.button`
  padding: 5px 7px;
  border-radius: ${theme.radii.sm};
  font-size: 0.82rem;
  font-weight: 500;
  color: white;
  opacity: 0.7;
  white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.15s;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }

  @media (max-width: 600px) {
    font-size: 0.74rem;
    padding: 4px 5px;
  }
  @media (max-width: 400px) {
    font-size: 0.68rem;
    padding: 3px 4px;
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: ${theme.spacing.xl};

  @media (max-width: 600px) { padding: ${theme.spacing.md}; }
`;

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isDark, toggle } = useDarkMode();

  const handleLogout = async () => {
    clearStats();
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  };

  return (
    <Wrapper>
      <Header>
        <LogoGroup>
          <LogoArea href="/study">
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
          <NavLink href="/study"  $active={pathname === '/study' || pathname === '/add'}>{HE.NAV_TALMUD}</NavLink>
          <NavLink href="/rabbis" $active={pathname === '/rabbis'}>{HE.NAV_RABBIS}</NavLink>
          <NavLink href="/books" $active={pathname === '/books'}>{HE.NAV_BOOKS}</NavLink>
          <NavLink href="/gematria" $active={pathname === '/gematria'}>{HE.NAV_GEMATRIA}</NavLink>
          <NavLink href="/quiz"   $active={pathname === '/quiz'}>{HE.NAV_LEARN}</NavLink>
          <NavLink href="/today"  $active={pathname === '/today'}>{HE.NAV_TODAY}</NavLink>
          <NavLink href="/about"  $active={pathname === '/about'}>{HE.NAV_ABOUT}</NavLink>
          <LogoutButton onClick={handleLogout}>{HE.NAV_LOGOUT}</LogoutButton>
        </Nav>
      </Header>
      <Main>{children}</Main>
    </Wrapper>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppLayoutInner>{children}</AppLayoutInner>;
}
