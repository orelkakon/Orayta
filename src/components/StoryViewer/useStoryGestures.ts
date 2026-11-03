import { PointerEvent as RPointerEvent, RefObject, useRef, useState } from 'react';
import { theme } from '@/lib/theme';

/**
 * Story gestures on the full-card gesture layer:
 * - press pauses at once; holding hides the chrome (after a beat, so taps
 *   don't flicker it);
 * - tap: left two-thirds = next, right third = back (RTL reading order);
 * - horizontal swipe = next / previous;
 * - pull down follows the finger (stage shrinks, backdrop fades) and closes
 *   past a distance or on a flick, otherwise springs back.
 */
const HIDE_CHROME_MS = 220;

interface Handlers {
  next: () => void;
  prev: () => void;
  dismiss: () => void;
}

export function useStoryGestures(stage: RefObject<HTMLElement>, overlay: RefObject<HTMLElement>, nav: Handlers) {
  const [pressed, setPressed] = useState(false);
  const [chromeHidden, setChromeHidden] = useState(false);
  const g = useRef<{ x: number; y: number; t: number; mode: 'none' | 'drag' | 'swipe'; dy: number } | null>(null);
  const hideTimer = useRef(0);
  const navRef = useRef(nav);
  navRef.current = nav;

  const release = () => {
    window.clearTimeout(hideTimer.current);
    setPressed(false);
    setChromeHidden(false);
  };

  const springBack = () => {
    const el = stage.current;
    if (!el) return;
    const from = el.style.transform;
    el.style.transform = '';
    if (overlay.current) overlay.current.style.opacity = '';
    if (from) el.animate([{ transform: from }, { transform: 'translate(0px, 0px) scale(1)' }], { duration: 320, easing: theme.motion.drawer });
  };

  const onPointerDown = (e: RPointerEvent<HTMLElement>) => {
    if (!e.isPrimary) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    g.current = { x: e.clientX, y: e.clientY, t: performance.now(), mode: 'none', dy: 0 };
    setPressed(true);
    hideTimer.current = window.setTimeout(() => setChromeHidden(true), HIDE_CHROME_MS);
  };

  const onPointerMove = (e: RPointerEvent<HTMLElement>) => {
    const s = g.current;
    if (!s || !e.isPrimary) return;
    const dx = e.clientX - s.x;
    const dy = e.clientY - s.y;
    if (s.mode === 'none') {
      if (Math.abs(dy) > 10 && dy > Math.abs(dx)) s.mode = 'drag';
      else if (Math.abs(dx) > 10) s.mode = 'swipe';
      else return;
      window.clearTimeout(hideTimer.current);
    }
    if (s.mode !== 'drag') return;
    s.dy = Math.max(0, dy);
    const el = stage.current;
    if (el) el.style.transform = `translate(0px, ${s.dy}px) scale(${1 - Math.min(s.dy, 500) / 2000})`;
    if (overlay.current) overlay.current.style.opacity = String(Math.max(0.15, 1 - s.dy / 500));
  };

  const onPointerUp = (e: RPointerEvent<HTMLElement>) => {
    const s = g.current;
    g.current = null;
    release();
    if (!s) return;
    const dx = e.clientX - s.x;
    const dt = performance.now() - s.t;
    if (s.mode === 'drag') {
      const velocity = s.dy / Math.max(1, dt);
      if (s.dy > 110 || (velocity > 0.5 && s.dy > 30)) navRef.current.dismiss();
      else springBack();
      return;
    }
    if (s.mode === 'swipe') {
      if (Math.abs(dx) > 50) { if (dx < 0) navRef.current.next(); else navRef.current.prev(); }
      return;
    }
    if (dt < 300) {
      const rect = e.currentTarget.getBoundingClientRect();
      if ((e.clientX - rect.left) / rect.width < 0.66) navRef.current.next();
      else navRef.current.prev();
    }
  };

  const onPointerCancel = () => {
    const s = g.current;
    g.current = null;
    release();
    if (s?.mode === 'drag') springBack();
  };

  return {
    paused: pressed,
    chromeHidden,
    handlers: { onPointerDown, onPointerMove, onPointerUp, onPointerCancel },
  };
}
