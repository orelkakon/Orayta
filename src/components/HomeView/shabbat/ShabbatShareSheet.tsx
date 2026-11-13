'use client';

import { useMemo, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SITE_URL } from '@/lib/siteUrl';
import { trackShare } from '@/lib/shareCounter';
import type { ShabbatStatus } from '@/lib/shabbat';
import { clipData, shareText } from '@/lib/shabbatClip/data';
import Sheet from '@/components/ui/Sheet';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import { useShabbatClip } from './useShabbatClip';

/**
 * Friday's share sheet: the Shabbat clip (parasha, date, six cities' times,
 * candles, "שבת שלום") is made on the device while its frames play in the
 * preview, then shared as a file through the native sheet — WhatsApp status,
 * Instagram story, anything — or saved. The times also go out as a WhatsApp
 * message (a real wa.me link, so iOS never blocks it).
 */
const glow = keyframes`from { box-shadow: 0 0 0 1px ${theme.game.glassLine}, 0 18px 40px -16px ${theme.game.goldGlow}; } to { box-shadow: 0 0 0 1px ${theme.game.gold}, 0 18px 50px -10px ${theme.game.goldGlow}; }`;

const Preview = styled.div`
  position: relative; overflow: hidden; margin: 0 auto;
  height: min(52dvh, 520px); aspect-ratio: 9 / 16; max-width: 100%;
  border-radius: 22px; background: ${theme.game.stageSolid};
  box-shadow: 0 0 0 1px ${theme.game.glassLine}, 0 18px 40px -16px ${theme.game.goldGlow};
  &[data-ready='true'] { animation: ${glow} 1.6s ease-in-out 2 alternate both; }
  canvas, video, img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
`;
const Making = styled.div`
  position: absolute; inset: auto 0 0; padding: ${theme.spacing.xl} ${theme.spacing.md} ${theme.spacing.md};
  background: linear-gradient(to top, ${theme.game.stageSolid}, transparent);
  color: ${theme.game.ink}; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
`;
const MakingRow = styled.div`display: flex; justify-content: space-between; font-variant-numeric: tabular-nums;`;
const Bar = styled.div`
  height: 4px; border-radius: ${theme.radii.pill}; background: ${theme.game.glassHi}; overflow: hidden;
  > i { display: block; height: 100%; background: ${theme.gilded.fill}; transform-origin: right center; transition: transform 0.2s linear; }
`;
const Note = styled.p`
  margin-top: ${theme.spacing.ms}; text-align: center;
  font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textLight};
`;
const Footer = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Row = styled.div`display: grid; grid-template-columns: 1fr 1fr; gap: ${theme.spacing.sm};`;

interface Props { open: boolean; status: ShabbatStatus; parasha: string | null; onClose: () => void }

export default function ShabbatShareSheet({ open, status, parasha, onClose }: Props) {
  const data = useMemo(() => clipData(status.cities, parasha), [status.cities, parasha]);
  const [canvas, setCanvas] = useState<HTMLCanvasElement | null>(null);
  const clip = useShabbatClip(open, canvas, data);
  const ready = clip.phase === 'ready' && clip.file && clip.url;
  const wa = `https://wa.me/?text=${encodeURIComponent(shareText(data, SITE_URL))}`;

  const save = () => {
    if (!clip.url || !clip.file) return;
    const a = document.createElement('a');
    a.href = clip.url; a.download = clip.file.name; a.click();
  };

  // Synchronous up to navigator.share — iOS needs the tap's activation.
  const share = () => {
    if (!clip.file) return;
    const file = new File([clip.file.blob], clip.file.name, { type: clip.file.blob.type });
    if (!navigator.canShare?.({ files: [file] })) { save(); return; }
    navigator.share({ files: [file], title: HE.SHABBAT_SHARE_TITLE })
      .then(() => trackShare('story'))
      .catch((e: Error) => { if (e.name !== 'AbortError') save(); });
  };

  const footer = (
    <Footer>
      <Button $variant="gold" $size="lg" $block disabled={!ready} onClick={share}>
        <LineIcon name="share" size={20} strokeWidth={2} />
        {clip.file?.kind === 'image' ? HE.SHABBAT_SHARE_SEND_IMAGE : HE.SHABBAT_SHARE_SEND}
      </Button>
      <Row>
        <Button $variant="secondary" $block disabled={!ready} onClick={save}>
          <LineIcon name="download" size={18} />{HE.SHABBAT_SHARE_SAVE}
        </Button>
        <ButtonAnchor $variant="secondary" $block href={wa} target="_blank" rel="noopener" onClick={() => trackShare('wa')}>
          <LineIcon name="send" size={18} />{HE.SHABBAT_SHARE_WA}
        </ButtonAnchor>
      </Row>
    </Footer>
  );

  const video = ready && clip.file?.kind === 'video';
  return (
    <Sheet open={open} onClose={onClose} title={HE.SHABBAT_SHARE_TITLE} footer={footer} maxWidth={460}>
      <Preview data-ready={ready ? 'true' : 'false'} role="img" aria-label={HE.SHABBAT_SHARE_PREVIEW_ARIA}>
        <canvas ref={setCanvas} aria-hidden="true" style={{ visibility: video ? 'hidden' : 'visible' }} />
        {video && <video src={clip.url ?? undefined} autoPlay muted loop playsInline aria-hidden="true" />}
        {clip.phase === 'making' && (
          <Making aria-live="polite">
            <MakingRow><span>{HE.SHABBAT_SHARE_MAKING}</span><span>{Math.round(clip.progress * 100)}%</span></MakingRow>
            <Bar><i style={{ transform: `scaleX(${clip.progress})` }} /></Bar>
          </Making>
        )}
      </Preview>
      {clip.phase === 'error' ? (
        <Note>
          {HE.SHABBAT_SHARE_ERROR} · <Button $variant="ghost" $size="sm" onClick={clip.retry}>{HE.SHABBAT_SHARE_RETRY}</Button>
        </Note>
      ) : (
        <Note>{clip.file?.kind === 'image' ? HE.SHABBAT_SHARE_IMAGE_NOTE : HE.SHABBAT_SHARE_HINT}</Note>
      )}
    </Sheet>
  );
}
