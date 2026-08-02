export type ShareKind = 'wa' | 'story' | 'tg';

/**
 * Global share counters, split by channel: WhatsApp/native ('wa'),
 * Instagram stories ('story') and Telegram ('tg'). Fire-and-forget: never
 * blocks or breaks the share flow itself, even if the network call fails.
 */
export function trackShare(kind: ShareKind = 'wa'): void {
  const safe: ShareKind = kind === 'story' || kind === 'tg' ? kind : 'wa';
  void fetch('/api/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: safe }),
  }).catch(() => {});
}
