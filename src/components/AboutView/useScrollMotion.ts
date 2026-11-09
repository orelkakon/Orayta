'use client';

import { RefObject, useEffect, useState } from 'react';

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Writes the element's progress through the viewport to `--p` (0 when its top
 * reaches `start` of the screen height, 1 when its bottom reaches `end`) on
 * every frame it moves — a CSS variable, so scrolling never re-renders React.
 * Reduced motion pins it at 1 (everything shown, nothing scrubbed).
 */
export function useScrollVar(ref: RefObject<HTMLElement>, start = 0.85, end = 0.55): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced()) { el.style.setProperty('--p', '1'); return; }
    let frame = 0;
    const update = () => {
      frame = 0;
      const r = el.getBoundingClientRect();
      const h = window.innerHeight;
      const from = h * start;
      const to = h * end - r.height;
      const p = Math.min(1, Math.max(0, (from - r.top) / Math.max(1, from - to)));
      el.style.setProperty('--p', p.toFixed(4));
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ref, start, end]);
}

/** True once the element has come into view (stays true). */
export function useInView(ref: RefObject<HTMLElement>, margin = '0px 0px -12% 0px'): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === 'undefined') { setSeen(true); return; }
    const io = new IntersectionObserver(entries => {
      if (entries.some(e => e.isIntersecting)) { setSeen(true); io.disconnect(); }
    }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, seen]);
  return seen;
}
