import type { Book, Chidush, Citation, FeedGematriaData, FeedItem, FeedSikumData, Rabbi } from '@/types';
import { HE } from '@/lib/hebrewTexts';
import { RLM, clip } from '@/lib/siteUrl';
import { feedItemUrl } from '@/lib/feedLink';
import { trackShare } from '@/lib/shareCounter';

/** The WhatsApp-ready text for a feed item, signed with the site link. */
export function feedShareText(item: FeedItem): string {
  // The post's own link: its preview shows this post and opens the feed on it.
  const sig = `\n— ${HE.APP_NAME}\n${feedItemUrl(item.type, item.id)}`;
  const d = item.data;
  let text = sig;
  if (item.type === 'citation') {
    const c = d as Citation; const l = c.locations[0];
    text = `"${clip(c.content, 250)}"${l ? ` (${HE.HOME_FEED_DAF(l.masechet, l.daf, null)})` : ''}${sig}`;
  } else if (item.type === 'rabbi') {
    const r = d as Rabbi; text = `${r.name} (${r.datePeriod})\n${clip(r.bio, 200)}${sig}`;
  } else if (item.type === 'chidush') {
    const c = d as Chidush; text = `${clip(c.text, 250)}${c.source ? `\n(${c.source})` : ''}${sig}`;
  } else if (item.type === 'book') {
    const b = d as Book; text = `${b.title} — ${b.author}${sig}`;
  } else if (item.type === 'gematria') {
    const g = d as FeedGematriaData; text = `${g.word} = ${HE.HOME_FEED_GEMATRIA(g.value)}${sig}`;
  } else if (item.type === 'sikum') {
    const s = d as FeedSikumData; text = `${s.bookName}${s.title ? ` — ${s.title}` : ''}\n${clip(s.text, 250)}${sig}`;
  }
  return `${RLM}${text}`;
}

/** Native share sheet when available, WhatsApp otherwise. */
export function shareText(text: string): void {
  const toWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text, title: HE.FEED_TITLE }).then(() => trackShare()).catch(err => {
      if ((err as Error)?.name === 'AbortError') return;
      trackShare();
      toWhatsApp();
    });
  } else {
    trackShare();
    toWhatsApp();
  }
}

/** Render an element to a PNG and share it (or download it). */
export async function shareElementImage(el: HTMLElement): Promise<void> {
  const { default: html2canvas } = await import('html2canvas');
  const canvas = await html2canvas(el, { useCORS: true, scale: 2, backgroundColor: null });
  await new Promise<void>(resolve => canvas.toBlob(async blob => {
    if (!blob) { resolve(); return; }
    const file = new File([blob], 'orayta.png', { type: 'image/png' });
    const download = () => {
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'orayta.png'; a.click();
    };
    if (navigator.canShare?.({ files: [file] })) {
      try { await navigator.share({ files: [file] }); }
      catch (err) { if ((err as Error)?.name !== 'AbortError') download(); }
    } else {
      download();
    }
    resolve();
  }));
}
