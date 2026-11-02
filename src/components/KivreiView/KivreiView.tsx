'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import ListState from '@/components/common/ListState';
import type { KivreiNearbyResponse } from '@/lib/kivrei/types';
import { KIVREI_DEFAULT_RADIUS_M, KIVREI_RADII_M } from '@/lib/kivrei/radius';
import { useNearbySearch } from '@/components/MinyanView/useMinyanSearch';
import LocatePanel from '@/components/MinyanView/LocatePanel';
import LocationBar from '@/components/MinyanView/LocationBar';
import { Panel, GhostBtn } from '@/components/MinyanView/minyanStyles';
import KivreiResults from './KivreiResults';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md}; max-width: 720px; margin: 0 auto; width: 100%;`;

const Title = styled.h1`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.h1}; color: ${theme.colors.primary};
  svg { color: ${theme.colors.secondary}; }
`;

const Subtitle = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Honesty = styled.p`
  font-size: ${theme.fontSizes.xs}; line-height: 1.6; color: ${theme.colors.textMuted};
  background: ${theme.colors.bgWarning}; border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const Notice = styled(Panel)`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm}; text-align: center;`;

export default function KivreiView() {
  const { phase, origin, radius, data, locate, searchAt, changeRadius, retry } =
    useNearbySearch<KivreiNearbyResponse>('/api/kivrei/nearby', KIVREI_DEFAULT_RADIUS_M);

  const body = () => {
    if (!origin) return <LocatePanel phase={phase} onLocate={locate} onPick={searchAt} cta={[HE.KV_CTA_TITLE, HE.KV_CTA_SUB]} />;
    if (phase === 'loading' || (phase === 'locating' && !data)) {
      return <ListState loading error={false} emptyText="" onRetry={retry} />;
    }
    if (phase === 'error' || phase === 'rate-limited') {
      return (
        <Notice role="alert">
          <strong>{phase === 'error' ? HE.KV_ERROR_TITLE : HE.MN_RATE_LIMITED}</strong>
          <GhostBtn onClick={retry}>{HE.MN_RETRY}</GhostBtn>
        </Notice>
      );
    }
    return data && <KivreiResults data={data} origin={origin} />;
  };

  return (
    <Page>
      <header>
        <Title><LineIcon name="tomb" size={28} /> {HE.KV_TITLE}</Title>
        <Subtitle>{HE.KV_SUBTITLE}</Subtitle>
      </header>
      <Honesty>{HE.KV_HONESTY}</Honesty>
      {origin && (
        <LocationBar origin={origin} phase={phase} radius={radius} radii={KIVREI_RADII_M}
          onLocate={locate} onPick={searchAt} onRadius={changeRadius} />
      )}
      {body()}
    </Page>
  );
}
