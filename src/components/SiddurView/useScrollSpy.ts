'use client';

import { useEffect, useState, RefObject } from 'react';

/**
 * Tracks which section heading the reader is in and how far through the
 * service they are. Measures the sticky bar so anchors land just below it
 * (published as --siddur-offset for scroll-margin-top).
 */
export function useScrollSpy(ids: string[], rootRef: RefObject<HTMLElement>, barRef: RefObject<HTMLElement>) {
  const [active, setActive] = useState(ids[0] ?? '');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const root = rootRef.current;
    const bar = barRef.current;
    if (!root || !bar) return;

    let offset = 0;
    const measure = () => {
      const stickyTop = parseFloat(getComputedStyle(bar).top) || 0;
      offset = stickyTop + bar.offsetHeight + 8;
      root.style.setProperty('--siddur-offset', `${offset}px`);
    };

    let frame = 0;
    const update = () => {
      frame = 0;
      let current = ids[0] ?? '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - offset <= 1) current = id;
      }
      setActive(current);
      const rect = root.getBoundingClientRect();
      const span = rect.height - window.innerHeight + offset;
      setProgress(span > 0 ? Math.min(1, Math.max(0, (offset - rect.top) / span)) : 0);
    };
    const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };

    measure();
    update();
    const ro = new ResizeObserver(() => { measure(); onScroll(); });
    ro.observe(bar);
    ro.observe(root);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [ids, rootRef, barRef]);

  return { active, progress };
}

/** Smooth-scrolls to an anchor (instant under reduced motion) and records it in the URL. */
export function jumpTo(id: string, smooth = true) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  el.scrollIntoView({ behavior: smooth && !reduce ? 'smooth' : 'auto', block: 'start' });
  history.replaceState(null, '', `#${id}`);
}
