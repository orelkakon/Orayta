'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { computeDelta, Delta } from '@/lib/adminStatsUtils';
import { COMMENT_TARGETS } from '@/lib/feedComments';
import { commentTargetMeta } from '@/components/FeedView/feedTypes';
import type { AdminCommentStats } from '@/types';
import AdminCommentsLists from './AdminCommentsLists';

const Card = styled.section`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

const TitleRow = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;
const TitleIcon = styled.span`color: ${theme.colors.secondary}; display: flex;`;
const CardTitle = styled.h2`font-size: 0.95rem; font-weight: 700; color: ${theme.colors.text};`;
const CardSub = styled.span`font-size: 0.75rem; color: ${theme.colors.textLight};`;

const Kpis = styled.div`
  display: grid; grid-template-columns: repeat(5, 1fr); gap: ${theme.spacing.sm};
  @media (max-width: 720px) { grid-template-columns: repeat(2, 1fr); }
`;

const Kpi = styled.div`
  background: ${theme.colors.surfaceAlt}; border-radius: ${theme.radii.md};
  padding: ${theme.spacing.sm} ${theme.spacing.ms};
  display: flex; flex-direction: column; gap: 2px;
`;

const KpiValue = styled.span`
  font-family: ${theme.fonts.ui}; font-size: 1.45rem; font-weight: 700; line-height: 1.15;
  color: ${theme.colors.text}; font-variant-numeric: tabular-nums;
`;

const KpiLabel = styled.span`font-size: 0.74rem; font-weight: 600; color: ${theme.colors.textMuted};`;

const DeltaTag = styled.span<{ $dir: Delta['dir'] }>`
  font-size: 0.7rem; font-weight: 600; direction: ltr; align-self: flex-start;
  color: ${p => p.$dir === 'up' ? theme.colors.success : p.$dir === 'down' ? theme.colors.error : theme.colors.textLight};
`;

const Section = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const SectionTitle = styled.h3`font-size: 0.82rem; font-weight: 700; color: ${theme.colors.textMuted};`;

const Bars = styled.div`display: flex; flex-direction: column; gap: 6px;`;

const BarRow = styled.div`
  display: grid; grid-template-columns: 120px 1fr 44px; align-items: center; gap: ${theme.spacing.sm};
  font-size: 0.8rem; color: ${theme.colors.text};
`;

const BarName = styled.span`display: flex; align-items: center; gap: 6px; font-weight: 600; color: ${theme.colors.textMuted};`;
const Track = styled.div`height: 8px; border-radius: 999px; background: ${theme.colors.surfaceAlt}; overflow: hidden;`;
const Fill = styled.div<{ $pct: number }>`
  height: 100%; width: ${p => p.$pct}%; min-width: ${p => p.$pct > 0 ? '4px' : '0'};
  border-radius: inherit; background: ${theme.colors.secondary};
`;
const BarNum = styled.span`font-family: ${theme.fonts.ui}; font-weight: 700; text-align: left; font-variant-numeric: tabular-nums;`;

const Empty = styled.p`
  font-size: 0.85rem; color: ${theme.colors.textMuted}; text-align: center;
  padding: ${theme.spacing.lg} ${theme.spacing.md};
`;

const fmt = (n: number) => n.toLocaleString('he-IL');

export default function AdminCommentsCard({ comments: c }: { comments: AdminCommentStats }) {
  const kpis: { label: string; value: number; delta?: Delta }[] = [
    { label: HE.ADMIN_COMMENTS_TOTAL, value: c.total },
    { label: HE.ADMIN_COMMENTS_TODAY, value: c.today, delta: computeDelta(c.today, c.yesterday) },
    { label: HE.ADMIN_COMMENTS_WEEK, value: c.week, delta: computeDelta(c.week, c.prevWeek) },
    { label: HE.ADMIN_COMMENTS_COMMENTERS, value: c.commenters },
    { label: HE.ADMIN_COMMENTS_POSTS, value: c.posts },
  ];
  const types = COMMENT_TARGETS
    .map(t => ({ t, n: c.byType[t] ?? 0 }))
    .filter(x => x.n > 0)
    .sort((a, b) => b.n - a.n);
  const maxType = Math.max(1, ...types.map(x => x.n));

  return (
    <Card>
      <TitleRow>
        <TitleIcon><LineIcon name="comment" size={18} strokeWidth={1.8} /></TitleIcon>
        <CardTitle>{HE.ADMIN_COMMENTS_TITLE}</CardTitle>
        <CardSub>{HE.ADMIN_COMMENTS_SUB}</CardSub>
      </TitleRow>

      <Kpis>
        {kpis.map(k => (
          <Kpi key={k.label}>
            <KpiValue>{fmt(k.value)}</KpiValue>
            <KpiLabel>{k.label}</KpiLabel>
            {k.delta && <DeltaTag $dir={k.delta.dir}>{k.delta.text}</DeltaTag>}
          </Kpi>
        ))}
      </Kpis>

      {c.total === 0 ? <Empty>{HE.ADMIN_COMMENTS_EMPTY}</Empty> : (
        <>
          <Section>
            <SectionTitle>{HE.ADMIN_COMMENTS_BY_TYPE}</SectionTitle>
            <Bars>
              {types.map(({ t, n }) => {
                const meta = commentTargetMeta(t);
                return (
                  <BarRow key={t}>
                    <BarName><LineIcon name={meta.icon} size={14} strokeWidth={1.8} />{meta.label}</BarName>
                    <Track><Fill $pct={(n / maxType) * 100} /></Track>
                    <BarNum>{fmt(n)}</BarNum>
                  </BarRow>
                );
              })}
            </Bars>
          </Section>
          <AdminCommentsLists top={c.top} recent={c.recent} />
        </>
      )}
    </Card>
  );
}
