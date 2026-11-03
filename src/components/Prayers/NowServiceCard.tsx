'use client';

import Link from 'next/link';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate } from '@/lib/hebrewDate';
import { getService, SERVICES } from '@/lib/siddur';
import type { ServiceId } from '@/lib/siddur';
import { occasionLabels, todaySpecials } from '@/lib/siddur/today';
import { LineIcon } from '@/components/common/LineIcons';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePrayerDay } from '@/components/SiddurView/usePrayerDay';

/**
 * The prayer that fits right now, as the page's hero: lit by the time of
 * day, with today's date, occasions and what's added today, one tap into
 * the service. The other two services follow as compact cards.
 */
const GLOW: Record<ServiceId, string> = {
  shacharit: theme.gilded.dawnGlow,
  mincha: theme.gilded.duskGlow,
  arvit: theme.gilded.nightGlowCool,
};

const rise = keyframes`from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; }`;

const Hero = styled.section<{ $glow: string }>`
  position: relative; overflow: hidden; isolation: isolate;
  padding: ${theme.spacing.lg}; border-radius: 24px;
  background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  animation: ${rise} 0.36s ${theme.motion.outStrong} both;
  &::before { content: ''; position: absolute; inset: 0; z-index: -1; background: ${p => p.$glow}; }
  ${theme.up.md} { padding: ${theme.spacing.xl}; border-radius: 28px; }
`;

const Watermark = styled.span`
  position: absolute; z-index: -1; top: -18px; inset-inline-end: -18px;
  color: ${theme.game.gold}; opacity: 0.12; pointer-events: none;
`;

const Eyebrow = styled.p`font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.game.goldLight};`;
const Name = styled.h2`margin-top: 2px; font-size: clamp(2rem, 1.6rem + 2vw, 2.6rem); line-height: 1.1; color: ${theme.gilded.nightInk};`;
const DateLine = styled.p`margin-top: 4px; font-size: ${theme.fontSizes.md}; color: ${theme.gilded.nightMuted};`;

const Inserts = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-top: ${theme.spacing.md};`;
const Insert = styled.span`
  display: inline-flex; align-items: center; height: 28px; padding: 0 11px;
  border-radius: ${theme.radii.pill}; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${theme.game.goldInk}; background: ${theme.gilded.nightTag}; border: 1px solid ${theme.gilded.nightLine};
`;

const Cta = styled.div`margin-top: ${theme.spacing.lg};`;

const Others = styled.div`
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.sm};
`;

const Other = styled(Link)`
  display: flex; align-items: center; gap: 10px; min-height: 64px; padding: 10px 12px;
  border-radius: 18px; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  box-shadow: ${theme.shadows.sm};
  transition: transform 0.16s ${theme.motion.outStrong};
  &:active { transform: scale(0.97); }
  & > span:first-child {
    width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: ${theme.colors.primary}; background: ${theme.colors.goldSoft};
  }
  strong { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text}; }
`;

const Skel = styled(Skeleton)`background: ${theme.gilded.nightSkeleton};`;

export default function NowServiceCard({ showOthers = true }: { showOthers?: boolean }) {
  const day = usePrayerDay('auto');

  if (!day) {
    return (
      <Hero $glow="none" aria-busy="true">
        <Skel $w="30%" $h="14px" />
        <Skel $w="45%" $h="38px" style={{ marginTop: 10 }} />
        <Skel $w="100%" $h="48px" $r="24px" style={{ marginTop: 28 }} />
      </Hero>
    );
  }

  const service = getService(day.service);
  const inserts = [...occasionLabels(day), ...todaySpecials(service, day).map(x => x.label)];
  const unique = inserts.filter((x, i) => inserts.indexOf(x) === i).slice(0, 6);
  const evening = day.service === 'arvit';

  return (
    <div>
      <Hero $glow={GLOW[day.service]} aria-label={HE.PRAYERS_NOW_EYEBROW}>
        <Watermark aria-hidden="true"><LineIcon name={service.icon} size={150} strokeWidth={1.1} /></Watermark>
        <Eyebrow>{HE.PRAYERS_NOW_EYEBROW}</Eyebrow>
        <Name>{service.title}</Name>
        <DateLine>{evening ? `${HE.SIDDUR_TONIGHT} · ` : ''}{formatHebrewDate(day.at)}</DateLine>
        {unique.length > 0 && <Inserts>{unique.map(t => <Insert key={t}>{t}</Insert>)}</Inserts>}
        <Cta>
          <ButtonLink href={`/siddur/${service.id}`} $variant="gold" $size="lg">
            {HE.PRAYERS_OPEN_SERVICE(service.title)}
            <LineIcon name="chevron" size={20} strokeWidth={2.2} />
          </ButtonLink>
        </Cta>
      </Hero>
      {showOthers && <Others>
        {SERVICES.filter(s => s.id !== service.id).map(s => (
          <Other key={s.id} href={`/siddur/${s.id}`}>
            <span aria-hidden="true"><LineIcon name={s.icon} size={20} strokeWidth={1.8} /></span>
            <strong>{s.title}</strong>
          </Other>
        ))}
      </Others>}
    </div>
  );
}
