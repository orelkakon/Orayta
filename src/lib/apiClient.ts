/**
 * Tiny typed fetch helper.
 * Every data-driven view goes through `getJson` so failures surface as a real
 * error (ApiError) instead of silently resolving to an empty list.
 */

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message?: string) {
    super(message ?? `Request failed with status ${status}`);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new ApiError(res.status);
  return (await res.json()) as T;
}

/**
 * Cache-busting variant of a URL for refreshes right after an admin mutation.
 * The list endpoints are CDN-cached (see `apiCache.ts`), and the CDN keys on
 * the full URL including the query string — a unique param forces a fresh
 * origin fetch so the admin sees their change immediately.
 */
export function freshUrl(url: string): string {
  return `${url}${url.includes('?') ? '&' : '?'}fresh=${Date.now()}`;
}

/** True when the error is a cancelled request — callers should ignore those. */
export function isAbort(e: unknown): boolean {
  if (e instanceof DOMException && e.name === 'AbortError') return true;
  return e instanceof Error && e.name === 'AbortError';
}
