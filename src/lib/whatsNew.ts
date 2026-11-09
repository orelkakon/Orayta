/**
 * "חדש באורייתא" — a one-time announcement shown to every visitor once per
 * device. To announce something else: change WHATS_NEW_ID (anything not seen
 * before) and the feature in components/WhatsNew/features.tsx — everyone sees
 * the new one once, regardless of the old one.
 */
export const WHATS_NEW_ID = 'rabbi-bot-2026-11';

const STORAGE_KEY = 'orayta_whats_new';
const SHOWN_AT_KEY = 'orayta_whats_new_at';

/* Full-screen or focused flows where an announcement would get in the way. */
const QUIET_PATHS = ['/play', '/login', '/ask', '/feed', '/admin', '/feed-videos', '/tehillim'];

export function isQuietPath(pathname: string): boolean {
  return QUIET_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

/** Not seen on this device yet. Storage blocked (private mode) → don't show: we couldn't remember the dismissal. */
export function whatsNewDue(id: string = WHATS_NEW_ID): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) !== id;
  } catch {
    return false;
  }
}

export function markWhatsNewSeen(id: string = WHATS_NEW_ID): void {
  try {
    localStorage.setItem(STORAGE_KEY, id);
    localStorage.setItem(SHOWN_AT_KEY, String(Date.now()));
  } catch { /* storage blocked */ }
}

/** An announcement appeared within the last `ms` — other nudges (the bot's teaser) hold back. */
export function whatsNewShownWithin(ms: number): boolean {
  try {
    return Date.now() - Number(localStorage.getItem(SHOWN_AT_KEY) ?? 0) < ms;
  } catch {
    return false;
  }
}
