import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const EXIT_MS = 220;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const fadeOut = keyframes`from { opacity: 1; } to { opacity: 0; }`;
const slideUp = keyframes`from { transform: translateY(100%); } to { transform: none; }`;
const slideDown = keyframes`from { transform: none; } to { transform: translateY(100%); }`;
export const ring = keyframes`
  0%, 100% { transform: rotate(0); }
  15% { transform: rotate(14deg); } 30% { transform: rotate(-12deg); }
  45% { transform: rotate(8deg); }  60% { transform: rotate(-5deg); } 75% { transform: rotate(2deg); }
`;

export const Backdrop = styled.div<{ $out: boolean }>`
  position: fixed; inset: 0; z-index: ${theme.z.toast}; background: rgba(0,0,0,0.45);
  backdrop-filter: blur(2px);
  animation: ${p => (p.$out ? fadeOut : fadeIn)} ${EXIT_MS}ms ease forwards;
`;

export const Sheet = styled.div<{ $out: boolean }>`
  position: fixed; z-index: ${theme.z.toast}; bottom: 0; left: 50%; translate: -50% 0;
  width: 100%; max-width: 520px; max-height: 88dvh; overflow-y: auto; overscroll-behavior: contain;
  direction: rtl; background: ${theme.colors.surface}; color: ${theme.colors.text};
  border: 1px solid ${theme.colors.borderLight}; border-bottom: none;
  border-radius: ${theme.radii.xl} ${theme.radii.xl} 0 0; box-shadow: ${theme.shadows.lg};
  padding: ${theme.spacing.sm} ${theme.spacing.lg} calc(${theme.spacing.lg} + env(safe-area-inset-bottom, 0px));
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  ${p => (p.$out
    ? css`animation: ${slideDown} ${EXIT_MS}ms cubic-bezier(0.4, 0, 1, 1) forwards;`
    : css`animation: ${slideUp} 0.36s ${theme.motion.out};`)}
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const Grip = styled.div`
  width: 40px; height: 4px; border-radius: 999px; margin: 0 auto;
  background: ${theme.colors.border};
`;

export const Head = styled.div`display: flex; align-items: flex-start; gap: ${theme.spacing.ms};`;

export const Medallion = styled.div<{ $ring?: boolean }>`
  width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: radial-gradient(circle at 32% 28%, rgba(196,149,106,0.32), rgba(196,149,106,0.08));
  border: 1px solid rgba(196,149,106,0.55);
  & > span { display: inline-flex; transform-origin: 50% 10%; }
  ${p => p.$ring && css`& > span { animation: ${ring} 1.1s ease 0.25s both; }`}
  @media (prefers-reduced-motion: reduce) { & > span { animation: none; } }
`;

export const TitleBox = styled.div`flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px;`;

export const Title = styled.h2`
  margin: 0; display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800; color: ${theme.colors.primary};
`;

export const Sub = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.5;`;

export const CloseBtn = styled.button`
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; color: ${theme.colors.textMuted};
  transition: background ${theme.motion.fast};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

export const OnBadge = styled.span`
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  padding: 2px 10px; border-radius: 999px;
  color: ${theme.colors.success}; background: ${theme.colors.bgSuccess};
`;

export const PrimaryBtn = styled.button`
  width: 100%; padding: 14px; border-radius: ${theme.radii.md};
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  font-size: ${theme.fontSizes.md}; font-weight: 700;
  transition: transform ${theme.motion.fast} ${theme.motion.out}, opacity ${theme.motion.fast};
  &:hover { opacity: 0.92; } &:active { transform: scale(0.98); }
  &:disabled { opacity: 0.6; cursor: wait; }
`;

export const QuietBtn = styled.button<{ $danger?: boolean }>`
  width: 100%; padding: 12px; border-radius: ${theme.radii.md};
  font-size: ${theme.fontSizes.sm}; font-weight: 600;
  color: ${p => (p.$danger ? theme.colors.error : theme.colors.primary)};
  border: 1px solid ${theme.colors.borderLight};
  display: flex; align-items: center; justify-content: center; gap: ${theme.spacing.sm};
  transition: background ${theme.motion.fast};
  &:hover { background: ${theme.colors.surfaceAlt}; }
  &:disabled { opacity: 0.6; }
`;

export const Notice = styled.div`
  background: ${theme.colors.surfaceAlt}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md}; padding: ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.text};
`;

export const NoticeTitle = styled.div`font-weight: 800; color: ${theme.colors.primary}; font-size: ${theme.fontSizes.md};`;

export const ErrorLine = styled.div`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.error}; text-align: center;`;
