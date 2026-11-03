'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * Loading placeholders shaped like the content they stand in for, so the page
 * doesn't jump when data lands. Decorative — wrap groups in an element with
 * aria-busy / a visually hidden "loading" label.
 */
const shimmer = keyframes`
  from { background-position: 150% 0; }
  to   { background-position: -50% 0; }
`;

export const Skeleton = styled.span.attrs({ 'aria-hidden': true, className: 'anim-loop' })<{
  $w?: string;
  $h?: string;
  $r?: string;
}>`
  display: block;
  width: ${p => p.$w ?? '100%'};
  height: ${p => p.$h ?? '14px'};
  border-radius: ${p => p.$r ?? theme.radii.sm};
  background: linear-gradient(
    90deg,
    color-mix(in srgb, ${theme.colors.text} 6%, transparent) 0%,
    color-mix(in srgb, ${theme.colors.text} 11%, transparent) 50%,
    color-mix(in srgb, ${theme.colors.text} 6%, transparent) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 1.4s ease-in-out infinite;
`;

const Lines = styled.span`display: flex; flex-direction: column; gap: 8px;`;

/** A paragraph of skeleton lines; the last one is shorter, like real text. */
export function SkeletonText({ lines = 3, lineHeight = '12px' }: { lines?: number; lineHeight?: string }) {
  return (
    <Lines aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} $h={lineHeight} $w={i === lines - 1 ? '62%' : '100%'} />
      ))}
    </Lines>
  );
}
