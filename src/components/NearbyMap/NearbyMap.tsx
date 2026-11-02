'use client';

import dynamic from 'next/dynamic';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

export type { MapPoint } from './NearbyMapInner';

const MapLoading = styled.div`
  height: clamp(240px, 42svh, 400px); display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.textMuted}; border: 1px solid ${theme.colors.border}; border-radius: ${theme.radii.lg};
`;

/** Leaflet touches `window` — the map is client-only. */
const NearbyMap = dynamic(() => import('./NearbyMapInner'), {
  ssr: false,
  loading: () => <MapLoading>{HE.LOADING}</MapLoading>,
});

export default NearbyMap;
