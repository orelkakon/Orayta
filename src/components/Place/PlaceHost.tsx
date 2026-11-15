'use client';

import { useEffect, useState } from 'react';
import { onOpenPlacePicker } from '@/lib/myPlace';
import PlaceSheet from './PlaceSheet';
import { useMyPlace } from './useMyPlace';

/** Mounted once in ClientProviders: opens the place picker from anywhere (openPlacePicker()). */
export default function PlaceHost() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { place } = useMyPlace();

  useEffect(() => onOpenPlacePicker(() => { setMounted(true); setOpen(true); }), []);

  return mounted ? <PlaceSheet open={open} current={place} onClose={() => setOpen(false)} /> : null;
}
