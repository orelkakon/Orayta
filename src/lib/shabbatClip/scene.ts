import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SITE } from '@/lib/storyImage';
import { WICK_TIP_Y } from './candlestick';
import { ClipData, dateLine } from './data';
import {
  H, W, easeOut, paintCandlestick, paintEmbers, paintFlame, paintFrame, paintGlow, paintNight, roundRect, seg,
} from './paint';

/**
 * One frame of the Shabbat clip (1080×1920, 9:16), as a function of time:
 * the gilded frame draws in, the parasha and date rise, the candles catch
 * right then left and their light fills the night, "שבת שלום" arrives with a
 * pass of light, then the cities' times slide in row by row; the flames keep
 * living until the end. The header and the table stay inside Instagram's
 * story safe zone.
 */
export const DURATION = 8;
export interface Fonts { serif: string; sans: string }

type Ctx = CanvasRenderingContext2D;
const CX = W / 2;
const CANDLE_TOP = 560;
const SCALE = 3;
const STICKS = [{ x: CX + 135, at: 1.0, seed: 1 }, { x: CX - 135, at: 1.45, seed: 7 }];
const FLAME_H = 64;
const PANEL = { x: 96, y: 1130, w: W - 192, h: 455 };
const COL = { city: W - 150, candles: 590, ends: 280 };
const ROW_Y = 1262;
const ROW_H = 58;
const g = theme.game;

/** Text that fades in while rising by `lift` px over [a, b]. */
function rise(ctx: Ctx, t: number, a: number, b: number, lift: number, draw: () => void) {
  const k = easeOut(seg(t, a, b));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha *= k; ctx.translate(0, lift * (1 - k)); draw(); ctx.restore();
}

function text(ctx: Ctx, s: string, x: number, y: number, font: string, fill: string | CanvasGradient, align: CanvasTextAlign = 'center') {
  ctx.font = font; ctx.fillStyle = fill; ctx.textAlign = align; ctx.fillText(s, x, y);
}

function header(ctx: Ctx, t: number, d: ClipData, f: Fonts) {
  rise(ctx, t, 0.3, 1.0, 0, () => text(ctx, HE.SHABBAT_CLIP_BSD, W - 110, 172, `600 30px ${f.sans}`, g.goldLight, 'right'));
  rise(ctx, t, 0.35, 1.1, 24, () => text(ctx, `✦  ${HE.SHABBAT_CLIP_KICKER}  ✦`, CX, 290, `700 38px ${f.sans}`, g.gold));
  if (d.parasha) rise(ctx, t, 0.5, 1.3, 30, () => text(ctx, d.parasha as string, CX, 378, `700 80px ${f.serif}`, g.goldLight));
  rise(ctx, t, 0.65, 1.45, 24, () => text(ctx, dateLine(d), CX, d.parasha ? 440 : 380, `500 36px ${f.sans}`, g.inkMuted));
}

function title(ctx: Ctx, t: number, f: Fonts) {
  rise(ctx, t, 2.0, 2.9, 46, () => {
    ctx.font = `700 156px ${f.serif}`;
    const half = ctx.measureText(HE.SHABBAT_CLIP_TITLE).width / 2;
    // A band of light crosses the words once (right to left, like the reading).
    const s = seg(t, 2.9, 4.1);
    const band = CX + half + 120 - s * (2 * half + 240);
    const fill = ctx.createLinearGradient(CX + half, 0, CX - half, 0);
    const at = (x: number) => Math.min(1, Math.max(0, (CX + half - x) / (2 * half)));
    fill.addColorStop(0, g.ink);
    if (s > 0 && s < 1) {
      fill.addColorStop(Math.max(0, at(band) - 0.12), g.ink);
      fill.addColorStop(at(band), g.goldInk);
      fill.addColorStop(Math.min(1, at(band) + 0.12), g.ink);
    }
    fill.addColorStop(1, g.ink);
    ctx.shadowColor = g.goldGlow; ctx.shadowBlur = 40;
    text(ctx, HE.SHABBAT_CLIP_TITLE, CX, 1012, ctx.font, fill);
    ctx.shadowBlur = 0;
  });
  rise(ctx, t, 2.45, 3.2, 30, () => text(ctx, HE.SHABBAT_CLIP_SUB, CX, 1088, `600 68px ${f.serif}`, g.gold));
}

function threeStars(ctx: Ctx, x: number, y: number) {
  ctx.fillStyle = g.goldLight;
  for (const [dx, dy, r] of [[-12, 4, 7], [6, -6, 9], [2, 12, 4]]) {
    const cx = x + dx, cy = y + dy;
    ctx.beginPath();
    ctx.moveTo(cx, cy - r); ctx.quadraticCurveTo(cx, cy, cx + r, cy); ctx.quadraticCurveTo(cx, cy, cx, cy + r);
    ctx.quadraticCurveTo(cx, cy, cx - r, cy); ctx.quadraticCurveTo(cx, cy, cx, cy - r); ctx.fill();
  }
}

function table(ctx: Ctx, t: number, d: ClipData, f: Fonts) {
  const k = easeOut(seg(t, 2.9, 3.5));
  if (k <= 0) return;
  ctx.save();
  ctx.globalAlpha = k;
  roundRect(ctx, PANEL.x, PANEL.y, PANEL.w, PANEL.h, 34);
  ctx.fillStyle = g.glass; ctx.fill();
  ctx.strokeStyle = g.glassLine; ctx.lineWidth = 2; ctx.stroke();
  text(ctx, HE.SHABBAT_CLIP_CITY, COL.city, 1184, `700 32px ${f.sans}`, g.gold, 'right');
  text(ctx, HE.SHABBAT_CLIP_IN, COL.candles, 1184, `700 32px ${f.sans}`, g.gold);
  text(ctx, HE.SHABBAT_CLIP_OUT, COL.ends, 1184, `700 32px ${f.sans}`, g.gold);
  paintFlame(ctx, 99, COL.candles + 112, 1186, 30, 0, 3);
  threeStars(ctx, COL.ends + 96, 1172);
  ctx.fillStyle = g.glassLine; ctx.fillRect(PANEL.x + 34, 1210, PANEL.w - 68, 2);
  ctx.restore();

  d.rows.forEach((r, i) => {
    const e = easeOut(seg(t, 3.25 + i * 0.16, 3.8 + i * 0.16));
    if (e <= 0) return;
    const y = ROW_Y + i * ROW_H;
    ctx.save();
    ctx.globalAlpha = e; ctx.translate(46 * (1 - e), 0);
    if (i === 0) { roundRect(ctx, PANEL.x + 18, y - 42, PANEL.w - 36, 56, 18); ctx.fillStyle = g.glassHi; ctx.fill(); }
    text(ctx, r.city, COL.city, y, `600 44px ${f.serif}`, g.ink, 'right');
    text(ctx, r.candles, COL.candles, y, `700 50px ${f.serif}`, g.ink);
    text(ctx, r.ends, COL.ends, y, `700 50px ${f.serif}`, g.goldLight);
    ctx.restore();
  });
}

function footer(ctx: Ctx, t: number, f: Fonts) {
  rise(ctx, t, 4.6, 5.4, 16, () => {
    text(ctx, HE.SHABBAT_CLIP_FOOT, CX, 1672, `700 40px ${f.serif}`, g.gold);
    text(ctx, SITE, CX, 1724, `500 30px ${f.sans}`, g.inkFaint);
  });
}

export function drawFrame(ctx: Ctx, t: number, d: ClipData, f: Fonts) {
  ctx.direction = 'rtl';
  ctx.textBaseline = 'alphabetic';
  paintNight(ctx, t);
  paintGlow(ctx, t, CX, CANDLE_TOP - 40, 1.5);
  paintFrame(ctx, t);
  header(ctx, t, d, f);
  rise(ctx, t, 0.5, 1.2, 40, () => STICKS.forEach(s => paintCandlestick(ctx, s.x, CANDLE_TOP, SCALE)));
  for (const s of STICKS) {
    const tipY = CANDLE_TOP + WICK_TIP_Y * SCALE + 3;
    paintFlame(ctx, t, s.x, tipY, FLAME_H, s.at, s.seed);
    paintEmbers(ctx, t, s.x, tipY, s.at + 0.9, s.seed * 13);
  }
  title(ctx, t, f);
  table(ctx, t, d, f);
  footer(ctx, t, f);
}

export { H, W };
