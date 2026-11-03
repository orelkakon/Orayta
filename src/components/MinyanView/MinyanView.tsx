'use client';

import { HE } from '@/lib/hebrewTexts';
import NearbyShell from '@/components/Nearby/NearbyShell';
import { useMinyanSearch } from './useMinyanSearch';
import MinyanResults from './MinyanResults';

export default function MinyanView() {
  const search = useMinyanSearch();
  return (
    <NearbyShell
      icon="synagogue" title={HE.MN_TITLE} subtitle={HE.MN_SUBTITLE} honesty={HE.MN_HONESTY}
      href="/minyan" search={search} errorTitle={HE.MN_ERROR_TITLE} errorSub={HE.MN_ERROR_SUB}
    >
      {(data, origin, radius, refreshing) => (
        <MinyanResults data={data} origin={origin} radius={radius} refreshing={refreshing} />
      )}
    </NearbyShell>
  );
}
