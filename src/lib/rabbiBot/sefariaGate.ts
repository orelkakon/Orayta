/**
 * Traffic control for Sefaria's public API. One question sends dozens of
 * requests (searches, whole simanim, links, commentaries) in a few bursts,
 * and Sefaria's Cloudflare answers part of a burst with 429. A throttled
 * request used to count as "no such text", so the one seif that answers
 * "מה מברכים על מים" (OC 204:7) could silently drop out and the bot said it
 * found nothing. Here: at most MAX_IN_FLIGHT requests at once, and a 429 /
 * 5xx is retried after a backoff, during which the whole queue waits (the
 * next requests would hit the same limit).
 */

export const MAX_IN_FLIGHT = 6;
export const MAX_RETRIES = 3;
/**
 * A request stops retrying once it would have spent this long: later waves
 * (commentaries) are worth less than the answer's time budget (52 s for the
 * plan, retrieval and the answer together).
 */
export const RETRY_BUDGET_MS = 6000;
const BASE_DELAY_MS = 500;
const MAX_DELAY_MS = 4000;
/** 0 = the request never got a response (network error, not a timeout). */
const RETRYABLE = new Set([0, 429, 502, 503, 504]);

/**
 * How long to wait before retry number `attempt` (0-based) after `status`,
 * `elapsed` ms after the first try, or null when it shouldn't be retried.
 * Honours Retry-After (seconds), else exponential backoff with jitter;
 * capped, and never past RETRY_BUDGET_MS. Pure — unit-tested.
 */
export function retryDelay(status: number, attempt: number, retryAfter: string | null, elapsed = 0, rand: () => number = Math.random): number | null {
  if (attempt >= MAX_RETRIES || !RETRYABLE.has(status)) return null;
  const header = retryAfter === null || retryAfter.trim() === '' ? NaN : Number(retryAfter);
  const wait = Number.isFinite(header) && header > 0
    ? Math.min(header * 1000, MAX_DELAY_MS)
    : Math.round(Math.min(BASE_DELAY_MS * 2 ** attempt, MAX_DELAY_MS) * (0.75 + rand() * 0.5));
  return elapsed + wait > RETRY_BUDGET_MS ? null : wait;
}

/** A FIFO slot gate: at most `max` tasks run at once; `pause` holds every task not yet started. */
export function createGate(max: number, now: () => number = Date.now) {
  let active = 0;
  let pausedUntil = 0;
  const waiting: (() => void)[] = [];
  const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  async function acquire() {
    if (active >= max) await new Promise<void>(r => waiting.push(r));
    else active++;
    // A slot handed over by release() keeps `active` as is.
    for (let wait = pausedUntil - now(); wait > 0; wait = pausedUntil - now()) await sleep(wait);
  }
  function release() {
    const next = waiting.shift();
    if (next) next(); else active--;
  }
  return {
    async run<T>(task: () => Promise<T>): Promise<T> {
      await acquire();
      try { return await task(); } finally { release(); }
    },
    pause(ms: number) { pausedUntil = Math.max(pausedUntil, now() + ms); },
    /** For tests. */
    get active() { return active; },
  };
}
