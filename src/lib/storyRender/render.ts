/* Server-only: the story images drawn by the same code as the browser's
   share buttons, on @napi-rs/canvas (Skia) with the fonts bundled in
   assets/fonts (traced into the function by next.config.js). */
import fs from 'fs';
import path from 'path';
import { createCanvas, GlobalFonts, Path2D as SkiaPath2D } from '@napi-rs/canvas';
import { drawStoryCard, H, W, type StoryContent, type StoryFonts } from '@/lib/storyImage';
import { DURATION, drawFrame } from '@/lib/shabbatClip/scene';
import { setPathMaker } from '@/lib/shabbatClip/paint';
import type { ClipData } from '@/lib/shabbatClip/data';

const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');

/** The site's fonts; DejaVu Sans supplies what they lack (✦), as the
 *  phone's system font does in the browser. */
export const SERVER_FONTS: StoryFonts = {
  serif: '"Frank Ruhl Libre", "DejaVu Sans"',
  sans: 'Heebo, "DejaVu Sans"',
};

let fontsReady = false;
function ensureFonts(): void {
  if (fontsReady) return;
  for (const f of fs.readdirSync(FONT_DIR)) {
    if (f.endsWith('.ttf')) GlobalFonts.registerFromPath(path.join(FONT_DIR, f));
  }
  fontsReady = true;
}

/** PNG bytes as a plain ArrayBuffer — what a Response body accepts. */
async function story(draw: (ctx: CanvasRenderingContext2D) => void): Promise<ArrayBuffer> {
  ensureFonts();
  const canvas = createCanvas(W, H);
  // Skia's context implements the same 2D API the shared drawing code uses.
  draw(canvas.getContext('2d') as unknown as CanvasRenderingContext2D);
  const png = await canvas.encode('png');
  return png.buffer.slice(png.byteOffset, png.byteOffset + png.byteLength) as ArrayBuffer;
}

/** The "אורייתא יומי" card, as the "שתף בסטורי" button on /today draws it. */
export const renderDailyPng = (content: StoryContent) =>
  story(ctx => drawStoryCard(ctx, content, SERVER_FONTS));

/** The last frame of the Friday Shabbat clip. */
export function renderShabbatPng(data: ClipData): Promise<ArrayBuffer> {
  setPathMaker(d => new SkiaPath2D(d) as unknown as Path2D);
  return story(ctx => drawFrame(ctx, DURATION, data, SERVER_FONTS));
}
