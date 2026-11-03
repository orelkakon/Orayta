'use client';

import { HE } from '@/lib/hebrewTexts';
import type { KivreiNearbyResponse } from '@/lib/kivrei/types';
import { KIVREI_DEFAULT_RADIUS_M, KIVREI_RADII_M } from '@/lib/kivrei/radius';
import { useNearbySearch } from '@/components/MinyanView/useMinyanSearch';
import NearbyShell from '@/components/Nearby/NearbyShell';
import KivreiResults from './KivreiResults';

export default function KivreiView() {
  const search = useNearbySearch<KivreiNearbyResponse>('/api/kivrei/nearby', KIVREI_DEFAULT_RADIUS_M);
  return (
    <NearbyShell
      icon="tomb" title={HE.KV_TITLE} subtitle={HE.KV_SUBTITLE} honesty={HE.KV_HONESTY}
      href="/kivrei" search={search} radii={KIVREI_RADII_M} cta={[HE.KV_CTA_TITLE, HE.KV_CTA_SUB]}
      errorTitle={HE.KV_ERROR_TITLE}
    >
      {(data, origin, _radius, refreshing) => <KivreiResults data={data} origin={origin} refreshing={refreshing} />}
    </NearbyShell>
  );
}
