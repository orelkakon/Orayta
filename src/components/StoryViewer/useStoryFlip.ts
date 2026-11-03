import { RefObject, useCallback, useLayoutEffect } from 'react';
import { theme } from '@/lib/theme';

/**
 * Shared-element open/close for the story viewer: the stage grows out of the
 * tapped circle (uniform scale + a circular clip that widens to the full
 * card) and shrinks back into its group's circle on close. Falls back to a
 * soft fade/slide when there is no circle on screen or motion is reduced.
 */
const reduced = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.documentElement.getAttribute('data-acc-motion') === 'on';

/** The stage's untransformed box — it is centred in the full-screen overlay. */
function homeBox(el: HTMLElement) {
  const w = el.offsetWidth;
  const h = el.offsetHeight;
  return { w, h, cx: window.innerWidth / 2, cy: window.innerHeight / 2 };
}

function circleFrames(el: HTMLElement, rect: DOMRect) {
  const b = homeBox(el);
  const s = rect.width / b.w;
  const dx = rect.left + rect.width / 2 - b.cx;
  const dy = rect.top + rect.height / 2 - b.cy;
  const full = Math.hypot(b.w, b.h) / 2;
  return {
    small: { transform: `translate(${dx}px, ${dy}px) scale(${s})`, clipPath: `circle(${b.w / 2}px at 50% 50%)`, opacity: 0.6 },
    big: { transform: 'translate(0px, 0px) scale(1)', clipPath: `circle(${full}px at 50% 50%)`, opacity: 1 },
  };
}

function onScreen(r: DOMRect): boolean {
  return r.width > 0 && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
}

export function useStoryFlip(
  stage: RefObject<HTMLElement>,
  overlay: RefObject<HTMLElement>,
  origin: DOMRect | null,
) {
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    overlay.current?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'ease' });
    if (!origin || reduced()) {
      el.animate([{ opacity: 0, transform: 'scale(0.97)' }, { opacity: 1, transform: 'scale(1)' }],
        { duration: 240, easing: theme.motion.outStrong });
      return;
    }
    const f = circleFrames(el, origin);
    el.animate([f.small, f.big], { duration: 440, easing: theme.motion.drawer });
    // Mount-only: the origin is the circle that was tapped to open.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Animate out (into `groupId`'s circle when visible), then call `done`. */
  return useCallback((groupId: string, done: () => void) => {
    const el = stage.current;
    if (!el) { done(); return; }
    const ring = document.querySelector(`[data-story-group="${groupId}"] [data-story-ring]`);
    const rect = ring?.getBoundingClientRect();
    const current = el.style.transform || 'translate(0px, 0px) scale(1)';
    overlay.current?.animate([{ opacity: overlay.current.style.opacity || 1 }, { opacity: 0 }],
      { duration: 280, easing: 'ease', fill: 'forwards' });
    let anim: Animation;
    if (rect && onScreen(rect) && !reduced()) {
      const f = circleFrames(el, rect);
      anim = el.animate([{ ...f.big, transform: current }, f.small], { duration: 340, easing: theme.motion.drawer, fill: 'forwards' });
    } else {
      anim = el.animate([{ transform: current, opacity: 1 }, { transform: 'translateY(30%) scale(0.92)', opacity: 0 }],
        { duration: 240, easing: theme.motion.outStrong, fill: 'forwards' });
    }
    anim.onfinish = done;
  }, [stage, overlay]);
}
