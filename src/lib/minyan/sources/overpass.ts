/**
 * Overpass API client shared by the OSM sources (synagogues, mikvaot).
 *
 * Public Overpass instances are often slow, overloaded or refuse a client
 * outright (HTTP 406/429). Trying them one after another used to exceed the
 * function's time limit, so a single dead instance failed the whole search.
 * Now: instances are tried in health order, a slow one gets the next one
 * racing it after HEDGE_MS, a refusing one hands over at once, and the whole
 * call is capped by a deadline. Instances that failed recently go last.
 */
import { USER_AGENT } from './types';

export const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const HEDGE_MS = 1500;
const COOLDOWN_MS = 3 * 60_000;
const downUntil = new Map<string, number>();

/** Healthy instances first (in list order), recently failed ones last. */
export function endpointOrder(now = Date.now()): string[] {
  const isDown = (u: string) => (downUntil.get(u) ?? 0) > now;
  return [...OVERPASS_ENDPOINTS.filter(u => !isDown(u)), ...OVERPASS_ENDPOINTS.filter(isDown)];
}

/** Every instance failed within the cooldown — skip live Overpass for now. */
export const overpassCoolingDown = (now = Date.now()) => OVERPASS_ENDPOINTS.every(u => (downUntil.get(u) ?? 0) > now);

const host = (url: string) => new URL(url).host;

interface OverpassJson<T> { elements?: T[]; remark?: string }

/** Runs one Overpass QL query; rejects with a short per-instance error summary. */
export function queryOverpass<T>(query: string, deadlineMs = 10_000): Promise<T[]> {
  const urls = endpointOrder();
  const ctrl = new AbortController();
  const inflight = new Set<string>();
  const errors: string[] = [];
  const timers: ReturnType<typeof setTimeout>[] = [];
  let started = 0, failed = 0, done = false;

  return new Promise<T[]>((resolve, reject) => {
    const finish = (settle: () => void) => {
      if (done) return;
      done = true;
      timers.forEach(clearTimeout);
      ctrl.abort();
      settle();
    };
    const fail = (url: string, why: string) => {
      inflight.delete(url);
      downUntil.set(url, Date.now() + COOLDOWN_MS);
      errors.push(`${host(url)}: ${why}`);
      if (++failed === urls.length) finish(() => reject(new Error(errors.join('; '))));
      else launch();
    };
    const launch = () => {
      if (done || started >= urls.length) return;
      const url = urls[started++];
      inflight.add(url);
      timers.push(setTimeout(launch, HEDGE_MS));
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': USER_AGENT },
        body: `data=${encodeURIComponent(query)}`,
        cache: 'no-store',
        signal: ctrl.signal,
      })
        .then(async res => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json() as OverpassJson<T>;
          // A query that hit the server's own limits comes back 200 with a remark.
          if (json.remark && /timed out|out of memory|runtime error/i.test(json.remark)) throw new Error('server limit');
          inflight.delete(url);
          downUntil.delete(url);
          finish(() => resolve(json.elements ?? []));
        })
        .catch((err: unknown) => {
          if (!done) fail(url, err instanceof Error ? err.message : 'failed');
        });
    };
    timers.push(setTimeout(() => finish(() => {
      inflight.forEach(u => { downUntil.set(u, Date.now() + COOLDOWN_MS); errors.push(`${host(u)}: timeout`); });
      reject(new Error(errors.join('; ') || 'timeout'));
    }), deadlineMs));
    launch();
  });
}
