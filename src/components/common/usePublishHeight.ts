import { RefObject, useEffect } from 'react';

/**
 * Publishes an element's live height as a CSS custom property (e.g.
 * `--header-h`), on `target` or on <html> by default, so sticky bars below it
 * can sit exactly under it instead of assuming a fixed pixel height.
 */
export function usePublishHeight(
  source: RefObject<HTMLElement>,
  name: string,
  target?: RefObject<HTMLElement>,
) {
  useEffect(() => {
    const el = source.current;
    const host = target ? target.current : document.documentElement;
    if (!el || !host) return;
    const set = () => host.style.setProperty(name, `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, [source, name, target]);
}
