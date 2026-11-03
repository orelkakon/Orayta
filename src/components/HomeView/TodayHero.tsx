'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatHebrewDate, yearToLetters } from '@/lib/hebrewDate';
import { occasionLabels } from '@/lib/siddur/today';
import { LineIcon } from '@/components/common/LineIcons';
import { ButtonLink } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePrayerDay } from '@/components/SiddurView/usePrayerDay';
import { useMinute } from '@/components/common/useMinute';
import SunArc from './SunArc';
import { greeting, parashaLabel, sunInfo, weekdayName } from './todayInfo';

/**
 * Home's opening card: today in the Jewish calendar. Greeting, Hebrew date,
 * parasha and occasions, where the sun is, and the prayer that fits right now
 * as the primary action. Deep espresso "night" surface in both themes.
 */
const rise = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;

const Card = styled.section`
  position: relative; overflow: hidden; isolation: isolate;
  border-radius: 24px;
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  background: ${theme.gilded.night};
  color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  animation: ${rise} 0.4s ${theme.motion.outStrong} both;
  &::before {
    content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background: ${theme.gilded.nightGlow};
  }
  ${theme.up.md} { padding: ${theme.spacing.xl} ${theme.spacing.xl} ${theme.spacing.lg}; border-radius: 28px; }
`;

const Top = styled.div`display: flex; align-items: flex-start; justify-content: space-between; gap: ${theme.spacing.sm};`;

const Eyebrow = styled.p`
  font-size: ${theme.fontSizes.sm}; font-weight: 500; color: ${theme.gilded.nightMuted};
`;

const DateLine = styled.h2`
  margin-top: 4px;
  font-size: clamp(2rem, 1.5rem + 2.6vw, 2.8rem); line-height: 1.05; letter-spacing: -0.01em;
  color: ${theme.gilded.nightInk};
`;

const Year = styled.span`
  display: block; margin-top: 6px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 500;
  color: ${theme.game.goldLight};
`;

const Tags = styled.div`display: flex; flex-wrap: wrap; gap: 6px; margin-top: ${theme.spacing.md};`;

const Tag = styled.span`
  display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 11px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${theme.game.goldInk};
  background: ${theme.gilded.nightTag};
  border: 1px solid ${theme.gilded.nightLine};
`;

const Rule = styled.div`
  height: 1px; margin: ${theme.spacing.md} 0;
  background: linear-gradient(to left, ${theme.gilded.nightLine}, transparent);
`;

const Bottom = styled.div`
  display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
`;

const Sun = styled.p`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: ${theme.fontSizes.sm}; color: ${theme.gilded.nightMuted};
  font-variant-numeric: tabular-nums;
`;

const Actions = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

const GhostOnNight = styled(ButtonLink)`
  background: ${theme.gilded.nightGhost}; color: ${theme.gilded.nightInk};
  border: 1px solid ${theme.gilded.nightLine};
  @media (hover: hover) and (pointer: fine) { &:hover { background: ${theme.gilded.nightGhostHi}; } }
`;

const SkelLine = styled(Skeleton)`background: ${theme.gilded.nightSkeleton};`;

export default function TodayHero({ parasha }: { parasha: string | null }) {
  const now = useMinute();
  const day = usePrayerDay('auto');

  if (!now || !day) {
    return (
      <Card aria-busy="true" aria-label={HE.HOME_TODAY_ARIA}>
        <SkelLine $w="40%" $h="14px" />
        <SkelLine $w="65%" $h="40px" style={{ marginTop: 10 }} />
        <SkelLine $w="30%" $h="16px" style={{ marginTop: 10 }} />
        <SkelLine $w="100%" $h="44px" $r="22px" style={{ marginTop: 28 }} />
      </Card>
    );
  }

  const sun = sunInfo(now);
  const heb = formatHebrewDate(day.at);
  const year = (() => {
    try { return Number(new Intl.DateTimeFormat('en-u-ca-hebrew', { year: 'numeric' }).format(day.at).replace(/\D/g, '')); }
    catch { return 0; }
  })();
  const tags = [parashaLabel(parasha), ...occasionLabels(day)].filter((t): t is string => !!t);
  const service = HE.HOME_NOW_SERVICE[day.service];

  return (
    <Card aria-label={HE.HOME_TODAY_ARIA}>
      <Top>
        <div>
          <Eyebrow>{greeting(now)} · {weekdayName(now)}</Eyebrow>
          <DateLine>{heb}{year > 0 && <Year>{yearToLetters(year)}</Year>}</DateLine>
        </div>
        <SunArc progress={sun.progress} />
      </Top>
      {tags.length > 0 && (
        <Tags>{tags.map(t => <Tag key={t}>{t}</Tag>)}</Tags>
      )}
      <Rule />
      <Bottom>
        <Sun>
          <LineIcon name={sun.progress === null ? 'sunrise' : 'sun'} size={16} />
          {sun.label} · {HE.HOME_SUN_PLACE}
        </Sun>
        <Actions>
          <ButtonLink href={`/siddur/${day.service}`} $variant="gold">
            <LineIcon name={day.service === 'arvit' ? 'moon' : 'sunrise'} size={18} strokeWidth={1.9} />
            {HE.HOME_NOW_PRAY(service)}
          </ButtonLink>
          <GhostOnNight href="/today" $variant="secondary">{HE.HOME_TODAY_CTA}</GhostOnNight>
        </Actions>
      </Bottom>
    </Card>
  );
}
