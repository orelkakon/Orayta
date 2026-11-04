import { RefObject, useLayoutEffect } from 'react';

/**
 * Grows a textarea with its text so it never scrolls on its own — the sheet
 * around it does, which is one scroller instead of two fighting on iOS.
 * CSS (`min-height`, `flex-grow`) still decides the empty size. The parent's
 * height is held while measuring so the scroll position doesn't jump.
 */
export function useAutoGrow(ref: RefObject<HTMLTextAreaElement>, value: string): void {
  useLayoutEffect(() => {
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;
    const fit = () => {
      parent.style.minHeight = `${parent.offsetHeight}px`;
      el.style.flexGrow = '0';
      el.style.height = '0px';
      const height = el.scrollHeight + el.offsetHeight - el.clientHeight;
      el.style.height = `${height}px`;
      el.style.flexGrow = '';
      parent.style.minHeight = '';
    };
    fit();
    const ro = new ResizeObserver(() => {
      if (el.dataset.w !== String(el.clientWidth)) { el.dataset.w = String(el.clientWidth); fit(); }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, value]);
}
