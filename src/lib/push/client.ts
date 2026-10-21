import { DEFAULT_DAILY_MINUTES } from './schedule';
import { HE } from '@/lib/hebrewTexts';
import type { PushLocalState, PushPrefs } from '@/types/push';

const KEY = 'orayta_push';
const OPEN_EVENT = 'orayta:open-notifications';

export const DEFAULT_PREFS: PushPrefs = { dailyMinutes: DEFAULT_DAILY_MINUTES, daily: true, hilula: true, omer: true };
const DEFAULT_STATE: PushLocalState = { ...DEFAULT_PREFS, enabled: false, endpoint: null };

export type PushSupport = 'supported' | 'ios-install' | 'unsupported';

const isIos = () => /iphone|ipod|ipad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));
const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** iOS exposes Web Push only to home-screen web apps (16.4+); elsewhere we need SW + PushManager. */
export function pushSupport(): PushSupport {
  if (typeof window === 'undefined') return 'unsupported';
  const capable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  if (isIos() && !isStandalone()) return 'ios-install';
  return capable ? 'supported' : 'unsupported';
}

export function readLocal(): PushLocalState {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) ?? 'null') as Partial<PushLocalState> | null;
    return v ? { ...DEFAULT_STATE, ...v } : DEFAULT_STATE;
  } catch { return DEFAULT_STATE; }
}

function writeLocal(s: PushLocalState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* private mode */ }
}

export function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return Promise.resolve(null);
  return navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => null);
}

function urlB64ToBuffer(b64: string): ArrayBuffer {
  const pad = '='.repeat((4 - (b64.length % 4)) % 4);
  const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
  return Uint8Array.from(raw, c => c.charCodeAt(0)).buffer;
}

const timeZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch { return undefined; } };

async function currentSubscription(): Promise<PushSubscription | null> {
  const reg = await registerServiceWorker();
  return reg ? reg.pushManager.getSubscription() : null;
}

/** Must run inside a user tap (iOS rejects permission prompts otherwise). */
export async function enablePush(prefs: PushPrefs): Promise<'ok' | 'denied' | 'error'> {
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return permission === 'denied' ? 'denied' : 'error';
  try {
    const reg = await registerServiceWorker();
    if (!reg) return 'error';
    await navigator.serviceWorker.ready;
    const keyRes = await fetch('/api/push/key');
    if (!keyRes.ok) return 'error';
    const { key } = await keyRes.json() as { key: string };
    const sub = await reg.pushManager.getSubscription()
      ?? await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToBuffer(key) });
    const res = await fetch('/api/push/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscription: sub.toJSON(), prefs, timeZone: timeZone() }),
    });
    if (!res.ok) return 'error';
    writeLocal({ ...prefs, enabled: true, endpoint: sub.endpoint });
    return 'ok';
  } catch { return 'error'; }
}

/** Ownership proof for PATCH/DELETE: endpoint + the subscription's auth secret. */
async function credentials(): Promise<{ endpoint: string; auth: string } | null> {
  const sub = await currentSubscription();
  const auth = sub?.toJSON().keys?.auth;
  return sub && auth ? { endpoint: sub.endpoint, auth } : null;
}

/** Local only — used while notifications are off, so choosing a time first never errors. */
export function saveLocalPrefs(prefs: PushPrefs): void {
  writeLocal({ ...readLocal(), ...prefs });
}

/** (Re-)registers this browser's existing subscription with the server. */
async function register(sub: PushSubscription, prefs: PushPrefs): Promise<boolean> {
  const res = await fetch('/api/push/subscribe', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription: sub.toJSON(), prefs, timeZone: timeZone() }),
  }).catch(() => null);
  if (!res?.ok) return false;
  writeLocal({ ...readLocal(), ...prefs, enabled: true, endpoint: sub.endpoint });
  return true;
}

/**
 * Self-heal: the browser holds a subscription the server may not know (e.g.
 * created while push was still unconfigured, or the endpoint rotated).
 */
export async function ensureRegistered(): Promise<void> {
  const sub = await currentSubscription();
  const local = readLocal();
  if (sub && (!local.enabled || local.endpoint !== sub.endpoint)) await register(sub, local);
}

export async function savePrefs(prefs: PushPrefs): Promise<boolean> {
  writeLocal({ ...readLocal(), ...prefs });
  const sub = await currentSubscription();
  const auth = sub?.toJSON().keys?.auth;
  if (!sub || !auth) return false;
  const res = await fetch('/api/push/subscription', {
    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ endpoint: sub.endpoint, auth, prefs, timeZone: timeZone() }),
  }).catch(() => null);
  // Unknown to the server → register it now instead of failing.
  if (res?.status === 404) return register(sub, prefs);
  return !!res?.ok;
}

export async function disablePush(): Promise<void> {
  const cred = await credentials();
  if (cred) {
    await fetch('/api/push/subscription', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cred),
    }).catch(() => null);
    await (await currentSubscription())?.unsubscribe().catch(() => false);
  }
  writeLocal({ ...readLocal(), enabled: false, endpoint: null });
}

/** True only when permission is granted AND this browser still holds a subscription. */
export async function isSubscribed(): Promise<boolean> {
  if (pushSupport() !== 'supported' || Notification.permission !== 'granted') return false;
  return (await currentSubscription()) !== null;
}

export const currentEndpoint = async () => (await currentSubscription())?.endpoint ?? null;

/** Local notification through the SW — proves the device shows them, no server round-trip. */
export async function localTest(): Promise<boolean> {
  const reg = await registerServiceWorker();
  if (!reg) return false;
  await navigator.serviceWorker.ready;
  await reg.showNotification(HE.PUSH_TEST_TITLE, { body: HE.PUSH_TEST_BODY, icon: '/icon', badge: '/icon', tag: 'test', lang: 'he', dir: 'rtl', data: { url: '/' } });
  return true;
}

export function openNotifications() {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenNotifications(cb: () => void): () => void {
  window.addEventListener(OPEN_EVENT, cb);
  return () => window.removeEventListener(OPEN_EVENT, cb);
}
