import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const EXIT_MS = 260;
const G = theme.game;

const fadeIn = keyframes`from { opacity: 0; } to { opacity: 1; }`;
const fadeOut = keyframes`from { opacity: 1; } to { opacity: 0; }`;
const cardIn = keyframes`
  from { opacity: 0; transform: translateY(28px) scale(0.94); }
  to   { opacity: 1; transform: none; }
`;
const cardOut = keyframes`to { opacity: 0; transform: translateY(16px) scale(0.97); }`;
export const rise = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;

export const Backdrop = styled.div<{ $out: boolean }>`
  position: fixed; inset: 0; z-index: ${theme.z.toast};
  display: flex; align-items: center; justify-content: center;
  padding: max(${theme.spacing.md}, env(safe-area-inset-top, 0px)) ${theme.spacing.md} max(${theme.spacing.md}, env(safe-area-inset-bottom, 0px));
  background: radial-gradient(80% 60% at 50% 35%, rgba(42, 26, 12, 0.55), rgba(10, 6, 2, 0.78));
  backdrop-filter: blur(6px) saturate(1.1);
  -webkit-backdrop-filter: blur(6px) saturate(1.1);
  animation: ${p => (p.$out ? fadeOut : fadeIn)} ${EXIT_MS}ms ease forwards;
`;

/* Gold hairline frame around the card, like the dedications card on home. */
export const Frame = styled.div<{ $out: boolean }>`
  width: 100%; max-width: 440px; max-height: 100%;
  padding: 1.5px; border-radius: 28px;
  background: linear-gradient(150deg, ${G.gold} 0%, rgba(226,184,107,0.18) 32%, rgba(226,184,107,0.18) 68%, ${G.gold} 100%);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(0, 0, 0, 0.2);
  /* Column flex + min-height 0 on the card: a short phone scrolls the card instead of cropping it. */
  display: flex; flex-direction: column;
  ${p => (p.$out
    ? css`animation: ${cardOut} ${EXIT_MS}ms ease forwards;`
    : css`animation: ${cardIn} 0.55s ${theme.motion.spring} both;`)}
  @media (prefers-reduced-motion: reduce) { animation: ${fadeIn} 0.2s ease both; }
`;

export const Card = styled.div`
  position: relative; width: 100%; flex: 1 1 auto; min-height: 0;
  border-radius: 26.5px; overflow: hidden auto; overscroll-behavior: contain;
  background: ${theme.colors.surface}; color: ${theme.colors.text};
  direction: rtl; display: flex; flex-direction: column;
`;

export const CloseBtn = styled.button`
  position: absolute; top: 12px; inset-inline-start: 12px; z-index: 3;
  width: 36px; height: 36px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: ${G.ink}; background: ${G.glassHi}; border: 1px solid ${G.glassLine};
  transition: background ${theme.motion.fast} ease, transform ${theme.motion.fast} ease;
  &:hover { background: rgba(255, 236, 210, 0.22); }
  &:active { transform: scale(0.92); }
  &:focus-visible { outline: 2px solid ${G.gold}; outline-offset: 2px; }
`;

export const Body = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
`;

export const Points = styled.ul`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;

export const Point = styled.li<{ $i: number }>`
  display: flex; gap: ${theme.spacing.ms}; align-items: flex-start;
  animation: ${rise} 0.5s ${theme.motion.out} both;
  animation-delay: ${p => 0.55 + p.$i * 0.12}s;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const PointIcon = styled.span`
  flex-shrink: 0; width: 38px; height: 38px; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: ${theme.colors.secondary};
  background: radial-gradient(circle at 30% 25%, rgba(196,149,106,0.28), rgba(196,149,106,0.07));
  border: 1px solid rgba(196,149,106,0.45);
`;

export const PointText = styled.span`
  display: flex; flex-direction: column; gap: 1px;
  strong { font-size: ${theme.fontSizes.md}; color: ${theme.colors.primary}; font-weight: 800; }
  span { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; line-height: 1.55; }
`;

export const Note = styled.p`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textLight}; text-align: center; line-height: 1.6;`;

export const Actions = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.xs};
  padding: 0 ${theme.spacing.lg} calc(${theme.spacing.lg} + env(safe-area-inset-bottom, 0px));
`;

const sheen = keyframes`from { transform: translateX(160%) skewX(-20deg); } to { transform: translateX(-260%) skewX(-20deg); }`;

export const Cta = styled.button`
  position: relative; overflow: hidden;
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: 52px; border-radius: 16px;
  font-size: ${theme.fontSizes.lg}; font-weight: 800; color: ${G.onGold};
  background: linear-gradient(180deg, ${G.goldLight} 0%, ${G.gold} 45%, ${G.goldDeep} 100%);
  box-shadow: 0 8px 22px rgba(184, 134, 63, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.45);
  transition: transform ${theme.motion.fast} ease, box-shadow ${theme.motion.fast} ease;
  &::after {
    content: ''; position: absolute; top: -20%; bottom: -20%; width: 40%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.45), transparent);
    animation: ${sheen} 2.8s ease-in-out 1.4s infinite;
  }
  &:hover { box-shadow: 0 12px 28px rgba(184, 134, 63, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.45); }
  &:active { transform: scale(0.97); }
  &:focus-visible { outline: 3px solid ${theme.colors.primary}; outline-offset: 3px; }
  @media (prefers-reduced-motion: reduce) { &::after { animation: none; display: none; } }
`;

export const Later = styled.button`
  min-height: 44px; font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
  &:hover { color: ${theme.colors.primary}; }
`;
