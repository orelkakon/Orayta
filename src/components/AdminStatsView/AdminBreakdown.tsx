'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { sumLast, DailyMetric } from '@/lib/adminStatsUtils';
import type { AdminStats } from '@/types';

const Grid = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.md};
  align-items: start;
  @media (max-width: 720px) { grid-template-columns: 1fr; }
`;

const Card = styled.div`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm};
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;

const CardTitle = styled.h2`font-size: 0.95rem; font-weight: 700; color: ${theme.colors.text};`;
const CardSub = styled.span`font-size: 0.75rem; color: ${theme.colors.textLight};`;

const Table = styled.div`display: flex; flex-direction: column;`;

const Row = styled.div`
  display: grid; grid-template-columns: 1fr 58px 58px 64px;
  align-items: center; gap: ${theme.spacing.xs};
  padding: ${theme.spacing.sm} 0;
  &:not(:last-child) { border-bottom: 1px solid ${theme.colors.borderLight}; }
`;

const HeadRow = styled(Row)`
  padding: 0 0 ${theme.spacing.xs}; border-bottom: 1px solid ${theme.colors.border} !important;
`;

const NameCell = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: 0.85rem; font-weight: 600; color: ${theme.colors.text};
`;

const IconWrap = styled.span`
  width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: ${theme.colors.surfaceAlt};
  background: color-mix(in srgb, ${theme.colors.secondary} 14%, transparent);
`;

const Num = styled.span`
  font-family: ${theme.fonts.ui}; font-variant-numeric: tabular-nums;
  font-size: 0.85rem; font-weight: 600; color: ${theme.colors.text}; text-align: center;
`;

const TotalNum = styled(Num)`font-weight: 700; color: ${theme.colors.primary};`;
const ColHead = styled.span`font-size: 0.68rem; font-weight: 600; color: ${theme.colors.textLight}; text-align: center;`;

const ChipRow = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.xs}; padding-top: 2px;`;

const Chip = styled.span`
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 0.75rem; font-weight: 600; color: ${theme.colors.textMuted};
  background: ${theme.colors.surfaceAlt}; border-radius: 20px; padding: 3px 10px;
`;

const SECTIONS: { metric: DailyMetric; icon: string; label: string }[] = [
  { metric: 'feed',      icon: 'sparkle',  label: HE.ADMIN_SECTION_FEED },
  { metric: 'live',      icon: 'live',     label: HE.ADMIN_SECTION_LIVE },
  { metric: 'stories',   icon: 'eye',      label: HE.ADMIN_SECTION_STORIES },
  { metric: 'content',   icon: 'openbook', label: HE.ADMIN_SECTION_CONTENT },
  { metric: 'today',     icon: 'calendar', label: HE.ADMIN_SECTION_TODAY },
  { metric: 'quiz',      icon: 'target',   label: HE.ADMIN_SECTION_QUIZ },
  { metric: 'rabbis',    icon: 'users',    label: HE.ADMIN_SECTION_RABBIS },
  { metric: 'study',     icon: 'scroll',   label: HE.ADMIN_SECTION_STUDY },
  { metric: 'sikumim',   icon: 'pencil',   label: HE.ADMIN_SECTION_SIKUMIM },
  { metric: 'chidushim', icon: 'bulb',     label: HE.ADMIN_SECTION_CHIDUSHIM },
  { metric: 'gematria',  icon: 'aleph',    label: HE.ADMIN_SECTION_GEMATRIA },
];

export default function AdminBreakdown({ stats }: { stats: AdminStats }) {
  const { daily, totals, reactions, shares } = stats;
  // Most-used first — the table doubles as a "where do people go" ranking.
  const sections = [...SECTIONS].sort((a, b) => totals[b.metric] - totals[a.metric]);

  const engagement = [
    { icon: 'target',   label: HE.ADMIN_ENGAGE_QUESTIONS, value: stats.questions },
    { icon: 'flame',    label: HE.ADMIN_ENGAGE_REACTIONS, value: reactions.total },
    { icon: 'bookmark', label: HE.ABOUT_FEED_SAVES,       value: stats.saves },
    { icon: 'copy',     label: HE.ABOUT_FEED_SHARES,      value: shares.wa },
    { icon: 'camera',   label: HE.ABOUT_STORY_SHARES,     value: shares.story },
  ];

  return (
    <Grid>
      <Card>
        <div>
          <CardTitle>{HE.ADMIN_SECTIONS_TITLE}</CardTitle>{' '}
          <CardSub>{HE.ADMIN_SECTIONS_SUB}</CardSub>
        </div>
        <Table>
          <HeadRow>
            <span />
            <ColHead>{HE.ADMIN_COL_TODAY}</ColHead>
            <ColHead>{HE.ADMIN_COL_WEEK}</ColHead>
            <ColHead>{HE.ADMIN_COL_TOTAL}</ColHead>
          </HeadRow>
          {sections.map(s => (
            <Row key={s.metric}>
              <NameCell>
                <IconWrap><LineIcon name={s.icon} size={16} strokeWidth={1.8} /></IconWrap>
                {s.label}
              </NameCell>
              <Num>{(daily[daily.length - 1]?.[s.metric] ?? 0).toLocaleString('he-IL')}</Num>
              <Num>{sumLast(daily, s.metric, 7).toLocaleString('he-IL')}</Num>
              <TotalNum>{totals[s.metric].toLocaleString('he-IL')}</TotalNum>
            </Row>
          ))}
        </Table>
      </Card>

      <Card>
        <CardTitle>{HE.ADMIN_ENGAGE_TITLE}</CardTitle>
        <Table>
          {engagement.map(e => (
            <Row key={e.label} style={{ gridTemplateColumns: '1fr 80px' }}>
              <NameCell>
                <IconWrap><LineIcon name={e.icon} size={16} strokeWidth={1.8} /></IconWrap>
                {e.label}
              </NameCell>
              <TotalNum>{e.value.toLocaleString('he-IL')}</TotalNum>
            </Row>
          ))}
        </Table>
        <ChipRow>
          <Chip>❤️ {reactions.heart.toLocaleString('he-IL')} · {HE.ABOUT_REACTIONS_HEART}</Chip>
          <Chip>🔥 {reactions.fire.toLocaleString('he-IL')} · {HE.ABOUT_REACTIONS_FIRE}</Chip>
          <Chip>✨ {reactions.spark.toLocaleString('he-IL')} · {HE.ABOUT_REACTIONS_SPARK}</Chip>
        </ChipRow>
      </Card>
    </Grid>
  );
}
