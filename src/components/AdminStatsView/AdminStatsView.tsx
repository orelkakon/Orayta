'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { useRole } from '@/components/common/RoleContext';
import type { AdminStats } from '@/types';
import AdminKpiRow from './AdminKpiRow';
import AdminUsersChart from './AdminUsersChart';
import AdminBreakdown from './AdminBreakdown';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.xl};
  animation: ${fadeUp} 0.4s ease;
`;

const Head = styled.header`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
`;

const Title = styled.h1`
  font-family: ${theme.fonts.body}; font-size: 1.6rem; font-weight: 700;
  color: ${theme.colors.primary};
`;

const Subtitle = styled.p`
  font-size: 0.85rem; color: ${theme.colors.textMuted};
`;

const Notice = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.xl}; text-align: center;
  color: ${theme.colors.textMuted}; font-size: 0.95rem;
  margin-top: ${theme.spacing.xl};
`;

export default function AdminStatsView() {
  const role = useRole();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (role !== 'admin') return;
    void fetch('/api/admin/stats')
      .then(r => { if (!r.ok) throw new Error('forbidden'); return r.json(); })
      .then((d: AdminStats) => setStats(d))
      .catch(() => setError(true));
  }, [role]);

  if (role !== 'admin') return <Notice>{HE.ADMIN_STATS_DENIED}</Notice>;
  if (error) return <Notice>{HE.ADMIN_STATS_ERROR}</Notice>;
  if (!stats) return <Notice>{HE.ADMIN_STATS_LOADING}</Notice>;

  return (
    <Page>
      <Head>
        <Title>📊 {HE.ADMIN_STATS_TITLE}</Title>
        <Subtitle>{HE.ADMIN_STATS_SUBTITLE}</Subtitle>
      </Head>
      <AdminKpiRow stats={stats} />
      <AdminUsersChart daily={stats.daily} />
      <AdminBreakdown stats={stats} />
    </Page>
  );
}
