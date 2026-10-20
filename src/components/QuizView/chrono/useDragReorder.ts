'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { haptics } from '@/lib/haptics';
import { moveItem } from '@/lib/chronoQuiz';

/**
 * Pointer-driven vertical reordering with no library: one hook drives mouse,
 * pen and touch. The dragged card follows the pointer 1:1 (transform only,
 * no layout), siblings glide out of the way, and every order change — drop,
 * keyboard, tap-to-swap, the reveal — is FLIP-animated from where the cards
 * visibly were. Touch starts on the handle immediately, or on the card body
 * after a short press so the page can still be scrolled through the list.
 */

const LONG_PRESS_MS = 200;
const SLOP_PX = 6;
const EDGE_PX = 72;
const LIFT = 'scale(1.035)';
const SPRING = 'cubic-bezier(0.34, 1.4, 0.64, 1)';

interface Drag {
  id: string; from: number; over: number; pointerId: number; el: HTMLElement;
  startY: number; lastY: number; startScroll: number;
  slots: { top: number; height: number }[]; step: number;
  active: boolean; viaHandle: boolean; pointerType: string; timer: number | null;
}

const reduced = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useDragReorder(order: string[], onChange: (next: string[]) => void, onTap: (id: string) => void, disabled = false) {
  const els = useRef(new Map<string, HTMLElement>());
  const flip = useRef(new Map<string, number>());
  const drag = useRef<Drag | null>(null);
  const raf = useRef(0);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const capture = () => { flip.current.clear(); els.current.forEach((el, id) => flip.current.set(id, el.getBoundingClientRect().top)); };

  /** Change the order with a FLIP glide from the current on-screen positions. */
  const reorder = useCallback((next: string[]) => { capture(); onChange(next); }, [onChange]);

  useLayoutEffect(() => {
    if (!flip.current.size) return;
    const dur = reduced() ? 0 : 320;
    els.current.forEach((el, id) => {
      const prev = flip.current.get(id);
      if (prev === undefined) return;
      const dy = prev - el.getBoundingClientRect().top;
      el.style.transition = 'none';
      el.style.transform = dy ? `translateY(${dy}px)` : '';
      el.style.zIndex = '';
      if (!dy) return;
      void el.offsetHeight;
      el.style.transition = `transform ${dur}ms ${SPRING}`;
      el.style.transform = '';
    });
    flip.current.clear();
  }, [order]);

  const shiftSiblings = (d: Drag) => {
    order.forEach((id, i) => {
      if (id === d.id) return;
      const el = els.current.get(id);
      if (!el) return;
      let dy = 0;
      if (d.from < d.over && i > d.from && i <= d.over) dy = -d.step;
      if (d.from > d.over && i < d.from && i >= d.over) dy = d.step;
      el.style.transition = reduced() ? 'none' : `transform 220ms ${SPRING}`;
      el.style.transform = dy ? `translateY(${dy}px)` : '';
    });
  };

  const frame = () => {
    const d = drag.current;
    if (!d?.active) return;
    const y = d.lastY;
    const speed = y < EDGE_PX ? -(EDGE_PX - y) / 4 : y > window.innerHeight - EDGE_PX ? (y - (window.innerHeight - EDGE_PX)) / 4 : 0;
    if (speed) window.scrollBy(0, speed);
    const dy = y - d.startY + (window.scrollY - d.startScroll);
    d.el.style.transform = `translateY(${dy}px) ${LIFT}`;
    const center = d.slots[d.from].top + d.slots[d.from].height / 2 + dy;
    const over = d.slots.filter((s, j) => j !== d.from && s.top + s.height / 2 < center).length;
    if (over !== d.over) { d.over = over; shiftSiblings(d); haptics.tap(); }
    raf.current = requestAnimationFrame(frame);
  };

  const activate = (d: Drag) => {
    d.active = true;
    d.timer = null;
    const scroll = window.scrollY;
    d.slots = order.map(id => { const r = els.current.get(id)!.getBoundingClientRect(); return { top: r.top + scroll, height: r.height }; });
    const next = d.slots[d.from + 1] ?? d.slots[d.from - 1];
    d.step = next ? Math.abs(next.top - d.slots[d.from].top) : d.slots[d.from].height;
    d.startScroll = scroll;
    d.el.style.transition = reduced() ? 'none' : `box-shadow 200ms ease`;
    d.el.style.zIndex = '5';
    try { d.el.setPointerCapture(d.pointerId); } catch { /* already released */ }
    setDraggingId(d.id);
    haptics.tap();
    raf.current = requestAnimationFrame(frame);
  };

  const end = (commit: boolean) => {
    const d = drag.current;
    drag.current = null;
    cancelAnimationFrame(raf.current);
    if (!d) return;
    if (d.timer) window.clearTimeout(d.timer);
    if (!d.active) return;
    setDraggingId(null);
    if (commit && d.over !== d.from) { reorder(moveItem(order, d.from, d.over)); return; }
    capture();
    els.current.forEach(el => { el.style.transform = ''; });
    // Same order: the layout effect won't run, so glide home here.
    els.current.forEach((el, id) => {
      const prev = flip.current.get(id)!;
      const dy = prev - el.getBoundingClientRect().top;
      el.style.transition = 'none';
      el.style.transform = dy ? `translateY(${dy}px)` : '';
      void el.offsetHeight;
      el.style.transition = reduced() ? 'none' : `transform 300ms ${SPRING}`;
      el.style.transform = '';
      el.style.zIndex = '';
    });
    flip.current.clear();
  };

  useEffect(() => {
    // Once a touch drag is live, stop the page from panning under it.
    const block = (e: TouchEvent) => { if (drag.current?.active) e.preventDefault(); };
    document.addEventListener('touchmove', block, { passive: false });
    return () => { document.removeEventListener('touchmove', block); cancelAnimationFrame(raf.current); };
  }, []);

  const itemProps = (id: string) => ({
    ref: (el: HTMLElement | null) => { if (el) els.current.set(id, el); else els.current.delete(id); },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || drag.current || (e.pointerType === 'mouse' && e.button !== 0)) return;
      const viaHandle = (e.target as HTMLElement).closest('[data-drag-handle]') !== null;
      const d: Drag = {
        id, from: order.indexOf(id), over: order.indexOf(id), pointerId: e.pointerId, el: e.currentTarget,
        startY: e.clientY, lastY: e.clientY, startScroll: window.scrollY, slots: [], step: 0,
        active: false, viaHandle, pointerType: e.pointerType, timer: null,
      };
      drag.current = d;
      if (e.pointerType === 'touch' && !viaHandle) d.timer = window.setTimeout(() => { if (drag.current === d) activate(d); }, LONG_PRESS_MS);
    },
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      d.lastY = e.clientY;
      if (d.active) return;
      if (Math.abs(e.clientY - d.startY) > SLOP_PX) {
        // Touch on the body moved before the long press: it's a scroll.
        if (d.pointerType === 'touch' && !d.viaHandle) end(false);
        else activate(d);
      }
    },
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => {
      const d = drag.current;
      if (!d || e.pointerId !== d.pointerId) return;
      const tapped = !d.active;
      end(true);
      if (tapped && !disabled) onTap(id);
    },
    onPointerCancel: () => end(false),
  });

  return { itemProps, reorder, draggingId };
}
