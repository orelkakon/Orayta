'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { TehillimAdminStats } from '@/types/tehillim';

const Card = styled.section`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg}; display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;
const Title = styled.h2`
  margin: 0; display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.primary};
`;
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(4, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;
const Cell = styled.div`display: flex; flex-direction: column; gap: 2px;`;
const Value = styled.div`font-family: ${theme.fonts.ui}; font-size: 1.5rem; font-weight: 700; color: ${theme.colors.text};`;
const Label = styled.div`font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};`;

/** חלוקות תהילים at a glance — fetched separately so the main stats never wait on it. */
export default function AdminTehillimCard() {
  const [s, setS] = useState<TehillimAdminStats | null>(null);
  useEffect(() => {
    fetch('/api/admin/tehillim-stats')
      .then(r => (r.ok ? r.json() as Promise<TehillimAdminStats> : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);
  if (!s) return null;
  const A = HE.ADMIN_TH;
  const cells: [string, number][] = [
    [A.total, s.total], [A.opened30, s.opened30], [A.active7, s.active7], [A.books, s.books],
    [A.today, s.readToday], [A.week, s.readWeek], [A.month, s.readMonth], [A.readers, s.readers30],
  ];
  return (
    <Card>
      <Title><LineIcon name="scroll" size={18} /> {A.title}</Title>
      <Grid>{cells.map(([label, value]) => <Cell key={label}><Value>{value.toLocaleString('he-IL')}</Value><Label>{label}</Label></Cell>)}</Grid>
    </Card>
  );
}
