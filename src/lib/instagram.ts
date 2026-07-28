/* Instagram URL parsing helpers — shared by API routes and admin UI */

const REEL_RE    = /instagram\.com\/(?:[\w.]+\/)?(?:reel|reels|p)\/([A-Za-z0-9_-]{5,})/;
const PROFILE_RE = /instagram\.com\/([A-Za-z0-9._]{2,30})\/?(?:\?.*)?$/;

/** Extract the shortcode from a reel/post URL, or null if not a valid reel link. */
export function parseReelCode(url: string): string | null {
  const m = REEL_RE.exec(url.trim());
  return m ? m[1] : null;
}

/** Extract the username from a profile URL (not a reel/post link), or null. */
export function parseProfileUsername(url: string): string | null {
  const trimmed = url.trim();
  if (REEL_RE.test(trimmed)) return null;
  const m = PROFILE_RE.exec(trimmed.split('?')[0].replace(/\/(reels|tagged|saved)\/?$/, ''));
  if (!m) return null;
  const username = m[1];
  const reserved = ['p', 'reel', 'reels', 'explore', 'stories', 'accounts'];
  return reserved.includes(username) ? null : username;
}

export function canonicalReelUrl(code: string): string {
  return `https://www.instagram.com/reel/${code}/`;
}

export function canonicalProfileUrl(username: string): string {
  return `https://www.instagram.com/${username}/`;
}

const IG_B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** Instagram shortcodes are base64-encoded numeric media IDs (for instagram:// deep links). */
export function reelCodeToMediaId(code: string): string {
  let id = BigInt(0);
  for (const ch of code) {
    const v = IG_B64.indexOf(ch);
    if (v === -1) return '';
    id = id * BigInt(64) + BigInt(v);
  }
  return id.toString();
}
