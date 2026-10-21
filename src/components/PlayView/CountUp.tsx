'use client';

import { useEffect, useRef, useState } from 'react';

/** Number that rolls up to its value (ease-out); instant for reduced motion. */
export default function CountUp({ value, from = 0, ms = 900, format = (n: number) => n.toLocaleString('he-IL') }: {
  value: number; from?: number; ms?: number; format?: (n: number) => string;
}) {
  const [shown, setShown] = useState(from);
  const start = useRef(from);
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setShown(value); return; }
    const t0 = performance.now();
    const a = start.current;
    let raf = 0;
    const loop = (t: number) => {
      const k = Math.min(1, (t - t0) / ms);
      const eased = 1 - (1 - k) ** 3;
      setShown(Math.round(a + (value - a) * eased));
      if (k < 1) raf = requestAnimationFrame(loop);
      else start.current = value;
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [value, ms]);
  return <>{format(shown)}</>;
}
