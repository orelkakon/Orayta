'use client';

import { useEffect, useState } from 'react';
import type { AudienceStats } from '@/types/audience';
import AdminDevicesCard from './AdminDevicesCard';
import AdminSourcesCard from './AdminSourcesCard';

/** New vs returning + traffic sources — one fetch for both cards. */
export default function AdminAudience() {
  const [s, setS] = useState<AudienceStats | null>(null);

  useEffect(() => {
    fetch('/api/admin/audience')
      .then(r => (r.ok ? r.json() as Promise<AudienceStats> : null))
      .then(setS)
      .catch(() => setS(null));
  }, []);

  if (!s) return null;
  return (
    <>
      <AdminDevicesCard d={s.devices} />
      <AdminSourcesCard s={s.sources} />
    </>
  );
}
