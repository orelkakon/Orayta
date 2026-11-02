'use client';

import { forwardRef, useState } from 'react';
import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Kever } from '@/lib/kivrei/types';
import { googleMapsUrl, wazeUrl } from '@/lib/minyan/geo';
import { LineIcon } from '@/components/common/LineIcons';
import { GoogleMapsIcon, WazeIcon } from '@/components/MinyanView/BrandIcons';
import { IconAction, Muted } from '@/components/MinyanView/minyanStyles';
import KeverDetails from './KeverDetails';

const Card = styled.article<{ $selected: boolean }>`
  background: ${theme.colors.surface};
  border: 1.5px solid ${p => (p.$selected ? theme.colors.primary : theme.colors.borderLight)};
  border-radius: ${theme.radii.lg};
  box-shadow: ${p => (p.$selected ? theme.shadows.md : theme.shadows.sm)};
  overflow: hidden;
  scroll-margin-top: calc(var(--header-h, 64px) + 12px);
  transition: border-color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
`;

/* Photo banner with the name over a soft gradient — reads like a plaque. */
const Banner = styled.div`
  position: relative; aspect-ratio: 16 / 7; background: ${theme.colors.surfaceAlt};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  &::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to top, rgba(20, 14, 8, 0.55), transparent 55%);
  }
`;

const Credit = styled.span`
  position: absolute; bottom: 6px; inset-inline-start: 10px; z-index: 1;
  font-size: 0.62rem; color: rgba(255, 255, 255, 0.85);
`;

const Body = styled.div`padding: ${theme.spacing.md}; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Top = styled.div`display: flex; align-items: flex-start; gap: ${theme.spacing.sm};`;
const Head = styled.button`flex: 1; min-width: 0; text-align: right; display: flex; flex-direction: column; gap: 3px;`;
const NameRow = styled.span`display: flex; align-items: baseline; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Name = styled.h3`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${theme.colors.primary}; line-height: 1.3;`;
const Distance = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.secondary}; font-variant-numeric: tabular-nums; white-space: nowrap;`;
const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0;`;

const Chips = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;
const Hilula = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: ${theme.fontSizes.xs}; font-weight: 700; padding: 3px 10px; border-radius: ${theme.radii.xl};
  color: ${theme.colors.primary}; background: color-mix(in srgb, ${theme.colors.secondary} 18%, ${theme.colors.surface});
  border: 1px solid color-mix(in srgb, ${theme.colors.secondary} 55%, transparent);
`;

const RabbiLink = styled(Link)`
  font-size: ${theme.fontSizes.xs}; font-weight: 700; padding: 3px 10px; border-radius: ${theme.radii.xl};
  color: ${theme.colors.onPrimary}; background: ${theme.colors.primary};
  &:hover { background: ${theme.colors.primaryLight}; }
`;

interface Props { k: Kever; selected: boolean; onSelect: () => void; }

const KeverCard = forwardRef<HTMLElement, Props>(function KeverCard({ k, selected, onSelect }, ref) {
  const [imgOk, setImgOk] = useState(true);

  return (
    <Card ref={ref} $selected={selected} aria-current={selected || undefined}>
      {k.image && imgOk && (
        <Banner>
          {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia thumbnail */}
          <img src={k.image} alt={HE.KV_IMAGE_ALT(k.name)} loading="lazy" decoding="async"
            referrerPolicy="no-referrer" onError={() => setImgOk(false)} />
          <Credit>{HE.KV_PHOTO_CREDIT}</Credit>
        </Banner>
      )}
      <Body>
        <Top>
          <Head onClick={onSelect}>
            <NameRow><Name>{k.name}</Name><Distance>{HE.MN_DISTANCE(k.distanceM)}</Distance></NameRow>
            {k.rabbi?.datePeriod && <Muted>{HE.KV_PERIOD(k.rabbi.datePeriod)}</Muted>}
          </Head>
          <Actions>
            <IconAction href={googleMapsUrl(k.lat, k.lng)} target="_blank" rel="noopener noreferrer"
              aria-label={`${HE.MN_NAV_GOOGLE} — ${k.name}`} title={HE.MN_NAV_GOOGLE}>
              <GoogleMapsIcon size={22} />
            </IconAction>
            <IconAction href={wazeUrl(k.lat, k.lng)} target="_blank" rel="noopener noreferrer"
              aria-label={`${HE.MN_NAV_WAZE} — ${k.name}`} title={HE.MN_NAV_WAZE}>
              <WazeIcon size={24} />
            </IconAction>
          </Actions>
        </Top>

        {k.rabbi && (
          <Chips>
            {k.rabbi.deathDate && <Hilula><LineIcon name="candle" size={13} /> {HE.KV_HILULA(k.rabbi.deathDate)}</Hilula>}
            <RabbiLink href={`/rabbis?q=${encodeURIComponent(k.rabbi.name)}`}>{HE.KV_RABBI_CARD} ←</RabbiLink>
          </Chips>
        )}

        <KeverDetails k={k} />
      </Body>
    </Card>
  );
});

export default KeverCard;
