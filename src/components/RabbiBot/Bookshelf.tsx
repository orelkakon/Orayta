'use client';

import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';

/* The books the search really found, standing on a shelf. While searching the
   shelf shows shimmering blank spines; while verifying a magnifier sweeps
   across and each spine gets its check mark. */

const SPINE_COLORS = [theme.colors.primary, theme.colors.secondary, theme.colors.accent, theme.colors.success, theme.colors.primaryLight];
const HEIGHTS = [96, 112, 88, 104, 118, 92, 108, 100, 114, 90];
const PLACEHOLDERS = 7;

const rise = keyframes`from { opacity: 0; transform: translateY(14px) scale(0.9); } to { opacity: 1; transform: none; }`;
const shimmer = keyframes`0%, 100% { opacity: 0.35; } 50% { opacity: 0.8; }`;
const sweep = keyframes`0% { inset-inline-start: 0%; } 100% { inset-inline-start: calc(100% - 34px); }`;
const pop = keyframes`0% { transform: scale(0); } 70% { transform: scale(1.25); } 100% { transform: scale(1); }`;

const Wrap = styled.div`position: relative; width: 100%;`;

const Shelf = styled.div`
  display: flex; align-items: flex-end; justify-content: center; gap: 5px;
  min-height: 124px; padding: 0 ${theme.spacing.sm};
  border-bottom: 7px solid ${theme.colors.secondary};
  border-radius: 0 0 ${theme.radii.sm} ${theme.radii.sm};
  box-shadow: 0 6px 10px -6px rgba(0, 0, 0, 0.35);
`;

const Spine = styled.div<{ $h: number; $c: string; $i: number; $blank: boolean }>`
  position: relative; flex: 0 1 30px; min-width: 22px; height: ${p => p.$h}px;
  border-radius: 4px 4px 1px 1px; background: ${p => p.$c}; color: ${theme.colors.onPrimary};
  box-shadow: inset -3px 0 0 rgba(0,0,0,0.18), inset 2px 0 0 rgba(255,255,255,0.18);
  display: flex; align-items: center; justify-content: center; overflow: visible;
  &::before, &::after {
    content: ''; position: absolute; left: 3px; right: 3px; height: 2px; background: rgba(255,255,255,0.35);
  }
  &::before { top: 10px; } &::after { bottom: 10px; }
  ${p => (p.$blank
    ? css`animation: ${shimmer} 1.4s ease-in-out ${p.$i * 0.12}s infinite;`
    : css`animation: ${rise} 0.45s ${theme.motion.spring} ${p.$i * 0.09}s both;`)}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Title = styled.span`
  writing-mode: vertical-rl; font-size: 10.5px; font-weight: 700; line-height: 1;
  max-height: calc(100% - 26px); overflow: hidden; white-space: nowrap; text-overflow: ellipsis;
`;

const Check = styled.span<{ $i: number }>`
  position: absolute; top: -9px; inset-inline-end: -6px; width: 18px; height: 18px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 900;
  background: ${theme.colors.success}; color: ${theme.colors.onPrimary}; border: 2px solid ${theme.colors.surface};
  animation: ${pop} 0.35s ${theme.motion.spring} ${p => 0.35 + p.$i * 0.28}s both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Glass = styled.span`
  position: absolute; bottom: 30px; width: 34px; height: 34px; color: ${theme.colors.primary};
  filter: drop-shadow(0 2px 3px rgba(0,0,0,0.25));
  animation: ${sweep} 1.6s ease-in-out infinite alternate;
  @media (prefers-reduced-motion: reduce) { animation: none; inset-inline-start: 45%; }
`;

interface Props { books: string[]; verifying: boolean }

export default function Bookshelf({ books, verifying }: Props) {
  const blank = books.length === 0;
  const items = blank ? Array.from({ length: PLACEHOLDERS }, () => '') : books;
  return (
    <Wrap>
      <Shelf>
        {items.map((b, i) => (
          <Spine key={blank ? `p${i}` : b} $h={HEIGHTS[i % HEIGHTS.length]} $c={SPINE_COLORS[i % SPINE_COLORS.length]} $i={i} $blank={blank} title={b || undefined}>
            {!blank && <Title>{b}</Title>}
            {verifying && !blank && <Check $i={i}>✓</Check>}
          </Spine>
        ))}
      </Shelf>
      {verifying && <Glass><LineIcon name="search" size={34} strokeWidth={2.2} /></Glass>}
    </Wrap>
  );
}
