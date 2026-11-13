import { theme } from '@/lib/theme';

/**
 * One Shabbat candlestick, as SVG path data — drawn by the home hero (SVG) and
 * by the shared clip (canvas `Path2D` takes the same strings), so both show
 * the same object. Local units: x centred on 0, y = 0 at the candle's top,
 * the foot ends near y = 99. From the top: wick, candle with a wax drip,
 * socket with a rim, a drip pan with a bead row, neck, upper knop, a
 * baluster stem between collars, lower knop and a domed foot on a rim.
 */
export type PartKind = 'wax' | 'drip' | 'wick' | 'metal' | 'rim' | 'bead' | 'engrave';

export interface StickPart {
  kind: PartKind;
  d: string;
  /** Half width, for horizontal metal shading. */
  hw: number;
}

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${cx - rx} ${cy}a${rx} ${ry} 0 1 0 ${2 * rx} 0a${rx} ${ry} 0 1 0 ${-2 * rx} 0Z`;
const bar = (y: number, hw: number, h: number) => `M${-hw} ${y}h${2 * hw}v${h}h${-2 * hw}Z`;

export const CANDLE_H = 30;
export const WICK_TIP_Y = -3.8;
export const STICK_BOTTOM = 99.4;
/** Where the flame's light falls on the drip pan. */
export const PAN_Y = 37;

const BEADS = [-10.5, -7, -3.5, 0, 3.5, 7, 10.5].map(x => ellipse(x, 42.2, 0.95, 0.95)).join('');
const FOOT_BEADS = [-12, -8, -4, 0, 4, 8, 12].map(x => ellipse(x, 93.2, 0.7, 0.7)).join('');

export const STICK_PARTS: StickPart[] = [
  { kind: 'wax', hw: 4.6, d: `M-4.6 1.6Q-4.6 0 -3 0H3Q4.6 0 4.6 1.6V${CANDLE_H}H-4.6Z` },
  { kind: 'drip', hw: 1.4, d: 'M1.4 0.3C1.6 3 2.7 4.2 2.7 7.2a1.15 1.15 0 0 1 -2.3 0C0.4 4.6 1 2.6 1 0.3Z' },
  { kind: 'wick', hw: 0.5, d: `M0 0Q0.7 -1.9 -0.2 ${WICK_TIP_Y}` },
  { kind: 'metal', hw: 6.2, d: 'M-6.2 30H6.2L4.7 36H-4.7Z' },
  { kind: 'rim', hw: 6.8, d: bar(29, 6.8, 1.9) },
  { kind: 'metal', hw: 14.5, d: 'M-14.5 36.6Q0 34.4 14.5 36.6Q12.6 40.9 0 41.2Q-12.6 40.9 -14.5 36.6Z' },
  { kind: 'engrave', hw: 14.5, d: 'M-14.2 36.7Q0 34.6 14.2 36.7' },
  { kind: 'bead', hw: 11, d: BEADS },
  { kind: 'metal', hw: 2.5, d: bar(41, 2.5, 4.4) },
  { kind: 'metal', hw: 5.8, d: ellipse(0, 48.8, 5.8, 3.7) },
  { kind: 'engrave', hw: 5.6, d: 'M-5.5 48.8H5.5' },
  { kind: 'rim', hw: 3.2, d: bar(52.2, 3.2, 1.8) },
  { kind: 'metal', hw: 3.5, d: 'M-2 54C-2 59 -3.5 62.5 -3.5 66.5C-3.5 70.5 -2.3 72 -2.3 73.6H2.3C2.3 72 3.5 70.5 3.5 66.5C3.5 62.5 2 59 2 54Z' },
  { kind: 'engrave', hw: 3.4, d: 'M-3.3 66.5H3.3' },
  { kind: 'metal', hw: 6.8, d: ellipse(0, 77, 6.8, 3.5) },
  { kind: 'rim', hw: 3.4, d: bar(80.2, 3.4, 2) },
  { kind: 'metal', hw: 16.5, d: 'M-3.8 82.2C-4.2 88 -12.5 90.2 -16.5 95.2H16.5C12.5 90.2 4.2 88 3.8 82.2Z' },
  { kind: 'engrave', hw: 11, d: 'M-10.6 91.2Q0 87.4 10.6 91.2' },
  { kind: 'bead', hw: 12.5, d: FOOT_BEADS },
  { kind: 'rim', hw: 18.6, d: 'M-17.4 95.2h34.8a1.2 1.2 0 0 1 1.2 1.2v1.8a1.2 1.2 0 0 1 -1.2 1.2h-34.8a1.2 1.2 0 0 1 -1.2 -1.2v-1.8a1.2 1.2 0 0 1 1.2 -1.2Z' },
];

/* Fixed palette (the night card and the clip look the same in both themes). */

const g = theme.game;
/** Horizontal shading across a part: dark edges, a bright highlight left of centre. */
export const METAL_STOPS: [number, string][] = [[0, g.goldDeep], [0.22, g.gold], [0.4, g.goldInk], [0.55, g.goldLight], [0.78, g.gold], [1, g.goldDeep]];
export const RIM_STOPS: [number, string][] = [[0, g.gold], [0.4, g.goldInk], [1, g.goldDeep]];
export const WAX_STOPS: [number, string][] = [[0, g.goldLight], [0.3, g.goldInk], [0.55, g.ink], [1, g.goldLight]];
export const BEAD_FILL = g.goldLight;
export const ENGRAVE = g.goldDeep;
export const WICK = g.onGold;
