'use client';

import { useMemo } from 'react';
import styled from 'styled-components';
import qrcode from 'qrcode-generator';
import { theme } from '@/lib/theme';

/** Crisp, dependency-light QR as inline SVG (one path, scales to any size). */
const Frame = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  max-width: 100%;
  padding: 10px;
  border-radius: ${theme.radii.lg};
  background: ${theme.game.qrLight};
  box-shadow: 0 12px 34px rgba(0,0,0,0.35);
  svg { display: block; width: 100%; height: 100%; }
`;

export default function QrCode({ value, size = 180, label }: { value: string; size?: number; label: string }) {
  const { d, n } = useMemo(() => {
    const qr = qrcode(0, 'M');
    qr.addData(value);
    qr.make();
    const count = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < count; r++) {
      for (let c = 0; c < count; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    }
    return { d: path, n: count };
  }, [value]);

  return (
    <Frame $size={size} role="img" aria-label={label}>
      <svg viewBox={`0 0 ${n} ${n}`} shapeRendering="crispEdges" aria-hidden>
        <path d={d} fill={theme.game.qrDark} />
      </svg>
    </Frame>
  );
}
