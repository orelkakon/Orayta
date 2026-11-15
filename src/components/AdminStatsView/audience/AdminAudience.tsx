'use client';

import { useEffect, useState } from 'react';
import { HE } from '@/lib/hebrewTexts';
import type { AudienceStats } from '@/types/audience';
import { Card, CardTitle } from './audienceStyles';
import { ErrorNote } from '../nearby/nearbyStyles';
import AdminDevicesCard from './AdminDevicesCard';
import AdminSourcesCard from './AdminSourcesCard';

/** New vs returning + traffic sources — one fetch for both cards. */
export default function AdminAudience() {
  const [s, setS] = useState<AudienceStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/audience')
      .then(r => (r.ok ? r.json() as Promise<AudienceStats> : Promise.reject(new Error(String(r.status)))))
      .then(setS)
      .catch(() => setFailed(true));
  }, []);

  if (failed) {
    return (
      <Card>
        <CardTitle>{HE.DEV_TITLE} · {HE.SRC_TITLE}</CardTitle>
        <ErrorNote>{HE.AUD_ERROR}</ErrorNote>
      </Card>
    );
  }
  if (!s) return null;
  return (
    <>
      <AdminDevicesCard d={s.devices} />
      <AdminSourcesCard s={s.sources} />
    </>
  );
}
