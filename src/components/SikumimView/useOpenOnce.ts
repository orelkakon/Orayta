import { useEffect, useRef } from 'react';

/** Deep links (/sikumim?book=&entry=): open the item with `id` once it has loaded. */
export function useOpenOnce<T extends { id: string }>(items: T[], id: string | undefined, open: (item: T) => void) {
  const done = useRef(false);
  useEffect(() => {
    if (done.current || !id) return;
    const hit = items.find(i => i.id === id);
    if (hit) { done.current = true; open(hit); }
  }, [items, id, open]);
}
