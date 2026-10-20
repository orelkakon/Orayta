'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ServiceId, SiddurServiceText } from '@/lib/siddur';

type Status = 'loading' | 'ready' | 'error';

/** One request per service: all its Sefaria nodes, assembled by our API. */
export function useServiceText(id: ServiceId) {
  const [data, setData] = useState<SiddurServiceText | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      const res = await fetch(`/api/siddur/${id}`);
      if (!res.ok) throw new Error(String(res.status));
      const body = await res.json() as SiddurServiceText;
      setData(body);
      setStatus(Object.keys(body.nodes).length > 0 ? 'ready' : 'error');
    } catch {
      setStatus('error');
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  return { nodes: data?.nodes ?? {}, failed: data?.failed ?? [], status, reload: load };
}
