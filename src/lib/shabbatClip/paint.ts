import { theme } from '@/lib/theme';
import { BEAD_FILL, ENGRAVE, METAL_STOPS, RIM_STOPS, STICK_PARTS, StickPart, WAX_STOPS, WICK } from './candlestick';
import { FLAME_ROOT, FLAME_STOPS, GLOW_STOPS, HALO_STOPS, NIGHT_STOPS, WINE_GLOW } from './palette';

/**
 * Canvas painters for the Shabbat clip: the night, its stars and gilded
 * frame, the candlesticks (same geometry as the hero), living flames and
 * embers. Every painter takes the clip time `t` (seconds) so a frame is a
 * pure function of time — the encoder can render faster than real time.
 */
type Ctx = CanvasRenderingContext2D;
export const W = 1080;
export const H = 1920;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
/** 0→1 across [a, b]. */
export const seg = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));
export const easeOut = (k: number) => 1 - Math.pow(1 - k, 3);
export const easeBack = (k: number) => 1 + 2.4 * Math.pow(k - 1, 3) + 1.4 * Math.pow(k - 1, 2);

/** Deterministic noise in [0, 1) — the same stars in every frame. */
const rand = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

function addStops(g: CanvasGradient, stops: [number, string][]) { stops.forEach(([o, c]) => g.addColorStop(o, c)); return g; }

export function paintNight(ctx: Ctx, t: number) {
  ctx.fillStyle = addStops(ctx.createLinearGradient(0, 0, W * 0.4, H), NIGHT_STOPS);
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = addStops(ctx.createRadialGradient(0, H * 1.05, 0, 0, H * 1.05, W * 1.1), [[0, WINE_GLOW], [1, 'rgba(0,0,0,0)']]);
  ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 90; i++) {
    const x = rand(i) * W, y = rand(i + 500) * H * 0.62;
    const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * (1.2 + rand(i + 900) * 2) + i));
    ctx.globalAlpha = seg(t, 0.1, 1.2) * tw * (0.25 + rand(i + 77) * 0.55);
    ctx.fillStyle = theme.game.goldInk;
    ctx.beginPath(); ctx.arc(x, y, 1 + rand(i + 33) * 2.2, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

/** A double gilded frame drawn in like a pen stroke, with diamonds on its axis. */
export function paintFrame(ctx: Ctx, t: number) {
  const k = easeOut(seg(t, 0.15, 1.6));
  ctx.save();
  ctx.strokeStyle = theme.game.gold;
  for (const [inset, width, alpha, r] of [[46, 3, 0.75, 40], [66, 1.5, 0.35, 28]] as const) {
    const len = 2 * (W - 2 * inset + H - 2 * inset);
    ctx.globalAlpha = alpha; ctx.lineWidth = width;
    ctx.setLineDash([len * k, len]);
    roundRect(ctx, inset, inset, W - 2 * inset, H - 2 * inset, r); ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.globalAlpha = seg(t, 1.2, 1.8);
  ctx.fillStyle = theme.game.goldLight;
  for (const [x, y] of [[W / 2, 46], [W / 2, H - 46], [46, H / 2], [W - 46, H / 2]]) {
    ctx.beginPath(); ctx.moveTo(x, y - 13); ctx.lineTo(x + 9, y); ctx.lineTo(x, y + 13); ctx.lineTo(x - 9, y); ctx.fill();
  }
  ctx.restore();
}

/** The warm light of the candles over the whole frame. */
export function paintGlow(ctx: Ctx, t: number, x: number, y: number, at: number) {
  const k = easeOut(seg(t, at, at + 1.3)) * (0.86 + 0.14 * Math.sin(t * 1.7));
  if (k <= 0) return;
  ctx.save(); ctx.globalAlpha = k;
  // A wide wash and a brighter core around the flames.
  for (const r of [W * 1.05, W * 0.5]) {
    ctx.fillStyle = addStops(ctx.createRadialGradient(x, y, 0, x, y, r), GLOW_STOPS);
    ctx.fillRect(0, 0, W, H);
  }
  ctx.restore();
}

function partFill(ctx: Ctx, p: StickPart): string | CanvasGradient {
  const grad = (stops: [number, string][]) => addStops(ctx.createLinearGradient(-p.hw, 0, p.hw, 0), stops);
  if (p.kind === 'metal') return grad(METAL_STOPS);
  if (p.kind === 'rim') return grad(RIM_STOPS);
  if (p.kind === 'wax' || p.kind === 'drip') return grad(WAX_STOPS);
  return BEAD_FILL;
}

/** One candlestick, candle top at (x, y), drawn `s` times its hero size. */
export function paintCandlestick(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y); ctx.scale(s, s); ctx.lineCap = 'round';
  for (const p of STICK_PARTS) {
    const path = new Path2D(p.d);
    if (p.kind === 'engrave' || p.kind === 'wick') {
      ctx.strokeStyle = p.kind === 'wick' ? WICK : ENGRAVE;
      ctx.lineWidth = p.kind === 'wick' ? 0.9 : 0.5;
      ctx.stroke(path);
    } else {
      ctx.fillStyle = partFill(ctx, p); ctx.fill(path);
      if (p.kind === 'metal') { ctx.strokeStyle = ENGRAVE; ctx.lineWidth = 0.35; ctx.stroke(path); }
    }
  }
  ctx.restore();
}

/** A flame standing on (x, y), `h` tall, lit at `at` seconds, flickering by its own seed. */
export function paintFlame(ctx: Ctx, t: number, x: number, y: number, h: number, at: number, seed: number) {
  const k = seg(t, at, at + 0.55);
  if (k <= 0) return;
  // A ring of light at the moment it catches.
  const b = seg(t, at, at + 0.7);
  if (b < 1) {
    ctx.save(); ctx.globalAlpha = (1 - b) * 0.9;
    ctx.fillStyle = addStops(ctx.createRadialGradient(x, y - h * 0.4, 0, x, y - h * 0.4, h * (0.4 + b * 2.6)), [[0, theme.game.goldInk], [0.5, theme.game.goldGlow], [1, 'rgba(0,0,0,0)']]);
    ctx.fillRect(x - h * 3.2, y - h * 3.6, h * 6.4, h * 6.4);
    ctx.restore();
  }
  const grow = easeBack(k);
  const sway = Math.sin(t * 7.3 + seed) * 0.07 + Math.sin(t * 13.1 + seed * 2.3) * 0.035;
  const fh = h * grow * (1 + Math.sin(t * 9.7 + seed * 1.7) * 0.06);
  const fw = h * 0.27 * grow * (1 - Math.sin(t * 9.7 + seed * 1.7) * 0.05);
  const breathe = 0.75 + 0.25 * Math.sin(t * 2.3 + seed);
  ctx.save();
  ctx.globalAlpha = clamp01(k * 1.4) * breathe;
  ctx.fillStyle = addStops(ctx.createRadialGradient(x, y - fh * 0.45, 0, x, y - fh * 0.45, h * 1.9), HALO_STOPS);
  ctx.fillRect(x - h * 2, y - h * 2.5, h * 4, h * 4);
  ctx.globalAlpha = clamp01(k * 1.4);
  const tipX = x + fh * sway;
  ctx.beginPath();
  ctx.moveTo(tipX, y - fh);
  ctx.bezierCurveTo(x + fw * 0.35, y - fh * 0.62, x + fw, y - fh * 0.32, x + fw * 0.82, y - fh * 0.12);
  ctx.bezierCurveTo(x + fw * 0.6, y + fh * 0.04, x - fw * 0.6, y + fh * 0.04, x - fw * 0.82, y - fh * 0.12);
  ctx.bezierCurveTo(x - fw, y - fh * 0.32, x - fw * 0.35, y - fh * 0.62, tipX, y - fh);
  ctx.fillStyle = addStops(ctx.createRadialGradient(x, y - fh * 0.26, 0, x, y - fh * 0.26, fh * 0.78), FLAME_STOPS);
  ctx.fill();
  ctx.fillStyle = FLAME_ROOT;
  ctx.beginPath(); ctx.ellipse(x, y - fh * 0.06, fw * 0.42, fh * 0.09, 0, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/** Embers drifting up from a flame, after `at`. */
export function paintEmbers(ctx: Ctx, t: number, x: number, y: number, at: number, seed: number) {
  if (t < at) return;
  ctx.save();
  ctx.fillStyle = theme.game.goldLight;
  for (let i = 0; i < 7; i++) {
    const period = 2.4 + rand(seed + i) * 1.6;
    const p = ((t - at) / period + rand(seed + i + 40)) % 1;
    const rise = p * (180 + rand(seed + i + 9) * 160);
    const dx = Math.sin(p * 5 + i) * 18 + (rand(seed + i + 3) - 0.5) * 60 * p;
    ctx.globalAlpha = Math.sin(p * Math.PI) * 0.85 * seg(t, at, at + 0.8);
    ctx.beginPath(); ctx.arc(x + dx, y - 40 - rise, 2.6 * (1 - p * 0.6), 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
