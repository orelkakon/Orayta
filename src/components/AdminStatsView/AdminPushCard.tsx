'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { PushAdminStats } from '@/types/push';

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
  display: grid; grid-template-columns: repeat(6, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 720px) { grid-template-columns: repeat(3, 1fr); }
`;
const Cell = styled.div`display: flex; flex-direction: column; gap: 2px;`;
const Value = styled.div`font-family: ${theme.fonts.ui}; font-size: 1.5rem; font-weight: 700; color: ${theme.colors.text};`;
const Label = styled.div`font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};`;

/** Push subscribers at a glance — fetched separately so the main stats never wait on it. */
export default function AdminPushCard() {
  const [s, setS] = useState<PushAdminStats | null>(null);

  useEffect(() => {
    fetch('/api/push/stats')
      .then(r => (r.ok ? r.json() as Promise<PushAdminStats> : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);

  if (!s) return null;
  const cells: [string, number][] = [
    [HE.ADMIN_PUSH_TOTAL, s.total], [HE.PUSH_DAILY, s.daily], [HE.PUSH_HILULA, s.hilula],
    [HE.PUSH_OMER, s.omer], [HE.ADMIN_PUSH_SENT_TODAY, s.sentToday], [HE.ADMIN_PUSH_FAILING, s.failing],
  ];
  return (
    <Card>
      <Title><LineIcon name="bell" size={18} /> {HE.ADMIN_PUSH_TITLE}</Title>
      <Grid>
        {cells.map(([label, value]) => (
          <Cell key={label}><Value>{value.toLocaleString('he-IL')}</Value><Label>{label}</Label></Cell>
        ))}
      </Grid>
    </Card>
  );
}
