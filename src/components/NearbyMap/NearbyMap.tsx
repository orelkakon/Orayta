'use client';

import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { HE } from '@/lib/hebrewTexts';
import { Skeleton } from '@/components/ui/Skeleton';

export type { MapPoint } from './NearbyMapInner';

const MapLoading = styled(Skeleton)`
  height: var(--map-h, clamp(260px, 44svh, 420px)); border-radius: 20px;
`;

/** Leaflet touches `window` — the map is client-only. */
const NearbyMap = dynamic(() => import('./NearbyMapInner'), {
  ssr: false,
  loading: () => <MapLoading aria-label={HE.LOADING} />,
});

export default NearbyMap;
