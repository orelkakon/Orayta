import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

/** Shared surfaces of חלוקת תהילים: the night "dedication" card and page sections. */
const rise = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;

export const Page = styled.div`
  width: 100%; max-width: 760px; margin: 0 auto; padding-bottom: ${theme.spacing.xxl};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;

export const Night = styled.section`
  position: relative; overflow: hidden; isolation: isolate;
  border-radius: 24px; padding: ${theme.spacing.lg};
  background: ${theme.gilded.night}; color: ${theme.gilded.nightInk};
  box-shadow: ${theme.gilded.nightShadow}, 0 0 0 1px ${theme.gilded.nightLine} inset;
  animation: ${rise} 0.4s ${theme.motion.outStrong} both;
  &::before { content: ''; position: absolute; inset: 0; z-index: -1; pointer-events: none; background: ${theme.gilded.nightGlow}; }
  ${theme.up.md} { padding: ${theme.spacing.xl}; border-radius: 28px; }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

export const Kicker = styled.p`
  margin: 0; display: inline-flex; align-items: center; gap: 6px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.game.goldLight};
`;

export const Dedication = styled.h1`
  margin: 6px 0 0; font-family: ${theme.fonts.body}; font-weight: 700; line-height: 1.2;
  font-size: clamp(1.7rem, 1.3rem + 2vw, 2.4rem); color: ${theme.gilded.nightInk};
  text-wrap: balance;
`;

export const NightText = styled.p`
  margin: ${theme.spacing.sm} 0 0; font-size: ${theme.fontSizes.md}; line-height: 1.6;
  color: ${theme.gilded.nightMuted}; white-space: pre-line;
`;

export const NightTag = styled.span`
  display: inline-flex; align-items: center; gap: 5px; height: 28px; padding: 0 11px;
  border-radius: ${theme.radii.pill}; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${theme.game.goldInk}; background: ${theme.gilded.nightTag}; border: 1px solid ${theme.gilded.nightLine};
`;

export const Section = styled.section`display: flex; flex-direction: column; gap: ${theme.spacing.ms};`;

export const SectionTitle = styled.h2`
  margin: 0; font-size: ${theme.fontSizes.lg}; font-weight: 700; color: ${theme.colors.text};
  display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};
  & > small { font-size: ${theme.fontSizes.xs}; font-weight: 500; color: ${theme.colors.textMuted}; }
`;

export const Muted = styled.p`margin: 0; font-size: ${theme.fontSizes.sm}; line-height: 1.55; color: ${theme.colors.textMuted};`;
