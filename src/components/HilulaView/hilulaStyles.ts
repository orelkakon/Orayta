import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

const rise = keyframes`from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; }`;

export const Page = styled.div`
  width: 100%; max-width: 560px; margin: 0 auto;
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0 ${theme.spacing.xl};
  & > * { animation: ${rise} 0.45s ${theme.motion.out} both; }
  @media (prefers-reduced-motion: reduce) { & > * { animation: none; } }
`;

export const Hero = styled.header`display: flex; flex-direction: column; align-items: center; gap: 2px; text-align: center;`;

export const Eyebrow = styled.span`
  font-size: 0.66rem; font-weight: 800; letter-spacing: 0.22em; color: ${theme.colors.secondary};
`;

export const Title = styled.h1`
  margin: 0; font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.h1}; font-weight: 800; color: ${theme.colors.primary};
`;

export const DateLine = styled.div`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.md}; color: ${theme.colors.textMuted};`;

export const Panel = styled.section`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.ms};
  background: linear-gradient(180deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceAlt} 100%);
  border: 1px solid ${theme.colors.borderLight}; border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.lg} ${theme.spacing.md}; box-shadow: ${theme.shadows.sm}; text-align: center;
`;

export const PanelTitle = styled.h2`
  margin: 0; display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800; color: ${theme.colors.primary};
`;

export const LightBtn = styled.button<{ $lit: boolean }>`
  padding: 13px 22px; border-radius: 999px; font-size: ${theme.fontSizes.md}; font-weight: 700;
  background: ${p => (p.$lit ? 'transparent' : theme.colors.primary)};
  color: ${p => (p.$lit ? theme.colors.secondary : theme.colors.onPrimary)};
  border: 1.5px solid ${p => (p.$lit ? theme.colors.secondary : theme.colors.primary)};
  cursor: ${p => (p.$lit ? 'default' : 'pointer')};
  transition: background ${theme.motion.base}, color ${theme.motion.base}, transform ${theme.motion.fast} ${theme.motion.out};
  &:active { transform: scale(0.97); }
`;

export const Counter = styled.div`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

export const Hint = styled.div`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

export const Chips = styled.div`display: flex; flex-wrap: wrap; justify-content: center; gap: ${theme.spacing.sm};`;

export const Chip = styled.a`
  padding: 8px 16px; border-radius: 999px; font-family: ${theme.fonts.body};
  font-size: ${theme.fontSizes.md}; font-weight: 700; color: ${theme.colors.primary};
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.border};
  transition: border-color ${theme.motion.fast}, transform ${theme.motion.fast};
  &:hover { border-color: ${theme.colors.primaryLight}; transform: translateY(-1px); }
`;

export const QuietLink = styled.button`
  align-self: center; display: inline-flex; align-items: center; gap: ${theme.spacing.sm};
  padding: 10px 16px; border-radius: 999px; font-size: ${theme.fontSizes.sm}; font-weight: 600;
  color: ${theme.colors.primaryLight}; border: 1px solid ${theme.colors.borderLight};
  &:hover { background: ${theme.colors.surfaceAlt}; }
`;

export const Muted = styled.p`margin: 0; text-align: center; color: ${theme.colors.textMuted}; font-size: ${theme.fontSizes.sm};`;
