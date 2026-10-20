import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const EXIT_MS = 220;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const fadeOut = keyframes`from { opacity: 1; } to { opacity: 0; }`;
const rise = keyframes`from { transform: translateY(100%); } to { transform: none; }`;
const sink = keyframes`from { transform: none; } to { transform: translateY(100%); }`;
const pop = keyframes`from { opacity: 0; transform: translateY(14px) scale(0.98); } to { opacity: 1; transform: none; }`;
const shimmer = keyframes`0%, 100% { opacity: 0.45; } 50% { opacity: 0.9; }`;
const glow = keyframes`0% { box-shadow: 0 0 0 0 var(--color-secondary); } 100% { box-shadow: 0 0 0 10px transparent; }`;

// Above the full-screen feed (theme.z.feed) and its own sheets.
const Z = theme.z.feed + 80;

export const Backdrop = styled.div<{ $out: boolean }>`
  position: fixed; inset: 0; z-index: ${Z};
  background: rgba(0, 0, 0, 0.55);
  -webkit-backdrop-filter: blur(3px); backdrop-filter: blur(3px);
  animation: ${p => (p.$out ? fadeOut : fadeIn)} ${EXIT_MS}ms ease forwards;
`;

export const Sheet = styled.div<{ $out: boolean }>`
  position: fixed; z-index: ${Z + 1}; direction: rtl;
  display: flex; flex-direction: column; overflow: hidden; outline: none;
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  box-shadow: ${theme.shadows.lg};
  bottom: 0; left: 0; right: 0; height: 90dvh;
  border-radius: ${theme.radii.xl} ${theme.radii.xl} 0 0;
  ${p => (p.$out
    ? css`animation: ${sink} ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards;`
    : css`animation: ${rise} 0.34s ${theme.motion.out};`)}
  @media (min-width: 769px) {
    top: 50%; bottom: auto; left: 50%; right: auto;
    translate: -50% -50%;
    width: min(760px, calc(100vw - ${theme.spacing.xl})); height: min(86vh, 900px);
    border-radius: ${theme.radii.lg};
    ${p => (p.$out
      ? css`animation: ${fadeOut} ${EXIT_MS}ms ease forwards;`
      : css`animation: ${pop} 0.3s ${theme.motion.out};`)}
  }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const Grip = styled.div`
  flex-shrink: 0; width: 40px; height: 4px; border-radius: 999px;
  background: ${theme.colors.border}; margin: ${theme.spacing.sm} auto 0;
  @media (min-width: 769px) { display: none; }
`;

export const Head = styled.div`
  flex-shrink: 0; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md} ${theme.spacing.ms};
  border-bottom: 1px solid ${theme.colors.borderLight};
`;

export const TitleRow = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;

export const Title = styled.h2`
  flex: 1; margin: 0; display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800;
  color: ${theme.colors.primary};
`;

export const IconBtn = styled.button`
  -webkit-tap-highlight-color: transparent; flex-shrink: 0;
  min-width: 40px; height: 40px; padding: 0 ${theme.spacing.sm}; border-radius: 999px;
  display: inline-flex; align-items: center; justify-content: center;
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surfaceAlt};
  color: ${theme.colors.text}; font-family: ${theme.fonts.ui}; font-weight: 700; font-size: ${theme.fontSizes.sm};
  transition: background ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover:not(:disabled) { border-color: ${theme.colors.border}; }
  &:active:not(:disabled) { transform: scale(0.94); }
  &:disabled { opacity: 0.4; cursor: default; }
  &:focus-visible { outline: 2px solid ${theme.colors.primaryLight}; outline-offset: 2px; }
`;

export const Quote = styled.blockquote<{ $open: boolean }>`
  margin: 0; cursor: pointer;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.sm}; line-height: 1.7;
  color: ${theme.colors.textMuted};
  border-right: 3px solid ${theme.colors.secondary}; padding-right: ${theme.spacing.sm};
  ${p => !p.$open && css`
    display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  `}
`;

export const ToolRow = styled.div`
  display: flex; align-items: center; gap: ${theme.spacing.sm}; flex-wrap: wrap;
`;

export const Segmented = styled.div`
  display: inline-flex; padding: 3px; border-radius: 999px;
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
`;

export const SegBtn = styled.button<{ $on: boolean }>`
  -webkit-tap-highlight-color: transparent;
  padding: 6px 14px; border-radius: 999px; font-size: ${theme.fontSizes.sm}; font-weight: 700;
  font-family: ${theme.fonts.ui};
  color: ${p => (p.$on ? theme.colors.onPrimary : theme.colors.textMuted)};
  background: ${p => (p.$on ? theme.colors.primary : 'transparent')};
  transition: background ${theme.motion.base} ${theme.motion.out}, color ${theme.motion.base};
  &:focus-visible { outline: 2px solid ${theme.colors.primaryLight}; outline-offset: 1px; }
`;

export const Spacer = styled.span`flex: 1;`;

export const Body = styled.div`
  flex: 1; overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch;
  padding: ${theme.spacing.md} ${theme.spacing.lg} ${theme.spacing.lg};
  ${theme.media.sm} { padding: ${theme.spacing.md}; }
`;

export const Segment = styled.p<{ $scale: number; $hit: boolean }>`
  position: relative; margin: 0 0 ${theme.spacing.ms};
  font-family: ${theme.fonts.body}; font-size: ${p => 1.12 * p.$scale}rem; line-height: 2;
  overflow-wrap: break-word;
  b, strong { font-weight: 700; color: ${theme.colors.text}; }
  small { color: ${theme.colors.textMuted}; font-size: 0.85em; }
  big { font-size: 1.05em; }
  ${p => p.$hit && css`
    background: ${theme.colors.bgWarning}; border-radius: ${theme.radii.md};
    border-right: 4px solid ${theme.colors.secondary};
    padding: ${theme.spacing.lg} ${theme.spacing.md} ${theme.spacing.sm};
    scroll-margin: ${theme.spacing.xl};
    animation: ${glow} 1.2s ease-out 0.35s 2;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
`;

export const HitLabel = styled.span`
  position: absolute; top: ${theme.spacing.xs}; right: ${theme.spacing.md};
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 700; line-height: 1.6;
  color: ${theme.colors.secondary};
`;

export const Note = styled.div`
  margin-bottom: ${theme.spacing.md}; padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.radii.md}; background: ${theme.colors.surfaceAlt};
  color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm}; line-height: 1.6;
`;

export const SkeletonLine = styled.div<{ $w: number }>`
  height: 14px; width: ${p => p.$w}%; border-radius: 7px; margin: 0 0 18px auto;
  background: ${theme.colors.borderLight};
  animation: ${shimmer} 1.3s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const StateBox = styled.div`
  min-height: 60%; display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: ${theme.spacing.md}; text-align: center; color: ${theme.colors.textMuted};
`;

export const Foot = styled.div`
  flex-shrink: 0; display: flex; flex-direction: column; gap: 6px;
  padding: ${theme.spacing.sm} ${theme.spacing.md} calc(${theme.spacing.sm} + env(safe-area-inset-bottom));
  border-top: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.surface};
`;

export const NavRow = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;

export const SefariaLink = styled.a`
  font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.primaryLight};
  text-decoration: none; padding: ${theme.spacing.xs} ${theme.spacing.sm};
  &:hover { text-decoration: underline; }
  &::after { content: ' ↗'; font-size: 0.8em; }
`;

export const Attribution = styled.small`
  text-align: center; font-size: 0.68rem; line-height: 1.4; color: ${theme.colors.textLight};
`;
