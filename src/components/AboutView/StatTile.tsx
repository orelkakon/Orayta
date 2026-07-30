'use client';

import { useEffect, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { LineIcon } from '@/components/common/LineIcons';
import { StatTileConfig, TileSize, TileVariant } from './statTilesConfig';
import { TILE_DECOR } from './statTileDecor';

function useAnimatedCount(target: number | null): number {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    if (target === null) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setDisplayed(target);
      return;
    }
    const steps = 60; const duration = 1600; let step = 0;
    const timer = setInterval(() => {
      step++;
      const eased = 1 - Math.pow(1 - step / steps, 3);
      setDisplayed(Math.floor(eased * target));
      if (step >= steps) { setDisplayed(target); clearInterval(timer); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return displayed;
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: none; }
`;

const Tile = styled.article<{ $tint: string; $size: TileSize; $variant: TileVariant; $index: number }>`
  --tile-tint: ${p => p.$tint};
  --tile-ink: ${theme.colors.text};
  position: relative; overflow: hidden;
  display: flex; flex-direction: column;
  justify-content: space-between; align-items: flex-start;
  padding: ${theme.spacing.md};
  border-radius: 20px;
  background: linear-gradient(155deg,
    color-mix(in srgb, var(--tile-tint) 10%, ${theme.colors.surface}) 0%,
    ${theme.colors.surface} 62%);
  border: 1px solid color-mix(in srgb, var(--tile-tint) 16%, ${theme.colors.borderLight});
  box-shadow: ${theme.shadows.sm}, inset 0 1px 0 color-mix(in srgb, #fff 14%, transparent);
  animation: ${fadeUp} 0.55s ease both;
  animation-delay: ${p => p.$index * 60}ms;
  transition: transform 0.25s ease, box-shadow 0.25s ease;

  @media (hover: hover) {
    &:hover { transform: translateY(-3px); box-shadow: ${theme.shadows.md}; }
  }
  @media (prefers-reduced-motion: reduce) {
    animation: none;
    &:hover { transform: none; }
  }

  ${p => p.$size === 'hero' && css`
    grid-column: span 2; grid-row: span 2;
    padding: ${theme.spacing.lg};
    --tile-ink: ${theme.colors.onPrimary};
    background: linear-gradient(150deg, ${theme.colors.primaryLight} 0%, ${theme.colors.primary} 80%);
    border-color: color-mix(in srgb, ${theme.colors.primary} 50%, transparent);
    box-shadow: ${theme.shadows.md}, inset 0 1px 0 color-mix(in srgb, #fff 22%, transparent);
  `}
  ${p => p.$size === 'wide' && css`grid-column: span 2;`}

  ${p => TILE_DECOR[p.$variant]}
`;

const Chip = styled.span<{ $hero: boolean }>`
  position: relative; z-index: 1;
  flex-shrink: 0;
  width: ${p => p.$hero ? '60px' : '50px'};
  height: ${p => p.$hero ? '60px' : '50px'};
  border-radius: ${p => p.$hero ? '19px' : '16px'};
  display: inline-flex; align-items: center; justify-content: center;
  ${p => p.$hero ? css`
    color: var(--tile-ink);
    background: color-mix(in srgb, var(--tile-ink) 14%, transparent);
    box-shadow: inset 0 1px 0 color-mix(in srgb, #fff 25%, transparent);
  ` : css`
    color: ${theme.colors.onPrimary};
    background: linear-gradient(145deg,
      color-mix(in srgb, var(--tile-tint) 86%, #fff) 0%,
      color-mix(in srgb, var(--tile-tint) 86%, #000) 100%);
    box-shadow:
      0 4px 10px color-mix(in srgb, var(--tile-tint) 30%, transparent),
      inset 0 1px 0 color-mix(in srgb, #fff 38%, transparent);
  `}
`;

const Body = styled.div`
  position: relative; z-index: 1;
  display: flex; flex-direction: column; gap: 3px;
  margin-top: ${theme.spacing.sm};
`;

const Num = styled.div<{ $size: TileSize }>`
  font-family: ${theme.fonts.ui};
  font-variant-numeric: tabular-nums;
  font-weight: 700; line-height: 1; letter-spacing: -0.02em;
  color: var(--tile-ink);
  font-size: ${p => p.$size === 'hero' ? 'clamp(2.7rem, 9vw, 3.4rem)' : p.$size === 'wide' ? '2rem' : '1.65rem'};
`;

const Label = styled.div`
  font-size: ${theme.fontSizes.xs}; font-weight: 600;
  color: color-mix(in srgb, var(--tile-ink) 68%, transparent);
`;

const SubLabel = styled.div`
  font-size: 0.72rem;
  color: color-mix(in srgb, var(--tile-ink) 52%, transparent);
`;

interface Props { config: StatTileConfig; value: number | null; index: number; }

export default function StatTile({ config, value, index }: Props) {
  const displayed = useAnimatedCount(value);
  return (
    <Tile $tint={config.tint} $size={config.size} $variant={config.variant} $index={index}>
      <Chip $hero={config.size === 'hero'} aria-hidden="true">
        <LineIcon name={config.icon} size={config.size === 'hero' ? 32 : 26} strokeWidth={1.7} />
      </Chip>
      <Body>
        <Num $size={config.size}>{value === null ? '…' : displayed.toLocaleString('he-IL')}</Num>
        <Label>{config.label}</Label>
        {config.sub && <SubLabel>{config.sub}</SubLabel>}
      </Body>
    </Tile>
  );
}
