import { HE } from './hebrewTexts';
import { W, H, GOLD, GOLD_DIM, SITE, cssVar, loadFonts, drawBackground } from './storyImage';

/**
 * Empty branded 1080×1920 story template — the Orayta frame, header and
 * footer with a clear center, so the user drops their own content on top in
 * Instagram and every post stays on-brand.
 */
export async function renderStoryTemplate(): Promise<Blob> {
  const serif = cssVar('--font-frank', "'Frank Ruhl Libre', Georgia, serif");
  const sans = cssVar('--font-heebo', "'Heebo', system-ui, sans-serif");
  await loadFonts(serif, sans);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas 2d context unavailable');
  ctx.direction = 'rtl';
  ctx.textAlign = 'center';

  drawBackground(ctx, '217,181,108');

  // Header — brand name + tagline inside Instagram's top safe zone
  ctx.fillStyle = GOLD;
  ctx.font = `700 96px ${serif}`;
  ctx.fillText(HE.APP_NAME, W / 2, 348);
  ctx.fillStyle = 'rgba(217,181,108,0.8)';
  ctx.font = `600 34px ${sans}`;
  ctx.fillText(`✦   ${HE.APP_SUBTITLE}   ✦`, W / 2, 416);

  // Corner sparks framing the empty center without intruding on it
  ctx.fillStyle = 'rgba(217,181,108,0.4)';
  ctx.font = `44px ${sans}`;
  ctx.fillText('✦', 165, 580);
  ctx.fillText('✦', W - 165, 580);
  ctx.fillText('✦', 165, H - 560);
  ctx.fillText('✦', W - 165, H - 560);

  // Footer — divider, invitation line, address (same as shared story cards)
  ctx.strokeStyle = 'rgba(217,181,108,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, H - 345);
  ctx.lineTo(W / 2 + 140, H - 345);
  ctx.stroke();
  ctx.fillStyle = 'rgba(246,238,217,0.75)';
  ctx.font = `600 30px ${sans}`;
  ctx.fillText(HE.STORY_JOIN_LINE, W / 2, H - 296);
  ctx.fillStyle = GOLD_DIM;
  ctx.font = `600 32px ${sans}`;
  ctx.fillText(SITE, W / 2, H - 250);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
