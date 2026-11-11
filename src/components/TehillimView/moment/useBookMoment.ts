import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Watches a reading's completed-books count and reports the moment it rises
 * while the page is open — after this device's own "done" or a poll that saw
 * someone else close the book. `?moment=1` plays it once for a preview.
 */
export function useBookMoment(books: number | null): { moment: number | null; clear: () => void } {
  const [moment, setMoment] = useState<number | null>(null);
  const prev = useRef<number | null>(null);

  useEffect(() => {
    if (books === null) return;
    if (prev.current === null) {
      try { if (new URLSearchParams(window.location.search).get('moment')) setMoment(Math.max(1, books)); } catch {}
    } else if (books > prev.current) {
      setMoment(books);
    }
    prev.current = books;
  }, [books]);

  const clear = useCallback(() => setMoment(null), []);
  return { moment, clear };
}
