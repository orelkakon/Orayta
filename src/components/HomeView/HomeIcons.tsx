'use client';

import React from 'react';
import { LineIcon } from '@/components/common/LineIcons';

/** Homepage section-card icons — thin mapping over the shared LineIcons set. */
const SECTION_ICONS: Record<string, string> = {
  '/sikumim': 'pencil',
  '/rabbis': 'users',
  '/study': 'openbook',
  '/quiz': 'target',
  '/content': 'book',
  '/today': 'calendar',
  '/chidushim': 'bulb',
  '/gematria': 'aleph',
  '/about': 'info',
};

export default function SectionIcon({ href, size = 32 }: { href: string; size?: number }) {
  return <LineIcon name={SECTION_ICONS[href] ?? 'info'} size={size} />;
}

export function CandleIcon({ size = 26 }: { size?: number }) {
  return <LineIcon name="candle" size={size} />;
}

export function QuillIcon({ size = 26 }: { size?: number }) {
  return <LineIcon name="quill" size={size} />;
}
