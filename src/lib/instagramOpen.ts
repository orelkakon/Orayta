import { reelCodeToMediaId } from '@/lib/instagram';

/**
 * Open a reel in the Instagram app when on a phone (straight to the video),
 * falling back to the web page only if the app didn't take over.
 */
export function openReelInInstagram(code: string): void {
  const webUrl = `https://www.instagram.com/p/${code}/`;
  const mediaId = reelCodeToMediaId(code);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  if (!isMobile || !mediaId) { window.open(webUrl, '_blank', 'noopener'); return; }
  const timer = setTimeout(() => {
    if (document.visibilityState === 'visible') window.open(webUrl, '_blank', 'noopener');
  }, 1600);
  document.addEventListener('visibilitychange', () => clearTimeout(timer), { once: true });
  window.location.href = `instagram://media?id=${mediaId}`;
}
