import type { PlayErrorCode, PlayHostAction, PlayJoinResponse } from '@/types/play';

/**
 * Client side of the group quiz: per-device identities (host key / player
 * key per game code) in localStorage, and fetch helpers that attach them.
 */
const HOST_KEY = 'orayta_play_host';
const ME_KEY = 'orayta_play_me';
const PROFILE_KEY = 'orayta_play_profile';

function readMap<T>(key: string): Record<string, T> {
  try {
    const v = JSON.parse(localStorage.getItem(key) ?? '{}') as unknown;
    return v && typeof v === 'object' ? v as Record<string, T> : {};
  } catch { return {}; }
}

function writeEntry<T>(key: string, code: string, value: T | null): void {
  try {
    const map = readMap<T>(key);
    if (value === null) delete map[code]; else map[code] = value;
    // Keep only the latest few games per device.
    const entries = Object.entries(map).slice(-8);
    localStorage.setItem(key, JSON.stringify(Object.fromEntries(entries)));
  } catch { /* storage full or blocked — the game still works this session */ }
}

export const getHostKey = (code: string): string | null => readMap<string>(HOST_KEY)[code] ?? null;
export const setHostKey = (code: string, key: string) => writeEntry(HOST_KEY, code, key);

export const getMe = (code: string): PlayJoinResponse | null => readMap<PlayJoinResponse>(ME_KEY)[code] ?? null;
export const setMe = (code: string, me: PlayJoinResponse | null) => writeEntry(ME_KEY, code, me);

export interface PlayProfile { name: string; avatar: string; }
export function getProfile(): PlayProfile | null {
  try { return JSON.parse(localStorage.getItem(PROFILE_KEY) ?? 'null') as PlayProfile | null; } catch { return null; }
}
export function setProfile(p: PlayProfile): void {
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
}

export interface Identity { hostKey?: string | null; me?: PlayJoinResponse | null; }

export function authHeaders(id: Identity): Record<string, string> {
  const h: Record<string, string> = {};
  if (id.hostKey) h['x-play-host'] = id.hostKey;
  if (id.me) { h['x-play-id'] = id.me.playerId; h['x-play-key'] = id.me.key; }
  return h;
}

export type PlayResult<T> = { ok: true; data: T } | { ok: false; error: PlayErrorCode | 'network' };

export async function playFetch<T>(url: string, init: RequestInit & { identity?: Identity } = {}): Promise<PlayResult<T>> {
  const { identity, ...rest } = init;
  try {
    const res = await fetch(url, {
      ...rest,
      cache: 'no-store',
      headers: { 'Content-Type': 'application/json', ...authHeaders(identity ?? {}), ...(rest.headers ?? {}) },
    });
    const body = await res.json().catch(() => ({})) as T & { error?: PlayErrorCode };
    if (!res.ok) return { ok: false, error: body.error ?? 'bad_request' };
    return { ok: true, data: body };
  } catch {
    return { ok: false, error: 'network' };
  }
}

export const hostAction = (code: string, hostKey: string, action: PlayHostAction) =>
  playFetch<{ ok: boolean }>(`/api/play/${code}/host`, { method: 'POST', body: JSON.stringify(action), identity: { hostKey } });

export const joinUrl = (code: string) =>
  `${typeof window !== 'undefined' ? window.location.origin : ''}/play?code=${code}`;

export const displayHost = () => (typeof window !== 'undefined' ? window.location.host : '');
