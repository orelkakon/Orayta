'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SECTIONS } from '@/lib/contentsSections';
import { SIDDUR_EXTRAS } from '@/lib/siddurContent';
import { LineIcon } from '@/components/common/LineIcons';
import PageHeader, { SectionHeader } from '@/components/ui/PageHeader';
import { Card, CardLink } from '@/components/ui/Card';
import MoreGrid from '@/components/Layout/MoreGrid';
import NowServiceCard from '@/components/Prayers/NowServiceCard';
import type { NavItem } from '@/components/Layout/navItems';

/**
 * "תפילות" tab: the prayer that fits now on top, the everyday prayers one
 * tap away, then more of the siddur and Tehillim / Tanakh. Items open in the
 * shared reader at /content?open=<id> (so the back gesture returns here).
 */
const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xl};`;

const open = (id: string) => `/content?open=${encodeURIComponent(id)}`;

const QUICK: NavItem[] = HE.PRAYERS_QUICK.map(q => ({ href: open(q.id), label: q.label, icon: q.icon }));

const MORE: NavItem[] = [
  ...SIDDUR_EXTRAS.filter(x => !HE.PRAYERS_QUICK.some(q => q.id === x.id)).map(x => ({ href: open(x.id), label: x.name, icon: x.icon })),
  ...SECTIONS.filter(s => s.id === 'general-prayers').map(s => ({ href: open(s.id), label: s.title, icon: s.icon })),
];

const TANAKH = SECTIONS.filter(s => s.group === 'tanakh' || s.id === 'tehillim');

const Grid = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${theme.spacing.sm};
  ${theme.up.md} { grid-template-columns: repeat(4, minmax(0, 1fr)); }
`;

const BookCard = styled(CardLink)`
  display: flex; flex-direction: column; gap: 6px; min-height: 118px;
  & > span:first-child {
    width: 42px; height: 42px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    color: ${theme.colors.primary}; background: ${theme.colors.goldSoft};
  }
  strong { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text}; }
  small { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.4; }
`;

export default function PrayersHub() {
  return (
    <Page>
      <div>
        <PageHeader icon="book" title={HE.PRAYERS_TITLE} subtitle={HE.PRAYERS_SUB} />
        <NowServiceCard />
      </div>

      <section aria-labelledby="prayers-quick">
        <SectionHeader id="prayers-quick" title={HE.PRAYERS_QUICK_TITLE} />
        <Card $pad="sm"><MoreGrid items={QUICK} pathname="/content" columns={4} /></Card>
      </section>

      <section aria-labelledby="prayers-more">
        <SectionHeader id="prayers-more" title={HE.PRAYERS_SIDDUR_MORE} />
        <Card $pad="sm"><MoreGrid items={MORE} pathname="/content" columns={3} /></Card>
      </section>

      <section aria-labelledby="prayers-tanakh">
        <SectionHeader id="prayers-tanakh" title={HE.PRAYERS_TANAKH_TITLE} />
        <Grid>
          {TANAKH.map(s => (
            <BookCard key={s.id} href={open(s.id)} $interactive>
              <span aria-hidden="true"><LineIcon name={s.icon} size={22} strokeWidth={1.8} /></span>
              <strong>{s.title}</strong>
              <small>{s.desc}</small>
            </BookCard>
          ))}
        </Grid>
      </section>
    </Page>
  );
}
