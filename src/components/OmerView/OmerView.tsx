'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useOmerNow, useOmerLog } from './useOmer';
import OmerHero from './OmerHero';
import OmerNusach from './OmerNusach';
import OmerGrid from './OmerGrid';
import OmerOffSeason from './OmerOffSeason';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.lg}; max-width: 760px; margin: 0 auto; width: 100%;`;

const Hero = styled.header`
  position: relative; overflow: hidden; isolation: isolate;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.xl};
  border-radius: ${theme.radii.xl}; background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight}; box-shadow: ${theme.shadows.sm};
  ${theme.media.sm} { padding: ${theme.spacing.ms} ${theme.spacing.md} ${theme.spacing.lg}; border-radius: ${theme.radii.lg}; }
  &::before {
    content: ''; position: absolute; inset: 0 0 auto; height: 3px;
    background: linear-gradient(90deg, transparent, ${theme.colors.secondary}, transparent);
  }
`;
const Watermark = styled.span`
  position: absolute; z-index: -1; top: -30px; inset-inline-end: -26px;
  color: ${theme.colors.secondary}; opacity: 0.07; pointer-events: none;
`;
const TopRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;
const Back = styled(Link)`
  display: inline-flex; align-items: center; min-height: 36px; padding: 0 ${theme.spacing.sm};
  margin-inline-start: -${theme.spacing.sm}; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
  &:hover { color: ${theme.colors.primary}; background: ${theme.colors.surfaceAlt}; }
`;
const Titles = styled.div`display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center;`;
const Title = styled.h1`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.display}; font-weight: 800; color: ${theme.colors.primary}; line-height: 1.1;
  ${theme.media.sm} { font-size: ${theme.fontSizes.h1}; }
`;
const Sub = styled.span`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Notice = styled.div<{ $tone: 'gold' | 'muted' }>`
  display: flex; gap: ${theme.spacing.ms}; align-items: flex-start;
  padding: ${theme.spacing.md}; border-radius: ${theme.radii.md}; line-height: 1.7;
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text};
  background: ${p => p.$tone === 'gold' ? `color-mix(in srgb, ${theme.colors.secondary} 10%, ${theme.colors.surface})` : theme.colors.surfaceAlt};
  border: 1px solid ${p => p.$tone === 'gold' ? `color-mix(in srgb, ${theme.colors.secondary} 40%, transparent)` : theme.colors.borderLight};
  svg { flex-shrink: 0; color: ${theme.colors.secondary}; margin-top: 2px; }
  strong { display: block; color: ${theme.colors.primary}; font-size: ${theme.fontSizes.md}; }
`;

/** /omer — tonight's count, its nusach, the 49-day map and a per-device check-off. */
export default function OmerView() {
  const omer = useOmerNow();
  const s = omer?.status ?? null;
  const focus = s ? s.tonight ?? s.today : null;
  // At night the user ticks tonight's count; by day, last night's.
  const markDay = s ? (s.isNight ? s.tonight : s.today) : null;
  const log = useOmerLog(markDay ?? focus);
  const [selected, setSelected] = useState(1);

  useEffect(() => { if (focus) setSelected(focus); }, [focus]);

  const header = (
    <TopRow>
      <Back href="/today">{HE.LEARN_BACK}</Back>
      <Back href="/siddur/arvit#omer">{HE.SIDDUR_ARVIT} ←</Back>
    </TopRow>
  );
  const titles = <Titles><Title>{HE.OMER_TITLE}</Title><Sub>{HE.OMER_SUBTITLE}</Sub></Titles>;

  if (!omer || !s) return <Page><Hero>{header}{titles}</Hero></Page>;

  if (focus === null) {
    return (
      <Page>
        <Hero>
          <Watermark aria-hidden><LineIcon name="sparkle" size={170} strokeWidth={1.1} /></Watermark>
          {header}{titles}
          <OmerOffSeason now={omer.now} />
        </Hero>
        <OmerGrid current={null} counted={[]} selected={selected} onSelect={setSelected} />
      </Page>
    );
  }

  const lastDay = !s.isNight && s.today === 49 && s.tonight === null;
  const kicker = lastDay ? HE.OMER_KICKER_LAST : s.isNight ? HE.OMER_KICKER_NIGHT : HE.OMER_KICKER_DAY;
  const note = lastDay ? HE.OMER_LAST_NOTE : HE.OMER_TO_SHAVUOT(50 - focus);
  const forgot = !s.isNight && s.today !== null && !log.counted.includes(s.today) ? s.today : null;

  return (
    <Page>
      <Hero>
        <Watermark aria-hidden><LineIcon name="sparkle" size={170} strokeWidth={1.1} /></Watermark>
        {header}{titles}
        <OmerHero kicker={kicker} day={focus} note={note} markDay={markDay}
          marked={markDay !== null && log.counted.includes(markDay)} streak={log.streak}
          onMark={() => { if (markDay !== null) log.toggle(markDay); }} />
      </Hero>
      {forgot !== null && (
        <Notice $tone="gold" role="note">
          <LineIcon name="info" size={20} />
          <span><strong>{HE.OMER_FORGOT_TITLE}</strong>{HE.OMER_FORGOT_BODY(forgot)}</span>
        </Notice>
      )}
      {log.gap !== null && <Notice $tone="muted" role="note"><LineIcon name="info" size={20} /><span>{HE.OMER_GAP(log.gap)}</span></Notice>}
      <OmerNusach day={focus} />
      <OmerGrid current={focus} counted={log.counted} selected={selected} onSelect={setSelected} />
    </Page>
  );
}
