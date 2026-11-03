'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { Mikveh } from '@/types/mikveh';
import { googleMapsUrl, wazeUrl, telHref } from '@/lib/minyan/geo';
import { formatSourceDate } from '@/lib/minyan/format';
import { mikvehTone } from '@/lib/mikveh/filter';
import { GoogleMapsIcon, WazeIcon } from '@/components/MinyanView/BrandIcons';
import { IconAction, Muted } from '@/components/MinyanView/minyanStyles';
import MikvehHours from './MikvehHours';
import MikvehFacts from './MikvehFacts';
import Disclosure from '@/components/Nearby/Disclosure';

const TONE_COLOR = {
  women: theme.colors.accent, men: theme.colors.primary, both: theme.colors.success, unknown: theme.colors.border,
};


const Card = styled.article<{ $selected: boolean; $c: string }>`
  background: ${theme.colors.surface};
  border: 1px solid ${p => (p.$selected ? theme.colors.gold : theme.colors.borderLight)};
  border-inline-start: 4px solid ${p => p.$c};
  border-radius: 18px;
  box-shadow: ${p => (p.$selected ? `0 0 0 3px color-mix(in srgb, ${theme.colors.gold} 25%, transparent), ${theme.shadows.md}` : theme.shadows.sm)};
  padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  scroll-margin-top: calc(var(--header-h, 64px) + 12px);
  transition: border-color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
`;

const Top = styled.div`display: flex; align-items: flex-start; gap: ${theme.spacing.sm};`;
const Head = styled.button`flex: 1; min-width: 0; text-align: right; display: flex; flex-direction: column; gap: 2px;`;
const NameRow = styled.span`display: flex; align-items: baseline; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Name = styled.h3`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text}; line-height: 1.3;`;
const Distance = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondaryText}; font-variant-numeric: tabular-nums; white-space: nowrap;`;
const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0;`;

const Approx = styled.span`
  display: inline-flex; align-items: center; gap: 4px; align-self: flex-start;
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.text};
  background: ${theme.colors.bgWarning}; border-radius: ${theme.radii.pill}; padding: 3px 10px;
`;

const Phone = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text};
  a { color: ${theme.colors.primary}; font-weight: 700; direction: ltr; unicode-bidi: isolate; }
`;

const Sources = styled.p`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.6;
  a { color: ${theme.colors.primaryLight}; text-decoration: underline; text-underline-offset: 2px; }
`;

interface Props { m: Mikveh; selected: boolean; onSelect: () => void; }

const MikvehCard = forwardRef<HTMLElement, Props>(function MikvehCard({ m, selected, onSelect }, ref) {
  const name = m.name && m.name !== m.city ? m.name : `${HE.MK_UNNAMED}${m.city ? ` ${m.city}` : ''}`;
  const callHref = m.phone ? telHref(m.phone) : null;
  const where = [m.address, m.city].filter(Boolean).join(', ');
  const approx = HE.MK_PRECISION[m.precision];

  return (
    <Card ref={ref} $selected={selected} $c={TONE_COLOR[mikvehTone(m)]} aria-current={selected || undefined}>
      <Top>
        <Head onClick={onSelect}>
          <NameRow><Name>{name}</Name><Distance>{m.precision === 'city' ? '~' : ''}{HE.MN_DISTANCE(m.distanceM)}</Distance></NameRow>
          {where && <Muted>{where}</Muted>}
        </Head>
        <Actions>
          <IconAction href={googleMapsUrl(m.lat, m.lng)} target="_blank" rel="noopener noreferrer"
            aria-label={`${HE.MN_NAV_GOOGLE} — ${name}`} title={HE.MN_NAV_GOOGLE}>
            <GoogleMapsIcon size={22} />
          </IconAction>
          <IconAction href={wazeUrl(m.lat, m.lng)} target="_blank" rel="noopener noreferrer"
            aria-label={`${HE.MN_NAV_WAZE} — ${name}`} title={HE.MN_NAV_WAZE}>
            <WazeIcon size={24} />
          </IconAction>
          {callHref && (
            <IconAction href={callHref} aria-label={`${HE.MN_CALL} — ${name}`} title={HE.MN_CALL}>
              <LineIcon name="phone" size={19} />
            </IconAction>
          )}
        </Actions>
      </Top>

      {approx && <Approx><LineIcon name="pin" size={13} /> {approx}</Approx>}
      <MikvehFacts m={m} />
      <MikvehHours hours={m.hours} />
      <Disclosure label={HE.NB_DETAILS}>
      {m.phone && <Phone>{HE.MN_PHONE}: <a href={callHref ?? undefined}>{m.phone}</a></Phone>}
      {m.website && <Phone><a href={m.website} target="_blank" rel="noopener noreferrer">{HE.MN_WEBSITE} ↗</a></Phone>}
      <Sources>
        {HE.MK_SOURCES}:{' '}
        {m.sources.map((s, i) => {
          const date = formatSourceDate(s.updatedAt);
          const label = HE.MK_SOURCE_NAMES[s.source];
          return (
            <span key={s.source}>
              {i > 0 && ' · '}
              {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{label}</a> : label}
              {date ? ` (${HE.MN_UPDATED(date)})` : ''}
            </span>
          );
        })}
      </Sources>
      </Disclosure>
    </Card>
  );
});

export default MikvehCard;
