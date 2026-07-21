/**
 * Global WhatsApp-share counter. Fire-and-forget: never blocks or breaks
 * the share flow itself, even if the network call fails.
 */
export function trackShare(): void {
  void fetch('/api/shares', { method: 'POST' }).catch(() => {});
}
