'use client';

import React from 'react';
import { theme } from '@/lib/theme';

/**
 * Unified line-icon set for the homepage — replaces the mixed phone emoji.
 * One visual language: 24-grid, thin strokes, round caps, currentColor so
 * the gold/brown palette comes from the parent card.
 */
function Svg({ size, children }: { size: number; children: React.ReactNode }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const ICONS: Record<string, React.ReactNode> = {
  '/sikumim': (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </>
  ),
  '/rabbis': (
    <>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  '/study': (
    <>
      <path d="M2 4h6a4 4 0 0 1 4 4v12a3 3 0 0 0-3-3H2z" />
      <path d="M22 4h-6a4 4 0 0 0-4 4v12a3 3 0 0 1 3-3h7z" />
    </>
  ),
  '/quiz': (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.2" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  '/content': (
    <>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h6" />
    </>
  ),
  '/today': (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2.5" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <path d="M8 15h3" />
    </>
  ),
  '/chidushim': (
    <>
      <path d="M9 18h6" />
      <path d="M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.8.62 1.35 1.5 1.5 2.2h4.2c.15-.7.7-1.58 1.5-2.2A6 6 0 0 0 12 3z" />
    </>
  ),
  '/gematria': (
    <>
      <text
        x="12" y="16.5" textAnchor="middle" fontSize="17" fontWeight="600"
        fontFamily={theme.fonts.body} fill="currentColor" stroke="none"
      >
        א
      </text>
      <path d="M4 21h16" />
    </>
  ),
  '/about': (
    <>
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="11" x2="12" y2="16.5" />
      <circle cx="12" cy="7.8" r="0.4" fill="currentColor" />
    </>
  ),
};

export default function SectionIcon({ href, size = 32 }: { href: string; size?: number }) {
  return <Svg size={size}>{ICONS[href] ?? ICONS['/about']}</Svg>;
}

export function CandleIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M12 2.5c-1.2 1.6-2 2.7-2 3.9a2 2 0 0 0 4 0c0-1.2-.8-2.3-2-3.9z" />
      <path d="M9.5 11h5v10h-5z" />
      <path d="M7 21h10" />
    </Svg>
  );
}

export function QuillIcon({ size = 26 }: { size?: number }) {
  return (
    <Svg size={size}>
      <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z" />
      <line x1="16" y1="8" x2="2" y2="22" />
      <line x1="17.5" y1="15" x2="9" y2="15" />
    </Svg>
  );
}
