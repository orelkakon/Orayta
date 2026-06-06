'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';
import { useRole } from '@/components/common/RoleContext';
import { useDarkMode } from '@/components/common/ThemeContext';
import { clearStats } from '@/lib/statsStorage';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: ${theme.shadows.md};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: 600px) {
    padding: ${theme.spacing.sm} ${theme.spacing.md};
  }
`;

const LogoGroup = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.md};
`;

const LogoArea = styled(Link)`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
`;

const LogoText = styled.div`
  display: flex;
  flex-direction: column;
  line-height: 1.1;
`;

const AppName = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 1.45rem;
  font-weight: 700;
`;

const Bsd = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.65rem;
  opacity: 0.7;
  letter-spacing: 0.05em;
  text-align: left;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${theme.spacing.xs};
  align-items: center;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.15s;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    font-size: 0.78rem;
    padding: ${theme.spacing.xs} 6px;
  }
`;

const ThemeBtn = styled.button`
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  color: white;
  opacity: 0.75;
  transition: opacity 0.15s;
  line-height: 1;
  &:hover { opacity: 1; background: rgba(255,255,255,0.15); }
`;

const LogoutButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  opacity: 0.75;
  transition: all 0.15s;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    font-size: 0.78rem;
  }
`;

const Main = styled.main`
  flex: 1;
  max-width: 1000px;
  width: 100%;
  margin: 0 auto;
  padding: ${theme.spacing.xl};

  @media (max-width: 600px) {
    padding: ${theme.spacing.md};
  }
`;

function AppLayoutInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const role = useRole();
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
            <OraytaLogo size={52} />
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
          <NavLink href="/study" $active={pathname === '/study' || pathname === '/add'}>{HE.NAV_TALMUD}</NavLink>
          <NavLink href="/rabbis" $active={pathname === '/rabbis'}>{HE.NAV_RABBIS}</NavLink>
          <NavLink href="/quiz" $active={pathname === '/quiz'}>{HE.NAV_LEARN}</NavLink>
          <NavLink href="/about" $active={pathname === '/about'}>{HE.NAV_ABOUT}</NavLink>
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
