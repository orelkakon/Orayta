export type ShareKind = 'wa' | 'story';

/**
 * Global share counters, split by channel: WhatsApp/native ('wa') and
 * Instagram stories ('story'). Fire-and-forget: never blocks or breaks
 * the share flow itself, even if the network call fails.
 */
export function trackShare(kind: ShareKind = 'wa'): void {
  const safe: ShareKind = kind === 'story' ? 'story' : 'wa';
  void fetch('/api/shares', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ kind: safe }),
  }).catch(() => {});
}
