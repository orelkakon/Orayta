/**
 * Candlelight and night colours shared by the hero's CSS flames and the
 * canvas clip (canvas gradients can't read CSS variables). The night stops
 * mirror `theme.gilded.night`.
 */
export const FLAME_STOPS: [number, string][] = [
  [0, '#FFFBEA'], [0.42, '#FFD98A'], [0.78, '#F2994A'], [1, 'rgba(242, 153, 74, 0)'],
];
export const HALO_STOPS: [number, string][] = [[0, 'rgba(255, 205, 120, 0.5)'], [1, 'rgba(255, 205, 120, 0)']];
export const GLOW_STOPS: [number, string][] = [
  [0, 'rgba(255, 196, 120, 0.3)'], [0.48, 'rgba(242, 153, 74, 0.1)'], [1, 'rgba(242, 153, 74, 0)'],
];
export const NIGHT_STOPS: [number, string][] = [[0, '#3A2410'], [0.55, '#23150A'], [1, '#160D06']];
/** The flame's blue root. */
export const FLAME_ROOT = 'rgba(120, 150, 255, 0.45)';
export const WINE_GLOW = 'rgba(155, 35, 53, 0.22)';
