'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { SERVICES } from '@/lib/siddur';
import type { ServiceId } from '@/lib/siddur';
import { suggestService, prayerDay, PrayerDay } from '@/lib/siddur/calendar';
import { occasionLabels } from '@/lib/siddur/today';
import { formatHebrewDate } from '@/lib/hebrewDate';
import SiddurExtras from './SiddurExtras';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg};`;

const Head = styled.header`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

const Title = styled.h1`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h1}; color: ${theme.colors.primary};
`;

const Subtitle = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.6;`;

const Cards = styled.div`
  display: grid; grid-template-columns: repeat(3, 1fr); gap: ${theme.spacing.md};
  ${theme.media.md} { grid-template-columns: 1fr; gap: ${theme.spacing.sm}; }
`;

const glow = keyframes`0%, 100% { box-shadow: 0 0 0 0 transparent; } 50% { box-shadow: 0 0 0 4px color-mix(in srgb, ${theme.colors.secondary} 22%, transparent); }`;

const Card = styled(Link)<{ $now: boolean }>`
  position: relative; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.lg}; border-radius: ${theme.radii.lg};
  background: ${theme.colors.surface}; box-shadow: ${theme.shadows.sm};
  border: 1.5px solid ${p => p.$now ? theme.colors.secondary : theme.colors.borderLight};
  ${p => p.$now && css`animation: ${glow} 2.6s ease-in-out 2;`}
  transition: transform ${theme.motion.base} ${theme.motion.out}, box-shadow ${theme.motion.base}, border-color ${theme.motion.fast};
  &:hover { transform: translateY(-2px); box-shadow: ${theme.shadows.md}; border-color: ${theme.colors.secondary}; }
  &:active { transform: scale(0.98); }
  ${theme.media.md} { flex-direction: row; align-items: center; padding: ${theme.spacing.md}; }
  @media (prefers-reduced-motion: reduce) { animation: none; &:hover { transform: none; } }
`;

const Icon = styled.span`
  width: 52px; height: 52px; flex-shrink: 0; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary}; background: ${theme.colors.surfaceAlt};
`;

const Text = styled.div`display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1;`;
const Name = styled.span`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h2}; font-weight: 800; color: ${theme.colors.primary};`;
const Highlights = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.5;`;
const Count = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight};`;

const Now = styled.span`
  position: absolute; top: ${theme.spacing.sm}; inset-inline-end: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xs}; font-weight: 800; color: ${theme.colors.onPrimary};
  background: ${theme.colors.secondary}; border-radius: 999px; padding: 3px 10px;
`;

const Today = styled.p`
  display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};
  strong { color: ${theme.colors.primary}; font-family: ${theme.fonts.body}; }
`;

const Tag = styled.span`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; border-radius: 999px; padding: 2px 9px;
  color: ${theme.colors.onPrimary}; background: ${theme.colors.secondary};
`;

const Arrow = styled.span`display: none; color: ${theme.colors.textLight}; ${theme.media.md} { display: flex; }`;

export default function SiddurHome() {
  // Client-only: the suggestion depends on the reader's current time.
  const [now, setNow] = useState<ServiceId | null>(null);
  const [day, setDay] = useState<PrayerDay | null>(null);
  useEffect(() => {
    const t = new Date();
    setNow(suggestService(t));
    setDay(prayerDay(t, 'shacharit'));
  }, []);

  return (
    <Page>
      <Head>
        <Title><LineIcon name="book" size={28} />{HE.SIDDUR_TITLE}</Title>
        <Subtitle>{HE.SIDDUR_SUBTITLE}</Subtitle>
        {day && (
          <Today>
            <strong>{formatHebrewDate(day.at)}</strong>
            {occasionLabels(day).map(o => <Tag key={o}>{o}</Tag>)}
            <span>· {day.tachanun ? HE.SIDDUR_TACHANUN_SAID : HE.SIDDUR_TACHANUN_NOT(day.noTachanunReason ?? '')}</span>
          </Today>
        )}
      </Head>
      <Cards>
        {SERVICES.map(s => (
          <Card key={s.id} href={`/siddur/${s.id}`} $now={s.id === now}>
            {s.id === now && <Now aria-label={HE.SIDDUR_NOW_ARIA}>{HE.SIDDUR_NOW}</Now>}
            <Icon><LineIcon name={s.icon} size={26} strokeWidth={1.7} /></Icon>
            <Text>
              <Name>{s.title}</Name>
              <Highlights>{s.highlights}</Highlights>
              <Count>{HE.SIDDUR_SECTIONS_COUNT(s.sections.length)}</Count>
            </Text>
            <Arrow aria-hidden>←</Arrow>
          </Card>
        ))}
      </Cards>
      <SiddurExtras />
    </Page>
  );
}
