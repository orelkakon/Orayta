'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import ListState from '@/components/common/ListState';
import type { MikvehNearbyResponse } from '@/types/mikveh';
import { MIKVEH_DEFAULT_RADIUS_M, MIKVEH_RADII_M } from '@/lib/mikveh/radius';
import { useNearbySearch } from '@/components/MinyanView/useMinyanSearch';
import LocatePanel from '@/components/MinyanView/LocatePanel';
import LocationBar from '@/components/MinyanView/LocationBar';
import { Panel, GhostBtn } from '@/components/MinyanView/minyanStyles';
import MikvehResults from './MikvehResults';

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

export default function MikvehView() {
  const { phase, origin, radius, data, locate, searchAt, changeRadius, retry } =
    useNearbySearch<MikvehNearbyResponse>('/api/mikveh/nearby', MIKVEH_DEFAULT_RADIUS_M);

  const body = () => {
    if (!origin) return <LocatePanel phase={phase} onLocate={locate} onPick={searchAt} cta={[HE.MK_CTA_TITLE, HE.MK_CTA_SUB]} />;
    if (phase === 'loading' || (phase === 'locating' && !data)) {
      return <ListState loading error={false} emptyText="" onRetry={retry} />;
    }
    if (phase === 'error' || phase === 'rate-limited') {
      return (
        <Notice role="alert">
          <strong>{phase === 'error' ? HE.MK_ERROR_TITLE : HE.MN_RATE_LIMITED}</strong>
          <GhostBtn onClick={retry}>{HE.MN_RETRY}</GhostBtn>
        </Notice>
      );
    }
    return data && <MikvehResults data={data} origin={origin} />;
  };

  return (
    <Page>
      <header>
        <Title><LineIcon name="droplet" size={28} /> {HE.MK_TITLE}</Title>
        <Subtitle>{HE.MK_SUBTITLE}</Subtitle>
      </header>
      <Honesty>{HE.MK_HONESTY}</Honesty>
      {origin && (
        <LocationBar origin={origin} phase={phase} radius={radius} radii={MIKVEH_RADII_M}
          onLocate={locate} onPick={searchAt} onRadius={changeRadius} />
      )}
      {body()}
    </Page>
  );
}
