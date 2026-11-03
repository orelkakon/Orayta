'use client';

import { HE } from '@/lib/hebrewTexts';
import type { MikvehNearbyResponse } from '@/types/mikveh';
import { MIKVEH_DEFAULT_RADIUS_M, MIKVEH_RADII_M } from '@/lib/mikveh/radius';
import { useNearbySearch } from '@/components/MinyanView/useMinyanSearch';
import NearbyShell from '@/components/Nearby/NearbyShell';
import MikvehResults from './MikvehResults';

export default function MikvehView() {
  const search = useNearbySearch<MikvehNearbyResponse>('/api/mikveh/nearby', MIKVEH_DEFAULT_RADIUS_M);
  return (
    <NearbyShell
      icon="droplet" title={HE.MK_TITLE} subtitle={HE.MK_SUBTITLE} honesty={HE.MK_HONESTY}
      href="/mikveh" search={search} radii={MIKVEH_RADII_M} cta={[HE.MK_CTA_TITLE, HE.MK_CTA_SUB]}
      errorTitle={HE.MK_ERROR_TITLE}
    >
      {(data, origin, _radius, refreshing) => <MikvehResults data={data} origin={origin} refreshing={refreshing} />}
    </NearbyShell>
  );
}
