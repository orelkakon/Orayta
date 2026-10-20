'use client';

import { useEffect, useState } from 'react';

// Reading scale for the prayer text, remembered per device.
const KEY = 'orayta_siddur_font';
const STEPS = [1, 1.1, 1.22, 1.36, 1.5, 1.7];
const DEFAULT = 2;

export function useSiddurFont() {
  const [step, setStep] = useState(DEFAULT);

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(KEY));
      if (Number.isInteger(saved) && saved >= 0 && saved < STEPS.length) setStep(saved);
    } catch {}
  }, []);

  const change = (delta: number) => setStep(prev => {
    const next = Math.min(STEPS.length - 1, Math.max(0, prev + delta));
    try { localStorage.setItem(KEY, String(next)); } catch {}
    return next;
  });

  return {
    scale: STEPS[step],
    canShrink: step > 0,
    canGrow: step < STEPS.length - 1,
    smaller: () => change(-1),
    larger: () => change(1),
  };
}
