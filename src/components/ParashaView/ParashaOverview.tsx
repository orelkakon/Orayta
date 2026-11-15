'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { ParashaWeek } from '@/types/dailyLearning';
import type { ParashaPart } from '@/lib/parasha/refs';
import { findParashaInsight } from '@/lib/storiesContent/parashot';
import { openRabbiBot } from '@/lib/rabbiBot/client';
import { LineIcon } from '@/components/common/LineIcons';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RowGroup } from '@/components/ui/Switch';
import { SectionHeader } from '@/components/ui/PageHeader';

/** The week at a glance: night hero, a thought for Shabbat, the summary, aliyot and haftara. */
const Page = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  max-width: ${theme.layout.reading}; margin-inline: auto; width: 100%;
`;

const Hero = styled.section`
  position: relative; overflow: hidden; isolation: isolate;
  border-radius: 24px; padding: ${theme.spacing.lg};
  background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  &::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${theme.gilded.nightGlow}; }
  ${theme.up.md} { padding: ${theme.spacing.xl}; }
`;

const Eyebrow = styled.p`font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.game.gold};`;
const Title = styled.h1`
  margin-top: 4px; font-size: clamp(2rem, 1.6rem + 2vw, 2.6rem); line-height: 1.1; color: ${theme.gilded.nightInk};
`;
const Sub = styled.p`margin-top: 6px; font-size: ${theme.fontSizes.sm}; color: ${theme.gilded.nightMuted};`;
const HeroCta = styled.div`margin-top: ${theme.spacing.lg};`;

const Insight = styled(Card)`
  border-inline-start: 4px solid ${theme.colors.gold};
  p { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; line-height: 1.8; }
`;

const Kicker = styled.h2`
  display: flex; align-items: center; gap: 6px; margin-bottom: ${theme.spacing.xs};
  font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.secondary};
`;

const Summary = styled.p`font-size: ${theme.fontSizes.md}; line-height: 1.8; color: ${theme.colors.text};`;
const Credit = styled.p`margin-top: ${theme.spacing.sm}; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};`;

const Row = styled.button`
  width: 100%; min-height: 56px; display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 8px ${theme.spacing.md}; text-align: start; color: ${theme.colors.text};
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
  & > svg { color: ${theme.colors.textLight}; flex-shrink: 0; }
  &:active { background: color-mix(in srgb, ${theme.colors.text} 5%, transparent); }
`;

const RowText = styled.span`flex: 1; min-width: 0; display: flex; flex-direction: column;`;
const RowMain = styled.span`font-weight: 700; font-size: ${theme.fontSizes.md};`;
const RowSub = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

interface Props { week: ParashaWeek; onOpen: (p: ParashaPart) => void }

export default function ParashaOverview({ week, onOpen }: Props) {
  const insight = findParashaInsight(week.name);
  const sub = [week.book && HE.PARASHA_BOOK(week.book), week.heRef].filter(Boolean).join(' · ');

  return (
    <Page>
      <Hero>
        <Eyebrow>{HE.PARASHA_EYEBROW}</Eyebrow>
        <Title>{HE.PARASHA_TITLE(week.name)}</Title>
        {sub && <Sub>{sub}</Sub>}
        <HeroCta>
          <Button $variant="gold" onClick={() => onOpen('all')}>
            <LineIcon name="scroll" size={18} strokeWidth={1.9} />{HE.PARASHA_READ_ALL}
          </Button>
        </HeroCta>
      </Hero>

      {insight && (
        <Insight>
          <Kicker><LineIcon name="bulb" size={16} />{HE.PARASHA_INSIGHT}</Kicker>
          <p>{insight.insight}</p>
        </Insight>
      )}

      {week.summary && (
        <Card>
          <Kicker><LineIcon name="openbook" size={16} />{HE.PARASHA_SUMMARY}</Kicker>
          <Summary>{week.summary}</Summary>
          <Credit>{HE.PARASHA_SUMMARY_CREDIT}</Credit>
        </Card>
      )}

      {week.aliyot.length > 0 && (
        <section>
          <SectionHeader title={HE.PARASHA_READING} />
          <RowGroup>
            {week.aliyot.map((a, i) => (
              <Row key={a.ref + i} type="button" onClick={() => onOpen(i)}>
                <RowText><RowMain>{a.label}</RowMain><RowSub>{a.heRef}</RowSub></RowText>
                <LineIcon name="chevron" size={18} />
              </Row>
            ))}
          </RowGroup>
        </section>
      )}

      {week.haftarah && (
        <section>
          <SectionHeader title={HE.PARASHA_HAFTARAH} />
          <RowGroup>
            <Row type="button" onClick={() => onOpen('h')}>
              <RowText><RowMain>{week.haftarah.heRef}</RowMain><RowSub>{HE.PARASHA_HAFTARAH_CUSTOM}</RowSub></RowText>
              <LineIcon name="chevron" size={18} />
            </Row>
          </RowGroup>
        </section>
      )}

      <RowGroup>
        <Row type="button" onClick={openRabbiBot}>
          <LineIcon name="ask" size={20} />
          <RowText><RowMain>{HE.PARASHA_ASK}</RowMain><RowSub>{HE.PARASHA_ASK_SUB}</RowSub></RowText>
          <LineIcon name="chevron" size={18} />
        </Row>
      </RowGroup>
    </Page>
  );
}
