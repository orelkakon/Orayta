'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { Synagogue } from '@/types/minyan';
import { googleMapsUrl, wazeUrl, telHref } from '@/lib/minyan/geo';
import ReliabilityBadge from './ReliabilityBadge';
import ScheduleBlock from './ScheduleBlock';
import SourcesLine from './SourcesLine';
import { GoogleMapsIcon, WazeIcon } from './BrandIcons';
import { LEVEL_COLOR, IconAction, Muted } from './minyanStyles';

const Card = styled.article<{ $selected: boolean; $c: string }>`
  background: ${theme.colors.surface};
  border: 1.5px solid ${p => (p.$selected ? theme.colors.primary : theme.colors.borderLight)};
  border-inline-start: 4px solid ${p => p.$c};
  border-radius: ${theme.radii.lg};
  box-shadow: ${p => (p.$selected ? theme.shadows.md : theme.shadows.sm)};
  padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  scroll-margin-top: 80px;
  transition: border-color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
`;

/* Details on the start side, compact icon actions on the end side. */
const Top = styled.div`display: flex; align-items: flex-start; gap: ${theme.spacing.sm};`;

const Head = styled.button`
  flex: 1; min-width: 0; text-align: right;
  display: flex; flex-direction: column; gap: 2px;
`;

const NameRow = styled.span`display: flex; align-items: baseline; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

const Name = styled.h3`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800;
  color: ${theme.colors.primary}; line-height: 1.3;
`;

const Distance = styled.span`
  font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.secondary};
  font-variant-numeric: tabular-nums; white-space: nowrap;
`;

const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0;`;

const Contact = styled.p`
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text}; line-height: 1.6;
  a { color: ${theme.colors.primary}; font-weight: 700; direction: ltr; unicode-bidi: isolate; }
`;

interface Props { s: Synagogue; selected: boolean; onSelect: () => void; }

const SynagogueCard = forwardRef<HTMLElement, Props>(function SynagogueCard({ s, selected, onSelect }, ref) {
  const name = s.name ?? HE.MN_UNNAMED;
  const callHref = s.phone ? telHref(s.phone.value) : null;
  const gabbaiHref = s.gabbai?.phone ? telHref(s.gabbai.phone) : null;

  return (
    <Card ref={ref} $selected={selected} $c={LEVEL_COLOR[s.existence.level]} aria-current={selected || undefined}>
      <Top>
        <Head onClick={onSelect}>
          <NameRow><Name>{name}</Name><Distance>{HE.MN_DISTANCE(s.distanceM)}</Distance></NameRow>
          {s.address && <Muted>{s.address}</Muted>}
          {s.nusach && <Muted>{HE.MN_NUSACH(s.nusach)}</Muted>}
        </Head>
        <Actions>
          <IconAction href={googleMapsUrl(s.lat, s.lng)} target="_blank" rel="noopener noreferrer"
            aria-label={`${HE.MN_NAV_GOOGLE} — ${name}`} title={HE.MN_NAV_GOOGLE}>
            <GoogleMapsIcon size={22} />
          </IconAction>
          <IconAction href={wazeUrl(s.lat, s.lng)} target="_blank" rel="noopener noreferrer"
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

      <ReliabilityBadge label={HE.MN_EXIST_LABEL} r={s.existence} />
      <ScheduleBlock schedules={s.schedules} reliability={s.schedule} />

      {(s.phone || s.gabbai) && (
        <Contact>
          {s.phone && <>{HE.MN_PHONE}: <a href={callHref ?? undefined}>{s.phone.value}</a> <Muted>{HE.MN_VIA(HE.MN_PROVIDERS[s.phone.provider])}</Muted></>}
          {s.phone && s.gabbai && <br />}
          {s.gabbai && (
            <>
              {HE.MN_GABBAI}{s.gabbai.name ? `: ${s.gabbai.name}` : ''}
              {s.gabbai.phone && <> · <a href={gabbaiHref ?? undefined}>{s.gabbai.phone}</a></>}
              {' '}<Muted>{HE.MN_VIA(HE.MN_PROVIDERS[s.gabbai.provider])}</Muted>
            </>
          )}
        </Contact>
      )}
      {s.website && <Contact><a href={s.website} target="_blank" rel="noopener noreferrer">{HE.MN_WEBSITE} ↗</a></Contact>}
      <SourcesLine sources={s.sources} />
    </Card>
  );
});

export default SynagogueCard;
