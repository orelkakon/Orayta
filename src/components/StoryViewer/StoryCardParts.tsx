'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';

/*
 * Shared visual primitives for story cards. The cards are an immersive dark
 * "stage" with warm cream typography — fixed artwork colors by design (like
 * the share-image cards), identical in light and dark app themes.
 */

export const CREAM = '#f6ead2';
const CREAM_SOFT = 'rgba(246, 234, 210, 0.78)';

export const Shell = styled.div<{ $from: string; $to: string; $accent: string }>`
  position: absolute; inset: 0;
  display: flex; flex-direction: column;
  background:
    radial-gradient(ellipse at 50% -12%, rgba(${p => p.$accent}, 0.34), transparent 52%),
    radial-gradient(ellipse at 12% 108%, rgba(${p => p.$accent}, 0.16), transparent 45%),
    linear-gradient(168deg, ${p => p.$from} 0%, #150d07 56%, ${p => p.$to} 165%);
`;

export const Ornament = styled.span<{ $accent: string }>`
  position: absolute; font-size: 0.8rem; pointer-events: none;
  color: rgba(${p => p.$accent}, 0.55);
  text-shadow: 0 0 12px rgba(${p => p.$accent}, 0.6);
`;

export const Body = styled.div`
  flex: 1; min-height: 0;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${theme.spacing.md};
  padding: 84px ${theme.spacing.lg} 108px;
  text-align: center;
`;

export const KickerText = styled.span<{ $accent: string }>`
  font-family: ${theme.fonts.ui};
  font-size: 0.74rem; font-weight: 800; letter-spacing: 0.24em;
  color: rgba(${p => p.$accent}, 0.95);
`;

export const TitleText = styled.h3`
  font-family: ${theme.fonts.body};
  font-size: 1.7rem; font-weight: 800; line-height: 1.25;
  color: ${CREAM};
  text-shadow: 0 2px 18px rgba(0, 0, 0, 0.45);
`;

export const MainText = styled.p<{ $clamp?: number; $size?: string }>`
  font-family: ${theme.fonts.body};
  font-size: ${p => p.$size ?? '1.22rem'};
  line-height: 1.8; color: ${CREAM};
  display: -webkit-box;
  -webkit-line-clamp: ${p => p.$clamp ?? 9};
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const SubText = styled.p`
  font-size: 0.88rem; line-height: 1.6; color: ${CREAM_SOFT};
`;

export const SourceChip = styled.span`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 0.78rem; font-weight: 600; color: ${CREAM_SOFT};
  border: 1px solid rgba(246, 234, 210, 0.28);
  padding: 4px 14px; border-radius: 999px;
`;

export const GoldRule = styled.span`
  width: 58px; height: 1px;
  background: linear-gradient(90deg, transparent, rgba(243, 214, 146, 0.85), transparent);
`;

export const Medallion = styled.span<{ $accent: string }>`
  width: 88px; height: 88px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${CREAM};
  background: radial-gradient(circle at 32% 28%, rgba(${p => p.$accent}, 0.5), rgba(${p => p.$accent}, 0.12));
  border: 1px solid rgba(${p => p.$accent}, 0.65);
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.25);
`;

export const RabbiPhoto = styled.img`
  width: 118px; height: 118px; border-radius: 50%;
  object-fit: cover;
  border: 3px solid rgba(243, 214, 146, 0.9);
  box-shadow: 0 10px 34px rgba(0, 0, 0, 0.5);
`;

export const QuoteMark = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 3.4rem; line-height: 0.6;
  color: rgba(243, 214, 146, 0.55);
`;

export const BigValue = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 2.6rem; font-weight: 800; line-height: 1.15;
  color: #f3d692;
  text-shadow: 0 2px 22px rgba(243, 214, 146, 0.35);
`;

export const ChipsRow = styled.span`
  display: flex; flex-wrap: wrap; justify-content: center; gap: 6px;
`;

export const WordChip = styled.span`
  font-family: ${theme.fonts.body};
  font-size: 0.9rem; font-weight: 700; color: ${CREAM};
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(246, 234, 210, 0.22);
  padding: 3px 12px; border-radius: 999px;
`;

export const PlayRing = styled.span<{ $accent: string }>`
  width: 84px; height: 84px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  border: 3px solid ${CREAM};
  background: rgba(${p => p.$accent}, 0.25);
  box-shadow: 0 0 0 10px rgba(${p => p.$accent}, 0.14), 0 10px 30px rgba(0, 0, 0, 0.45);
  color: ${CREAM};
`;

export function PlayGlyph() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5.5v13l11-6.5z" />
    </svg>
  );
}
