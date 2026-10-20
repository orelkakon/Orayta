import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/** Shared look of the group quiz: a night-and-gold stage, glass cards. */
const g = theme.game;

export const popIn = keyframes`
  0% { opacity: 0; transform: scale(0.6); }
  70% { opacity: 1; transform: scale(1.06); }
  100% { opacity: 1; transform: scale(1); }
`;
export const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;
export const pulse = keyframes`
  0%, 100% { opacity: 0.55; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.04); }
`;
export const glow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(232,203,118,0.0); }
  50% { box-shadow: 0 0 28px 4px rgba(232,203,118,0.28); }
`;

export const reduced = css`
  @media (prefers-reduced-motion: reduce) {
    animation: none !important;
    transition: none !important;
  }
`;

export const Stage = styled.main`
  position: relative;
  min-height: 100vh;
  min-height: 100dvh;
  background: ${g.stage};
  color: ${g.ink};
  font-family: ${theme.fonts.ui};
  direction: rtl;
  display: flex;
  flex-direction: column;
  padding: max(${theme.spacing.md}, env(safe-area-inset-top)) ${theme.spacing.md}
    max(${theme.spacing.md}, env(safe-area-inset-bottom));
  overflow-x: hidden;
  -webkit-tap-highlight-color: transparent;
`;

export const Glass = styled.div`
  background: ${g.glass};
  border: 1px solid ${g.glassLine};
  border-radius: ${theme.radii.xl};
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
`;

export const press = css`
  cursor: pointer;
  user-select: none;
  -webkit-user-select: none;
  transition: transform ${theme.motion.fast} ${theme.motion.out}, background ${theme.motion.fast}, opacity ${theme.motion.fast};
  &:active:not(:disabled) { transform: scale(0.97); }
  &:disabled { opacity: 0.45; cursor: not-allowed; }
  &:focus-visible { outline: 3px solid ${g.gold}; outline-offset: 3px; }
  ${reduced};
`;

export const GoldButton = styled.button`
  ${press};
  min-height: 56px;
  padding: ${theme.spacing.ms} ${theme.spacing.xl};
  border-radius: 999px;
  background: linear-gradient(180deg, ${g.gold} 0%, ${g.goldDeep} 100%);
  color: ${g.onGold};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.lg};
  font-weight: 700;
  box-shadow: 0 10px 30px rgba(232,203,118,0.22), inset 0 1px 0 rgba(255,255,255,0.45);
`;

export const GhostButton = styled.button`
  ${press};
  min-height: 44px;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: 999px;
  background: ${g.glass};
  border: 1px solid ${g.glassLine};
  color: ${g.ink};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  @media (hover: hover) { &:hover:not(:disabled) { background: ${g.glassHi}; } }
`;

export const Pill = styled.span`
  display: inline-flex;
  align-items: center;
  gap: ${theme.spacing.xs};
  padding: 4px ${theme.spacing.ms};
  border-radius: 999px;
  background: ${g.glass};
  border: 1px solid ${g.glassLine};
  font-size: ${theme.fontSizes.sm};
  font-weight: 600;
  color: ${g.inkMuted};
  font-variant-numeric: tabular-nums;
`;

export const Center = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.lg};
  text-align: center;
  width: 100%;
  max-width: 1100px;
  margin: 0 auto;
`;

export const Title = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: clamp(1.6rem, 4.6vw, 2.6rem);
  font-weight: 700;
  line-height: 1.25;
  color: ${g.ink};
  margin: 0;
`;

export const Sub = styled.p`
  font-size: ${theme.fontSizes.md};
  color: ${g.inkMuted};
  line-height: 1.6;
  margin: 0;
`;
