'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SERVICES } from '@/lib/siddur';
import { SIDDUR_EXTRAS } from '@/lib/siddurContent';
import { LineIcon } from '@/components/common/LineIcons';
import PageHeader, { SectionHeader } from '@/components/ui/PageHeader';
import { Card, CardLink } from '@/components/ui/Card';
import MoreGrid from '@/components/Layout/MoreGrid';
import NowServiceCard from '@/components/Prayers/NowServiceCard';
import { usePrayerDay } from './usePrayerDay';

/**
 * /siddur — the service that fits now as the hero, every service with what
 * it contains, and the siddur's standalone pieces (open in the shared reader).
 */
const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.xl};`;

const Services = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.sm};
  ${theme.up.md} { grid-template-columns: repeat(3, minmax(0, 1fr)); }
`;

const Service = styled(CardLink)`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  ${theme.up.md} { flex-direction: column; align-items: flex-start; }
`;

const Icon = styled.span`
  width: 48px; height: 48px; flex-shrink: 0; border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.primary}; background: ${theme.colors.goldSoft};
`;

const Text = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px;`;
const Name = styled.strong`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; color: ${theme.colors.text};`;
const Highlights = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.45;`;
const Count = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight};`;
const Chevron = styled.span`color: ${theme.colors.textLight}; ${theme.up.md} { display: none; }`;

const Tachanun = styled.p`
  margin-top: ${theme.spacing.sm}; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  display: flex; align-items: center; gap: 6px;
`;

const EXTRAS = SIDDUR_EXTRAS.map(x => ({ href: `/content?open=${x.id}`, label: x.name, icon: x.icon }));

export default function SiddurHome() {
  const day = usePrayerDay('auto');
  return (
    <Page>
      <div>
        <PageHeader icon="sunrise" title={HE.SIDDUR_TITLE} subtitle={HE.SIDDUR_SUBTITLE} />
        <NowServiceCard showOthers={false} />
        {day && day.service !== 'arvit' && (
          <Tachanun>
            <LineIcon name="info" size={16} />
            {day.tachanun ? HE.SIDDUR_TACHANUN_SAID : HE.SIDDUR_TACHANUN_NOT(day.noTachanunReason ?? '')}
          </Tachanun>
        )}
      </div>

      <section aria-labelledby="siddur-services">
        <SectionHeader id="siddur-services" title={HE.PRAYERS_OTHER_SERVICES} />
        <Services>
          {SERVICES.map(s => (
            <Service key={s.id} href={`/siddur/${s.id}`} $interactive>
              <Icon aria-hidden="true"><LineIcon name={s.icon} size={24} strokeWidth={1.7} /></Icon>
              <Text>
                <Name>{s.title}</Name>
                <Highlights>{s.highlights}</Highlights>
                <Count>{HE.SIDDUR_SECTIONS_COUNT(s.sections.length)}</Count>
              </Text>
              <Chevron aria-hidden="true"><LineIcon name="chevron" size={20} /></Chevron>
            </Service>
          ))}
        </Services>
      </section>

      <section aria-labelledby="siddur-extras">
        <SectionHeader id="siddur-extras" title={HE.SIDDUR_EXTRAS_TITLE} />
        <Card $pad="sm"><MoreGrid items={EXTRAS} pathname="/siddur" columns={3} /></Card>
      </section>
    </Page>
  );
}
