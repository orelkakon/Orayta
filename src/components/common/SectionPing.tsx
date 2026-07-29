'use client';

import { useEffect } from 'react';
import { trackDaily, trackSession, TrackMetric } from '@/lib/track';

/** Counts one section entry per browsing session (and a daily-user ping for
 *  pages like the feed that render outside AppLayout). */
export default function SectionPing({ metric }: { metric: TrackMetric }) {
  useEffect(() => {
    trackSession(metric);
    trackDaily('users');
  }, [metric]);
  return null;
}
