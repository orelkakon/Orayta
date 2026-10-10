'use client';

import { forwardRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { MinyanTime, Synagogue } from '@/types/minyan';
import { googleMapsUrl, wazeUrl, telHref, nextPrayer } from '@/lib/minyan/geo';
import { StatusBadge } from './ConfidenceBadge';
import ScheduleList from './ScheduleList';
import { STATUS_COLOR, ActionLink, GhostBtn, Muted } from './minyanStyles';

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

const Head = styled.button`
  display: flex; align-items: flex-start; justify-content: space-between; gap: ${theme.spacing.sm};
  text-align: right; width: 100%;
`;

const Name = styled.h3`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800;
  color: ${theme.colors.primary}; line-height: 1.3;
`;

const Distance = styled.span`
  flex-shrink: 0; font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.secondary};
  font-variant-numeric: tabular-nums;
`;

const Row = styled.div`display: flex; align-items: center; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const Next = styled.div`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.success};
  background: ${theme.colors.bgSuccess}; border-radius: ${theme.radii.sm}; padding: 6px ${theme.spacing.sm};
`;

const Note = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.5;`;

const Contact = styled.div`
  display: flex; flex-direction: column; gap: 2px;
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.text};
  a { color: ${theme.colors.primary}; font-weight: 700; direction: ltr; unicode-bidi: isolate; }
`;

const Actions = styled.div`display: flex; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;

interface Props {
  s: Synagogue;
  now: Date;
  selected: boolean;
  isAdmin: boolean;
  onSelect: () => void;
  onReport: () => void;
  onPickTime: (t: MinyanTime) => void;
  onEditGabbai: () => void;
}

const SynagogueCard = forwardRef<HTMLElement, Props>(function SynagogueCard(
  { s, now, selected, isAdmin, onSelect, onReport, onPickTime, onEditGabbai }, ref,
) {
  const next = nextPrayer(s.times, now);
  const callPhone = s.gabbai?.phone ?? s.phone;
  const callHref = callPhone ? telHref(callPhone) : null;

  return (
    <Card ref={ref} $selected={selected} $c={STATUS_COLOR[s.status]} aria-current={selected || undefined}>
      <Head onClick={onSelect} aria-label={s.name ?? HE.MN_UNNAMED}>
        <div>
          <Name>{s.name ?? HE.MN_UNNAMED}</Name>
          {s.address && <Muted>{s.address}</Muted>}
        </div>
        <Distance>{HE.MN_DISTANCE(s.distanceM)}</Distance>
      </Head>

      <Row><StatusBadge status={s.status} /></Row>
      {next && <Next>{HE.MN_NEXT(HE.MN_SERVICES[next.service], next.time, next.minutesUntil)}</Next>}

      {s.times.length > 0
        ? <ScheduleList times={s.times} now={now} onPick={onPickTime} />
        : <Note>{HE.MN_UNKNOWN_NOTE}</Note>}
      {s.osmServiceTimes && <Note>{HE.MN_OSM_TIMES} <span dir="auto">{s.osmServiceTimes}</span></Note>}

      {(s.gabbai || s.phone) && (
        <Contact>
          {s.gabbai && (
            <span>
              {HE.MN_GABBAI}{s.gabbai.name ? `: ${s.gabbai.name}` : ''}
              {s.gabbai.phone && <> · <a href={telHref(s.gabbai.phone) ?? undefined}>{s.gabbai.phone}</a></>}
              {' '}<Muted>({HE.MN_GABBAI_VERIFIED})</Muted>
            </span>
          )}
          {s.phone && <span>{HE.MN_PHONE_OSM}: <a href={telHref(s.phone) ?? undefined}>{s.phone}</a></span>}
        </Contact>
      )}

      <Actions>
        <ActionLink href={googleMapsUrl(s.lat, s.lng)} target="_blank" rel="noopener noreferrer">
          <LineIcon name="pin" size={16} />{HE.MN_NAV_GOOGLE}
        </ActionLink>
        <ActionLink href={wazeUrl(s.lat, s.lng)} target="_blank" rel="noopener noreferrer">
          <LineIcon name="pin" size={16} />{HE.MN_NAV_WAZE}
        </ActionLink>
        {callHref && <ActionLink href={callHref}><LineIcon name="phone" size={16} />{HE.MN_CALL}</ActionLink>}
      </Actions>
      <Actions>
        <GhostBtn onClick={onReport}>{HE.MN_REPORT_BTN}</GhostBtn>
        {s.website && (
          <GhostBtn as="a" href={s.website} target="_blank" rel="noopener noreferrer">{HE.MN_WEBSITE}</GhostBtn>
        )}
        {isAdmin && <GhostBtn onClick={onEditGabbai}>{HE.MN_GABBAI_EDIT}</GhostBtn>}
      </Actions>
    </Card>
  );
});

export default SynagogueCard;
