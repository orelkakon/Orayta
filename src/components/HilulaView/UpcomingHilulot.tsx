'use client';

import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { HilulaDay } from '@/types/push';
import { PanelTitle } from './hilulaStyles';

const Box = styled.section`
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.md}; box-shadow: ${theme.shadows.sm};
`;
const Row = styled.div`
  display: flex; gap: ${theme.spacing.md}; align-items: baseline;
  padding: ${theme.spacing.sm} 0; border-top: 1px solid ${theme.colors.borderLight};
  &:first-of-type { border-top: none; }
`;
const When = styled.div`
  flex-shrink: 0; min-width: 84px; font-family: ${theme.fonts.body};
  font-weight: 700; color: ${theme.colors.secondary}; font-size: ${theme.fontSizes.sm};
`;
const Names = styled.div`display: flex; flex-wrap: wrap; gap: 4px 10px; min-width: 0;`;
const NameLink = styled(Link)`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; color: ${theme.colors.text}; &:hover { color: ${theme.colors.primary}; }`;
const Civil = styled.div`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; font-weight: 400;`;

const civil = (iso: string) =>
  new Intl.DateTimeFormat('he-IL', { weekday: 'short', day: 'numeric', month: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T12:00:00Z`));

export default function UpcomingHilulot({ days }: { days: HilulaDay[] }) {
  return (
    <Box>
      <PanelTitle as="h2" style={{ fontSize: theme.fontSizes.lg }}><LineIcon name="calendar" size={18} /> {HE.HILULA_UPCOMING}</PanelTitle>
      {days.map(d => (
        <Row key={d.iso}>
          <When>{d.hebrew}<Civil>{civil(d.iso)}</Civil></When>
          <Names>
            {d.rabbis.map(r => <NameLink key={r.id} href={`/rabbis?q=${encodeURIComponent(r.name)}`}>{r.name}</NameLink>)}
          </Names>
        </Row>
      ))}
    </Box>
  );
}
