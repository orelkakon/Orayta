'use client';

import { useEffect, useState } from 'react';
import { onOpenInterests } from '@/lib/interests';
import InterestsSheet from './InterestsSheet';
import { useInterests } from './useInterests';

/** Mounted once in ClientProviders: opens the interests sheet from anywhere (openInterests()). */
export default function InterestsHost() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { prefs } = useInterests();
  useEffect(() => onOpenInterests(() => { setMounted(true); setOpen(true); }), []);
  return mounted ? <InterestsSheet open={open} picked={prefs.picked} onClose={() => setOpen(false)} /> : null;
}
