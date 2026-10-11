/**
 * Tiny in-process TTL cache with in-flight de-duplication, so concurrent
 * visitors in the same area trigger one upstream request, not many.
 * Serverless instances each keep their own copy — that's fine for rate
 * limiting politeness; it is not a correctness requirement.
 */
export function ttlCache<T>(ttlMs: number, maxEntries = 300) {
  const store = new Map<string, { at: number; value: T }>();
  const inflight = new Map<string, Promise<T>>();

  return async function get(key: string, load: () => Promise<T>): Promise<T> {
    const hit = store.get(key);
    if (hit && Date.now() - hit.at < ttlMs) return hit.value;
    const pending = inflight.get(key);
    if (pending) return pending;
    const p = load()
      .then(value => {
        if (store.size >= maxEntries) store.delete(store.keys().next().value as string);
        store.set(key, { at: Date.now(), value });
        return value;
      })
      .finally(() => inflight.delete(key));
    inflight.set(key, p);
    return p;
  };
}

/** Snap a coordinate to a ~1km grid so nearby searches share one cache entry. */
export const GRID_DEG = 0.01;
export const snap = (v: number) => Math.round(v / GRID_DEG) * GRID_DEG;
/** Max distance between a point and its grid-cell center, padded. */
export const SNAP_SLACK_M = 800;
