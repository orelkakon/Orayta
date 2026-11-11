/**
 * "Add to home screen", shared by the automatic sheet and the on-demand
 * buttons (the "עוד" sheet, the Tehillim thanks screen).
 *
 * Chromium (Android, desktop) hands us a `beforeinstallprompt` event whose
 * `prompt()` opens the browser's own install dialog — one tap, one system
 * confirmation. iOS has no such API: there we can only show the steps.
 */
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

/** How this browser can install the app; null = already installed or unsupported. */
export type InstallMode = 'prompt' | 'ios' | null;

/** Asks the mounted AddToHomeScreen to show the iOS steps. */
export const INSTALL_GUIDE_EVENT = 'orayta:install-guide';

const DAYS_KEY = 'orayta_a2hs_days';
const SNOOZED_KEY = 'orayta_a2hs_snoozed';
const DAY_MS = 24 * 60 * 60 * 1000;
const INSTALLED_N = 99; // sentinel dismiss-count: app installed → year-long snooze

let bip: BeforeInstallPromptEvent | null = null;
let started = false;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach(fn => fn());

function readSnooze(): { t: number; n: number } | null {
  try {
    const v: unknown = JSON.parse(localStorage.getItem(SNOOZED_KEY) ?? 'null');
    if (typeof v === 'number') return { t: v, n: 1 }; // migrate old plain-timestamp value
    const o = v as { t?: unknown; n?: unknown } | null;
    return o && typeof o.t === 'number' && typeof o.n === 'number' ? { t: o.t, n: o.n } : null;
  } catch { return null; }
}
const snoozeDays = (n: number) => (n >= INSTALLED_N ? 365 : n >= 2 ? 60 : 14);
const writeSnooze = (n: number) => {
  try { localStorage.setItem(SNOOZED_KEY, JSON.stringify({ t: Date.now(), n })); } catch { /* private mode */ }
};

/** The automatic sheet was dismissed: 14 days of quiet, 60 after the second time. */
export const bumpSnooze = () => writeSnooze(Math.min((readSnooze()?.n ?? 0) + 1, INSTALLED_N - 1));
export function isSnoozed(): boolean {
  const s = readSnooze();
  return !!s && Date.now() - s.t < snoozeDays(s.n) * DAY_MS;
}

/** Record today as a visit day (cap 10) — the sheet only appears from the 2nd distinct day on. */
export function isSecondPlusVisitDay(): boolean {
  try {
    const raw = localStorage.getItem(DAYS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    const days = Array.isArray(parsed) ? parsed.filter((d): d is string => typeof d === 'string') : [];
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!days.includes(today)) days.push(today);
    localStorage.setItem(DAYS_KEY, JSON.stringify(days.slice(-10)));
    return days.length >= 2;
  } catch { return false; }
}

export const isIosDevice = () =>
  /iphone|ipod|ipad/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Mac/.test(navigator.userAgent));

export function isStandalone(): boolean {
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia('(display-mode: standalone)').matches || !!nav.standalone;
}

/** Start listening for the browser's install events (idempotent). */
export function initInstall(): void {
  if (started || typeof window === 'undefined') return;
  started = true;
  // Chromium fires beforeinstallprompt before React mounts — layout.tsx parks it on window.__bip.
  bip = (window as unknown as { __bip?: BeforeInstallPromptEvent }).__bip ?? null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); bip = e as BeforeInstallPromptEvent; notify(); });
  window.addEventListener('appinstalled', () => { bip = null; writeSnooze(INSTALLED_N); notify(); });
}

export function installMode(): InstallMode {
  if (typeof window === 'undefined' || isStandalone()) return null;
  if (isIosDevice()) return 'ios';
  return bip ? 'prompt' : null;
}

export function subscribeInstall(fn: () => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** Open the browser's install dialog. An event can be used once. */
export async function promptInstall(): Promise<'accepted' | 'dismissed' | 'unavailable'> {
  const e = bip;
  if (!e) return 'unavailable';
  bip = null;
  try {
    await e.prompt();
    const { outcome } = await e.userChoice;
    if (outcome === 'accepted') writeSnooze(INSTALLED_N);
    notify();
    return outcome === 'accepted' ? 'accepted' : 'dismissed';
  } catch {
    notify();
    return 'unavailable';
  }
}

/** A tap on an "install" button: the system dialog where there is one, the steps on iOS. */
export function requestInstall(): void {
  const mode = installMode();
  if (mode === 'prompt') void promptInstall();
  else if (mode === 'ios') window.dispatchEvent(new Event(INSTALL_GUIDE_EVENT));
}
