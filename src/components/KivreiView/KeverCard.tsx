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
  border: 1px solid ${p => (p.$selected ? theme.colors.gold : theme.colors.borderLight)};
  border-radius: 18px;
  box-shadow: ${p => (p.$selected ? `0 0 0 3px color-mix(in srgb, ${theme.colors.gold} 25%, transparent), ${theme.shadows.md}` : theme.shadows.sm)};
  overflow: hidden;
  scroll-margin-top: calc(var(--header-h, 64px) + 12px);
  transition: border-color ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
`;

/* Photo banner with the name over a soft gradient — reads like a plaque. */
const Banner = styled.div<{ $photo: boolean }>`
  position: relative; aspect-ratio: ${p => (p.$photo ? '16 / 7' : '16 / 4')};
  background: ${theme.gilded.night};
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  &::after {
    content: ''; position: absolute; inset: 0; pointer-events: none;
    background: linear-gradient(to top, ${theme.onMedia.scrimStrong}, transparent 62%);
  }
`;

/* No photo: a quiet candle on the night surface keeps every card one shape. */
const Placeholder = styled.span`
  position: absolute; top: 50%; inset-inline-end: 18px; transform: translateY(-50%);
  color: ${theme.game.gold}; opacity: 0.55;
`;

const Plaque = styled.h3`
  position: absolute; z-index: 1; bottom: 10px; inset-inline-start: 14px; inset-inline-end: 14px;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 700; line-height: 1.2;
  color: ${theme.onMedia.ink}; text-shadow: ${theme.onMedia.textShadow};
`;

const Credit = styled.span`
  position: absolute; top: 6px; inset-inline-start: 10px; z-index: 1;
  font-size: 0.62rem; color: ${theme.onMedia.muted}; text-shadow: ${theme.onMedia.textShadow};
`;

const Body = styled.div`padding: ${theme.spacing.md}; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Top = styled.div`display: flex; align-items: flex-start; gap: ${theme.spacing.sm};`;
const Head = styled.button`flex: 1; min-width: 0; text-align: right; display: flex; flex-direction: column; gap: 3px;`;
const NameRow = styled.span`display: flex; align-items: baseline; gap: ${theme.spacing.sm}; flex-wrap: wrap;`;
const Distance = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondaryText}; font-variant-numeric: tabular-nums; white-space: nowrap;`;
const Actions = styled.div`display: flex; gap: 6px; flex-shrink: 0;`;

const Chips = styled.div`display: flex; flex-wrap: wrap; gap: 6px;`;
const Hilula = styled.span`
  display: inline-flex; align-items: center; gap: 4px;
  font-size: ${theme.fontSizes.xs}; font-weight: 700; padding: 4px 11px; border-radius: ${theme.radii.pill};
  color: ${theme.colors.secondaryText}; background: ${theme.colors.goldSoft};
  border: 1px solid color-mix(in srgb, ${theme.colors.gold} 45%, transparent);
`;

const RabbiLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 2px;
  font-size: ${theme.fontSizes.xs}; font-weight: 700; padding: 4px 11px; border-radius: ${theme.radii.pill};
  color: ${theme.colors.onPrimary}; background: ${theme.colors.primary};
`;

interface Props { k: Kever; selected: boolean; onSelect: () => void; }

const KeverCard = forwardRef<HTMLElement, Props>(function KeverCard({ k, selected, onSelect }, ref) {
  const [imgOk, setImgOk] = useState(true);
  const photo = Boolean(k.image) && imgOk;

  return (
    <Card ref={ref} $selected={selected} aria-current={selected || undefined}>
      <Banner $photo={photo}>
        {photo ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- remote Wikimedia thumbnail */}
            <img src={k.image!} alt={HE.KV_IMAGE_ALT(k.name)} loading="lazy" decoding="async"
              referrerPolicy="no-referrer" onError={() => setImgOk(false)} />
            <Credit>{HE.KV_PHOTO_CREDIT}</Credit>
          </>
        ) : <Placeholder aria-hidden="true"><LineIcon name="candle" size={34} strokeWidth={1.4} /></Placeholder>}
        <Plaque>{k.name}</Plaque>
      </Banner>
      <Body>
        <Top>
          <Head onClick={onSelect}>
            <NameRow><Distance>{HE.MN_DISTANCE(k.distanceM)}</Distance></NameRow>
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
            <RabbiLink href={`/rabbis?q=${encodeURIComponent(k.rabbi.name)}`}>{HE.KV_RABBI_CARD}<LineIcon name="chevron" size={14} strokeWidth={2.2} /></RabbiLink>
          </Chips>
        )}

        <KeverDetails k={k} />
      </Body>
    </Card>
  );
});

export default KeverCard;
