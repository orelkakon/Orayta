'use client';

import React from 'react';
import { theme } from '@/lib/theme';

/**
 * Site-wide line-icon registry — one visual language everywhere: 24-grid,
 * thin strokes, round caps, currentColor. Replaces mixed phone emoji.
 */
const GLYPHS: Record<string, React.ReactNode> = {
  pencil: <><path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  user: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  openbook: <><path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" /><path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><path d="M9 7h6" /></>,
  books: <><rect x="7" y="3" width="13" height="16" rx="1.5" /><path d="M4 7v12a2 2 0 0 0 2 2h11" /><path d="M11 7h5" /></>,
  scroll: <><path d="M8 4v16M16 4v16" /><path d="M8 6h8M8 18h8" /><path d="M6 4h4M14 4h4M6 20h4M14 20h4" /></>,
  target: <><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5.2" /><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" /></>,
  list: <><line x1="9" y1="6" x2="21" y2="6" /><line x1="9" y1="12" x2="21" y2="12" /><line x1="9" y1="18" x2="21" y2="18" /><circle cx="4.5" cy="6" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="4.5" cy="18" r="1" fill="currentColor" stroke="none" /></>,
  calendar: <><rect x="3" y="4" width="18" height="18" rx="2.5" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><path d="M8 15h3" /></>,
  bulb: <><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.8.62 1.35 1.5 1.5 2.2h4.2c.15-.7.7-1.58 1.5-2.2A6 6 0 0 0 12 3z" /></>,
  aleph: <><text x="12" y="16.5" textAnchor="middle" fontSize="17" fontWeight="600" fontFamily={theme.fonts.body} fill="currentColor" stroke="none">א</text><path d="M4 21h16" /></>,
  info: <><circle cx="12" cy="12" r="9" /><line x1="12" y1="11" x2="12" y2="16.5" /><circle cx="12" cy="7.8" r="0.4" fill="currentColor" /></>,
  candle: <><path d="M12 2.5c-1.2 1.6-2 2.7-2 3.9a2 2 0 0 0 4 0c0-1.2-.8-2.3-2-3.9z" /><path d="M9.5 11h5v10h-5z" /><path d="M7 21h10" /></>,
  quill: <><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" /><line x1="16" y1="8" x2="2" y2="22" /><line x1="17.5" y1="15" x2="9" y2="15" /></>,
  hourglass: <><path d="M6 2h12M6 22h12" /><path d="M7 2v4l5 5 5-5V2" /><path d="M7 22v-4l5-5 5 5v4" /></>,
  search: <><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
  camera: <><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></>,
  sparkle: <><path d="M12 3c.5 4 2 6.5 6 7-4 .5-5.5 3-6 7-.5-4-2-6.5-6-7 4-.5 5.5-3 6-7z" /><path d="M19 15l.7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></>,
  note: <><path d="M9 18V5l11-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="16" r="3" /></>,
  bread: <><path d="M4 11a8 5 0 0 1 16 0v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M9 9.5v3M15 9.5v3M12 8.5v3" /></>,
  cup: <><path d="M8 3h8l-1 6.5a3.2 3.2 0 0 1-6 0z" /><path d="M12 13v5" /><path d="M8 21h8" /></>,
  droplet: <><path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" /></>,
  eye: <><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" /></>,
  flame: <><path d="M12 2.5C13 6 17 8.5 17 13a5 5 0 0 1-10 0c0-3 2-4.5 2.5-6.5.8 1.2 1.8 1.8 2.6 2C11.6 6.5 11.5 4.5 12 2.5z" /></>,
  home: <><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /><path d="M10 21v-6h4v6" /></>,
  moon: <><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></>,
  cap: <><path d="M22 9L12 4 2 9l10 5 10-5z" /><path d="M6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" /></>,
  bookmark: <path d="M19 21l-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  copy: <><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  check: <polyline points="20 6 9 17 4 12" />,
};

interface LineIconProps {
  name: string;
  size?: number;
  strokeWidth?: number;
  filled?: boolean;
}

export function LineIcon({ name, size = 24, strokeWidth = 1.6, filled = false }: LineIconProps) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {GLYPHS[name] ?? GLYPHS.book}
    </svg>
  );
}

/** Colors for the sikum-book icon keys (legacy emoji values stay in the DB). */
export const BOOK_ICON_COLORS: Record<string, string> = {
  '📒': '#C4956A',
  '📕': '#B0433B',
  '📗': '#4A7C59',
  '📘': '#3E5F8A',
  '📙': '#C07A3B',
};

export function BookGlyph({ icon, size = 26 }: { icon: string | null; size?: number }) {
  const color = BOOK_ICON_COLORS[icon ?? '📒'] ?? BOOK_ICON_COLORS['📒'];
  return (
    <span style={{ color, display: 'inline-flex' }}>
      <LineIcon name="book" size={size} strokeWidth={1.8} />
    </span>
  );
}
