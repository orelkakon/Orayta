'use client';

import { useRef } from 'react';
import type { TouchEvent } from 'react';
import { classifySwipe, isInEdgeGuard } from '@/lib/swipe';
import { haptics } from '@/lib/haptics';

/**
 * Horizontal swipe navigation for sequential readers (chapters, siddur
 * sections). Swipe right → next item, swipe left → previous item.
 *
 * Returns touch handlers to spread onto the content wrapper. React attaches
 * touch listeners as passive, and we never call preventDefault, so vertical
 * scrolling, pinch-zoom and long-press text selection keep working exactly as
 * before — a gesture is only interpreted after the finger lifts.
 */

interface Options {
  onNext: () => void;
  onPrev: () => void;
  canNext: boolean;
  canPrev: boolean;
  enabled?: boolean;
}

interface Start { x: number; y: number; t: number; el: HTMLElement; }

const IGNORE_SELECTOR = 'input, select, textarea, button, a, [data-swipe-ignore]';

/** True when the touch began inside something that scrolls sideways itself. */
function inHorizontalScroller(target: HTMLElement, boundary: HTMLElement): boolean {
  let node: HTMLElement | null = target;
  while (node && node !== boundary) {
    const ox = getComputedStyle(node).overflowX;
    if ((ox === 'auto' || ox === 'scroll') && node.scrollWidth > node.clientWidth) return true;
    node = node.parentElement;
  }
  return false;
}

function hasTextSelection(): boolean {
  const sel = typeof window !== 'undefined' ? window.getSelection() : null;
  return !!sel && sel.toString().trim().length > 0;
}

export function useSwipeNav({ onNext, onPrev, canNext, canPrev, enabled = true }: Options) {
  const start = useRef<Start | null>(null);

  const onTouchStart = (e: TouchEvent<HTMLElement>) => {
    start.current = null;
    if (!enabled || e.touches.length !== 1) return;
    const touch = e.touches[0];
    const target = e.target as HTMLElement;
    if (target.closest(IGNORE_SELECTOR)) return;
    if (isInEdgeGuard(touch.clientX, window.innerWidth)) return;
    if (inHorizontalScroller(target, e.currentTarget)) return;
    start.current = { x: touch.clientX, y: touch.clientY, t: Date.now(), el: e.currentTarget };
  };

  const onTouchEnd = (e: TouchEvent<HTMLElement>) => {
    const s = start.current;
    start.current = null;
    if (!s || e.changedTouches.length !== 1) return;
    if (hasTextSelection()) return;
    const touch = e.changedTouches[0];
    const dir = classifySwipe({ dx: touch.clientX - s.x, dy: touch.clientY - s.y, elapsedMs: Date.now() - s.t });
    if (dir === 'right' && canNext) onNext();
    else if (dir === 'left' && canPrev) onPrev();
    else return;
    haptics.tap();
    // After a swipe deep in a long text, bring the top of the new item into view.
    if (s.el.getBoundingClientRect().top < 0) s.el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const onTouchCancel = () => { start.current = null; };

  return { onTouchStart, onTouchEnd, onTouchCancel };
}
