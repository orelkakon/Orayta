import { cssVar, loadFonts } from '@/lib/storyImage';
import { ClipData } from './data';
import { DURATION, Fonts, H, W, drawFrame } from './scene';

/**
 * Renders the Shabbat clip on the device — nothing is uploaded. Where
 * WebCodecs can encode H.264 (iOS 16.4+, Chrome, Edge) the frames are drawn
 * faster than real time and muxed into an MP4 that WhatsApp and Instagram
 * accept; elsewhere the last frame becomes a PNG. The canvas passed in is
 * the one on screen, so the preview plays while the clip is being made.
 */
export interface ClipFile { blob: Blob; kind: 'video' | 'image'; name: string }

const FPS = 30;
const BITRATE = 6_000_000;
/** High, Main, then Baseline — the first the device can encode at 1080×1920 wins. */
const CODECS = ['avc1.640028', 'avc1.4d0028', 'avc1.42e028'];

export function clipFonts(): Fonts {
  return {
    serif: cssVar('--font-frank', "'Frank Ruhl Libre', Georgia, serif"),
    sans: cssVar('--font-heebo', "'Heebo', system-ui, sans-serif"),
  };
}

async function videoConfig(): Promise<VideoEncoderConfig | null> {
  if (typeof VideoEncoder === 'undefined' || typeof VideoFrame === 'undefined') return null;
  for (const codec of CODECS) {
    const config: VideoEncoderConfig = { codec, width: W, height: H, bitrate: BITRATE, framerate: FPS, avc: { format: 'avc' } };
    try {
      if ((await VideoEncoder.isConfigSupported(config)).supported) return config;
    } catch { /* try the next profile */ }
  }
  return null;
}

const nextTick = () => new Promise<void>(r => setTimeout(r, 0));

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => canvas.toBlob(b => (b ? resolve(b) : reject(new Error('toBlob'))), 'image/png'));
}

/** The clip's last frame as a PNG — where video can't be made, or making it failed. */
export async function renderStill(canvas: HTMLCanvasElement, data: ClipData): Promise<ClipFile> {
  const fonts = clipFonts();
  await loadFonts(fonts.serif, fonts.sans);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');
  drawFrame(ctx, DURATION, data, fonts);
  return { blob: await toPng(canvas), kind: 'image', name: 'shabbat-shalom.png' };
}

export async function renderClip(
  canvas: HTMLCanvasElement, data: ClipData, onProgress: (k: number) => void, cancelled: () => boolean,
): Promise<ClipFile | null> {
  const config = await videoConfig();
  if (!config) {
    const still = await renderStill(canvas, data);
    onProgress(1);
    return still;
  }
  const fonts = clipFonts();
  await loadFonts(fonts.serif, fonts.sans);
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('canvas');

  const { Muxer, ArrayBufferTarget } = await import('mp4-muxer');
  const target = new ArrayBufferTarget();
  const muxer = new Muxer({ target, video: { codec: 'avc', width: W, height: H, frameRate: FPS }, fastStart: 'in-memory' });
  let failure: unknown = null;
  const encoder = new VideoEncoder({
    output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
    error: e => { failure = e; },
  });
  encoder.configure(config);

  const frames = DURATION * FPS;
  try {
    for (let i = 0; i < frames; i++) {
      if (cancelled()) return null;
      if (failure) throw failure;
      drawFrame(ctx, i / FPS, data, fonts);
      const frame = new VideoFrame(canvas, { timestamp: Math.round((i * 1e6) / FPS), duration: Math.round(1e6 / FPS) });
      encoder.encode(frame, { keyFrame: i % (FPS * 2) === 0 });
      frame.close();
      // Let the encoder drain and the page breathe (the preview shows each frame).
      while (encoder.encodeQueueSize > 6) await nextTick();
      if (i % 3 === 0) { onProgress(i / frames); await nextTick(); }
    }
    await encoder.flush();
    if (failure) throw failure;
  } finally {
    if (encoder.state !== 'closed') encoder.close();
  }
  muxer.finalize();
  onProgress(1);
  return { blob: new Blob([target.buffer], { type: 'video/mp4' }), kind: 'video', name: 'shabbat-shalom.mp4' };
}
