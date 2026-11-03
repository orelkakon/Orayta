'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';

/**
 * Page title block shared by every section: a gold-ringed emblem, the title in
 * Frank Ruhl, an optional one-line subtitle and an actions slot (end side).
 */
const Wrap = styled.header`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  margin: ${theme.spacing.xs} 0 ${theme.spacing.lg};
  ${theme.up.md} { margin: ${theme.spacing.sm} 0 ${theme.spacing.xl}; gap: ${theme.spacing.md}; }
`;

const Emblem = styled.span`
  flex-shrink: 0;
  width: 44px; height: 44px; border-radius: 14px;
  display: inline-flex; align-items: center; justify-content: center;
  color: ${theme.colors.primary};
  background: ${theme.colors.goldSoft};
  border: 1px solid color-mix(in srgb, ${theme.colors.gold} 40%, transparent);
  ${theme.up.md} { width: 52px; height: 52px; border-radius: 16px; }
`;

const Text = styled.div`flex: 1; min-width: 0;`;

const Title = styled.h1`
  font-size: clamp(1.55rem, 1.2rem + 1.6vw, 2.1rem);
  line-height: 1.15; letter-spacing: -0.01em;
  color: ${theme.colors.text};
`;

const Sub = styled.p`
  margin-top: 4px; max-width: 60ch;
  font-size: ${theme.fontSizes.sm}; line-height: 1.5; color: ${theme.colors.textMuted};
  ${theme.up.md} { font-size: ${theme.fontSizes.md}; }
`;

const Actions = styled.div`
  flex-shrink: 0; display: flex; align-items: center; gap: ${theme.spacing.xs};
`;

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, icon, actions }: PageHeaderProps) {
  return (
    <Wrap>
      {icon && <Emblem aria-hidden="true"><LineIcon name={icon} size={24} strokeWidth={1.7} /></Emblem>}
      <Text>
        <Title>{title}</Title>
        {subtitle && <Sub>{subtitle}</Sub>}
      </Text>
      {actions && <Actions>{actions}</Actions>}
    </Wrap>
  );
}

const SectionWrap = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.ms};
`;

const SectionTitle = styled.h2`
  font-size: ${theme.fontSizes.xl}; line-height: 1.2; color: ${theme.colors.text};
`;

const SectionAction = styled(Link)`
  display: inline-flex; align-items: center; gap: 2px; min-height: 36px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.secondaryText};
  transition: opacity 0.15s ease;
  &:active { opacity: 0.6; }
`;

/** Section heading with an optional "see all" link. */
export function SectionHeader({ title, action, id }: { title: ReactNode; action?: { href: string; label: string }; id?: string }) {
  return (
    <SectionWrap>
      <SectionTitle id={id}>{title}</SectionTitle>
      {action && (
        <SectionAction href={action.href}>
          {action.label}<LineIcon name="chevron" size={16} strokeWidth={2} />
        </SectionAction>
      )}
    </SectionWrap>
  );
}
