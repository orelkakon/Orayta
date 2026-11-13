import { BEAD_FILL, ENGRAVE, METAL_STOPS, PartKind, RIM_STOPS, STICK_PARTS, WAX_STOPS, WICK } from '@/lib/shabbatClip/candlestick';

/**
 * The candlestick's shading, once per SVG (ids prefixed so two drawings on one
 * page never share gradients). Each part is shaded across its own width.
 */
export function CandlestickDefs({ id }: { id: string }) {
  const grad = (name: string, stops: [number, string][]) => (
    <linearGradient id={`${id}-${name}`} x1="0" x2="1" y1="0" y2="0">
      {stops.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
    </linearGradient>
  );
  return (
    <defs>
      {grad('metal', METAL_STOPS)}
      {grad('rim', RIM_STOPS)}
      {grad('wax', WAX_STOPS)}
    </defs>
  );
}

function paint(kind: PartKind, id: string): { fill: string; stroke?: string; strokeWidth?: number; opacity?: number } {
  switch (kind) {
    case 'metal': return { fill: `url(#${id}-metal)`, stroke: ENGRAVE, strokeWidth: 0.35 };
    case 'rim': return { fill: `url(#${id}-rim)` };
    case 'wax': return { fill: `url(#${id}-wax)` };
    case 'drip': return { fill: `url(#${id}-wax)`, opacity: 0.95 };
    case 'bead': return { fill: BEAD_FILL };
    case 'engrave': return { fill: 'none', stroke: ENGRAVE, strokeWidth: 0.5, opacity: 0.85 };
    case 'wick': return { fill: 'none', stroke: WICK, strokeWidth: 0.9 };
  }
}

/** One candlestick at (x, y) = the top of its candle. */
export default function Candlestick({ id, x, y }: { id: string; x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} strokeLinecap="round">
      {STICK_PARTS.map((p, i) => <path key={i} d={p.d} {...paint(p.kind, id)} />)}
    </g>
  );
}
