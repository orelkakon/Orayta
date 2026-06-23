'use client';

import { useEffect } from 'react';

export default function VisitTracker() {
  useEffect(() => {
    void fetch('/api/visits', { method: 'POST' });
  }, []);
  return null;
}
