import { RefObject, useEffect, useRef } from 'react';
import { theme } from '@/lib/theme';

const DECIDE_PX = 6;
// A quick flick dismisses regardless of distance (px per ms).
const FLICK_VELOCITY = 0.4;
const EDITABLE = 'textarea, input, select, [contenteditable=""], [contenteditable="true"]';

/** True when the touch lands in a field or in anything between it and the body that is scrolled down. */
function ownsTheGesture(target: Element, body: HTMLElement): boolean {
  if (target.closest(EDITABLE)) return true;
  for (let n: Element | null = target; n && body.contains(n); n = n.parentElement) {
    if (n.scrollTop > 0) return true;
  }
  return false;
}

/**
 * Drag-to-dismiss for a bottom sheet, following the finger 1:1.
 * A drag starts from the handle area anywhere, or from the scrolling body only
 * when it is already scrolled to the top and the finger moves down — so the
 * content scrolls normally and the sheet still pulls down from the top.
 * Touches inside a text field or an inner scroller that isn't at its top never
 * drag the sheet (scrolling a long textarea up used to close the form), and
 * `bodyDrag: false` limits dragging to the handle and title (forms).
 * Upward drags get rubber-band friction instead of a hard stop. Transforms are
 * written straight to the element (no React state per frame).
 */
export function useSheetDrag(
  enabled: boolean,
  panel: RefObject<HTMLElement>,
  scroller: RefObject<HTMLElement>,
  backdrop: RefObject<HTMLElement>,
  onDismiss: () => void,
  bodyDrag = true,
): void {
  const dismissRef = useRef(onDismiss);
  dismissRef.current = onDismiss;

  useEffect(() => {
    const el = panel.current;
    if (!enabled || !el) return;
    let startY = 0, startT = 0, dy = 0;
    let decided = false, dragging = false, fromBody = false, tracking = false;

    const setOffset = (y: number) => {
      el.style.transform = `translate3d(0, ${y}px, 0)`;
      if (backdrop.current) {
        const h = el.offsetHeight || 1;
        backdrop.current.style.opacity = String(Math.max(0, 1 - Math.max(0, y) / h));
      }
    };

    const onStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) { tracking = false; return; }
      const body = scroller.current;
      const target = e.target as Element;
      fromBody = !!body && body.contains(target);
      tracking = !(fromBody && body && (!bodyDrag || ownsTheGesture(target, body)));
      startY = e.touches[0].clientY;
      startT = performance.now();
      dy = 0; decided = false; dragging = false;
    };

    const onMove = (e: TouchEvent) => {
      if (!tracking || e.touches.length !== 1) return;
      dy = e.touches[0].clientY - startY;
      if (!decided) {
        if (Math.abs(dy) < DECIDE_PX) return;
        decided = true;
        dragging = fromBody ? dy > 0 : true;
        if (!dragging) { tracking = false; return; }
        el.style.transition = 'none';
        if (backdrop.current) backdrop.current.style.transition = 'none';
      }
      if (!dragging) return;
      e.preventDefault();
      setOffset(dy >= 0 ? dy : -Math.sqrt(-dy) * 3);
    };

    const onEnd = () => {
      if (!dragging) { tracking = false; return; }
      dragging = false; tracking = false;
      const velocity = dy / Math.max(1, performance.now() - startT);
      const far = dy > Math.min(140, el.offsetHeight * 0.3);
      const ease = `${theme.motion.drawer}`;
      el.style.transition = `transform 0.26s ${ease}`;
      if (backdrop.current) backdrop.current.style.transition = `opacity 0.26s ${ease}`;
      if (far || (velocity > FLICK_VELOCITY && dy > 24)) {
        el.style.transform = 'translate3d(0, 100%, 0)';
        if (backdrop.current) backdrop.current.style.opacity = '0';
        dismissRef.current();
      } else {
        el.style.transform = '';
        if (backdrop.current) backdrop.current.style.opacity = '';
      }
    };

    el.addEventListener('touchstart', onStart, { passive: true });
    el.addEventListener('touchmove', onMove, { passive: false });
    el.addEventListener('touchend', onEnd);
    el.addEventListener('touchcancel', onEnd);
    return () => {
      el.removeEventListener('touchstart', onStart);
      el.removeEventListener('touchmove', onMove);
      el.removeEventListener('touchend', onEnd);
      el.removeEventListener('touchcancel', onEnd);
    };
  }, [enabled, panel, scroller, backdrop, bodyDrag]);
}
