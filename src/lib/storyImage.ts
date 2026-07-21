/**
 * Renders a branded 1080×1920 Instagram-story image on an offscreen canvas.
 * Pure client-side — no upload, no API. The blob is handed to the native
 * share sheet (see storyShare.ts), where the user picks Instagram → Story.
 */
export interface StoryContent {
  badge: string;
  title?: string;
  text: string;
  source?: string;
}

const W = 1080;
const H = 1920;
const GOLD = '#d9b56c';
const GOLD_DIM = 'rgba(217,181,108,0.55)';
const CREAM = '#f6eed9';
const SITE = 'orayta-eight.vercel.app';

function cssVar(name: string, fallback: string): string {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

async function loadFonts(serif: string, sans: string): Promise<void> {
  try {
    await Promise.all([
      document.fonts.load(`500 52px ${serif}`),
      document.fonts.load(`700 80px ${serif}`),
      document.fonts.load(`600 34px ${sans}`),
    ]);
    await document.fonts.ready;
  } catch {
    // fall through — system fallback fonts still render fine
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const para of text.split('\n')) {
    let line = '';
    for (const word of para.split(/\s+/).filter(Boolean)) {
      const probe = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(probe).width > maxWidth) {
        lines.push(line);
        line = word;
      } else {
        line = probe;
      }
    }
    lines.push(line);
  }
  return lines.filter((l, i) => l !== '' || i > 0);
}

function roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, '#171310');
  bg.addColorStop(0.5, '#221b12');
  bg.addColorStop(1, '#14100c');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = ctx.createRadialGradient(W / 2, 220, 60, W / 2, 220, 700);
  glow.addColorStop(0, 'rgba(217,181,108,0.14)');
  glow.addColorStop(1, 'rgba(217,181,108,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  ctx.strokeStyle = GOLD_DIM;
  ctx.lineWidth = 3;
  roundedRect(ctx, 54, 54, W - 108, H - 108, 36);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(217,181,108,0.22)';
  ctx.lineWidth = 1.5;
  roundedRect(ctx, 74, 74, W - 148, H - 148, 26);
  ctx.stroke();
}

// Body area: below the badge, above the link chip.
const BODY_TOP = 380;
const BODY_HEIGHT = 1240;

/**
 * Instagram-style link chip drawn ON the image (not tappable — Instagram
 * forbids programmatic link stickers). The user places the real Link
 * sticker over it; the URL is pre-copied to the clipboard in storyShare.
 */
function drawLinkChip(ctx: CanvasRenderingContext2D, sans: string): void {
  ctx.font = `600 34px ${sans}`;
  const label = `🔗 ${SITE}`;
  const textW = ctx.measureText(label).width;
  const padX = 38;
  const chipW = textW + padX * 2;
  const chipH = 84;
  const x = (W - chipW) / 2;
  const y = H - 200;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.35)';
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = 'rgba(255,255,255,0.96)';
  roundedRect(ctx, x, y, chipW, chipH, chipH / 2);
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = '#1a5fb4';
  ctx.fillText(label, W / 2, y + 55);
}

export async function renderStoryImage(content: StoryContent): Promise<Blob> {
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

  drawBackground(ctx);

  ctx.fillStyle = GOLD;
  ctx.font = `700 84px ${serif}`;
  ctx.fillText('אורייתא', W / 2, 238);
  ctx.fillStyle = GOLD_DIM;
  ctx.font = `600 34px ${sans}`;
  ctx.fillText(`✦   ${content.badge}   ✦`, W / 2, 308);

  // Largest font whose wrapped block fits the body area — long text keeps
  // shrinking (down to 28px) instead of leaving empty space top and bottom.
  const sourceGap = content.source ? 88 : 0;
  let size = 68;
  let lineHeight = 0;
  let titleGap = 0;
  let lines: string[] = [];
  for (;; size -= 2) {
    lineHeight = Math.round(size * 1.5);
    titleGap = content.title ? lineHeight + 26 : 0;
    ctx.font = `500 ${size}px ${serif}`;
    lines = wrapText(ctx, content.text, W - 200);
    const fits = titleGap + lines.length * lineHeight + sourceGap <= BODY_HEIGHT;
    if (fits || size <= 28) break;
  }
  const maxLines = Math.max(1, Math.floor((BODY_HEIGHT - titleGap - sourceGap) / lineHeight));
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    lines[maxLines - 1] = `${lines[maxLines - 1]}…`;
  }

  const blockH = titleGap + lines.length * lineHeight + sourceGap;
  let y = BODY_TOP + Math.max(0, Math.round((BODY_HEIGHT - blockH) / 2)) + Math.round(lineHeight * 0.75);

  if (content.title) {
    ctx.fillStyle = GOLD;
    ctx.font = `700 ${Math.min(size + 6, 58)}px ${serif}`;
    ctx.fillText(content.title, W / 2, y, W - 280);
    y += titleGap;
  }

  ctx.fillStyle = CREAM;
  ctx.font = `500 ${size}px ${serif}`;
  for (const line of lines) {
    ctx.fillText(line, W / 2, y);
    y += lineHeight;
  }

  if (content.source) {
    y += 34;
    ctx.fillStyle = GOLD;
    ctx.font = `600 36px ${sans}`;
    ctx.fillText(`— ${content.source}`, W / 2, y, W - 280);
  }

  ctx.strokeStyle = 'rgba(217,181,108,0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 140, H - 254);
  ctx.lineTo(W / 2 + 140, H - 254);
  ctx.stroke();
  ctx.fillStyle = GOLD_DIM;
  ctx.font = `600 30px ${sans}`;
  ctx.fillText('✦', W / 2, H - 244);
  drawLinkChip(ctx, sans);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
  });
}
