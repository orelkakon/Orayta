'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import OraytaLogo from '@/components/common/OraytaLogo';

export const Page = styled.main`
  direction: rtl;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.xxl} ${theme.spacing.md};
  text-align: center;
`;

export const LogoCircle = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: ${theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${theme.shadows.md};
`;

export const Title = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.h1};
  font-weight: 700;
  color: ${theme.colors.primary};
`;

export const Body = styled.p`
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.md};
  line-height: 1.7;
  color: ${theme.colors.textMuted};
  max-width: 420px;
`;

export const Divider = styled.div`
  width: 140px;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  border-radius: 2px;
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.ms};
`;

export const HomeLink = styled(Link)`
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${theme.colors.onPrimary};
  background: ${theme.colors.primary};
  padding: ${theme.spacing.ms} ${theme.spacing.xl};
  border-radius: ${theme.radii.md};
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryLight};
  }
`;

export const RetryButton = styled.button`
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${theme.colors.primary};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.ms} ${theme.spacing.xl};
  border-radius: ${theme.radii.md};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    background: ${theme.colors.surfaceAlt};
    border-color: ${theme.colors.primary};
  }
`;

export function ErrorPageLogo() {
  return (
    <LogoCircle>
      <OraytaLogo size={56} />
    </LogoCircle>
  );
}
