'use client';

import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

/** "Read the question" bar that fills until the answers open. */
const Track = styled.div`
  width: min(520px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  align-items: center;
  color: ${theme.game.inkMuted};
  font-size: ${theme.fontSizes.md};
`;
const Bar = styled.div`
  width: 100%;
  height: 8px;
  border-radius: 999px;
  background: ${theme.game.glass};
  overflow: hidden;
`;
const Fill = styled.div`
  height: 100%;
  width: 0;
  border-radius: inherit;
  background: linear-gradient(90deg, ${theme.game.goldDeep}, ${theme.game.gold});
`;

interface Props { from: number; to: number; now: () => number; label: string; }

export default function LeadBar({ from, to, now, label }: Props) {
  const fill = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const frac = Math.min(1, Math.max(0, (now() - from) / Math.max(1, to - from)));
      if (fill.current) fill.current.style.width = `${frac * 100}%`;
      if (frac < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [from, to, now]);
  return (
    <Track role="status">
      <span>{label}</span>
      <Bar><Fill ref={fill} /></Bar>
    </Track>
  );
}
