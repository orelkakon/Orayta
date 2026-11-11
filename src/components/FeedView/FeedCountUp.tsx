'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * A gematria value that counts up from zero each time its slide arrives
 * (ease-out, ~1.1s), and rests on the final number otherwise — including
 * under reduced motion.
 */
export default function FeedCountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(value);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const obs = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf);
      if (!e.isIntersecting) { setShown(0); return; }
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, Math.max(0, t - t0 - 250) / 1100);
        setShown(Math.round(value * (1 - Math.pow(1 - k, 3))));
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }, { threshold: 0.6 });
    obs.observe(el);
    return () => { obs.disconnect(); cancelAnimationFrame(raf); };
  }, [value]);

  return <span ref={ref}>{shown}</span>;
}
