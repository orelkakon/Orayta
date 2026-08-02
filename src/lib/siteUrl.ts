/** Canonical public URL of the site — single source of truth for all share flows. */
export const SITE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orayta-eight.vercel.app';

/** RIGHT-TO-LEFT MARK — prefix share texts so WhatsApp renders Hebrew lines RTL. */
export const RLM = '‏';

/** Truncates to n chars, appending an ellipsis only when actually cut. */
export function clip(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}

/** Native share with WhatsApp fallback; user-cancel (AbortError) is silent. */
export async function shareTextSmart(text: string, title?: string): Promise<void> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text, title });
      return;
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}
