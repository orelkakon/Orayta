'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  background: ${theme.colors.primary};
  color: white;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
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

const Logo = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: 0.02em;
`;

const Nav = styled.nav`
  display: flex;
  gap: ${theme.spacing.sm};
  align-items: center;
`;

const NavLink = styled(Link)<{ $active?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  font-size: 0.9rem;
  font-weight: 500;
  transition: background 0.15s;
  background: ${({ $active }) => ($active ? 'rgba(255,255,255,0.25)' : 'transparent')};

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    font-size: 0.8rem;
  }
`;

const LogoutButton = styled.button`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.md};
  font-size: 0.9rem;
  font-weight: 500;
  color: white;
  opacity: 0.8;
  transition: opacity 0.15s;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.15);
  }

  @media (max-width: 600px) {
    font-size: 0.8rem;
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
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

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <Wrapper>
      <Header>
        <Logo>{HE.APP_NAME}</Logo>
        <Nav>
          <NavLink href="/study" $active={pathname === '/study'}>{HE.NAV_STUDY}</NavLink>
          <NavLink href="/add" $active={pathname === '/add'}>{HE.NAV_ADD}</NavLink>
          <NavLink href="/quiz" $active={pathname === '/quiz'}>{HE.NAV_QUIZ}</NavLink>
          <LogoutButton onClick={handleLogout}>{HE.NAV_LOGOUT}</LogoutButton>
        </Nav>
      </Header>
      <Main>{children}</Main>
    </Wrapper>
  );
}
