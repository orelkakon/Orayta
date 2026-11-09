import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

export const Form = styled.form`display: flex; flex-direction: column; gap: ${theme.spacing.xs};`;

export const Box = styled.div<{ $live?: boolean }>`
  display: flex; align-items: flex-end; gap: ${theme.spacing.sm};
  background: ${theme.colors.surface}; border: 1.5px solid ${p => (p.$live ? theme.colors.secondary : theme.colors.border)};
  border-radius: ${theme.radii.lg}; padding: ${theme.spacing.sm};
  transition: border-color ${theme.motion.fast};
  &:focus-within { border-color: ${theme.colors.secondary}; }
  ${p => p.$live && css`align-items: center;`}
`;

/* 16px font: anything smaller makes iOS zoom the page on focus. */
export const Input = styled.textarea`
  flex: 1; min-width: 0; resize: none; border: none; outline: none; background: transparent;
  font-family: ${theme.fonts.ui}; font-size: 16px; line-height: 1.5; color: ${theme.colors.text};
  min-height: 48px; max-height: 140px; padding: 4px;
  &::placeholder { color: ${theme.colors.textLight}; }
`;

const glow = keyframes`
  0% { box-shadow: 0 0 0 0 ${theme.gilded.glow}; }
  70% { box-shadow: 0 0 0 10px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
`;

/** The round button at the end of the box: microphone, send, or (while recording) cancel / done. */
export const Action = styled.button<{ $quiet?: boolean; $send?: boolean; $glow?: boolean }>`
  width: 42px; height: 42px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  background: ${p => (p.$quiet ? 'transparent' : theme.colors.primary)};
  color: ${p => (p.$quiet ? theme.colors.textMuted : theme.colors.onPrimary)};
  border: ${p => (p.$quiet ? `1px solid ${theme.colors.border}` : 'none')};
  transition: transform ${theme.motion.fast} ${theme.motion.out}, opacity ${theme.motion.fast};
  &:active { transform: scale(0.92); }
  &:disabled { opacity: 0.4; }
  ${p => p.$send && css`& > svg { transform: scaleX(-1); }`}
  ${p => p.$glow && css`
    animation: ${glow} 1.6s ${theme.motion.out} 2;
    @media (prefers-reduced-motion: reduce) { animation: none; }
  `}
`;

export const VoiceNote = styled.p<{ $error: boolean }>`
  margin: 0; font-size: ${theme.fontSizes.sm}; line-height: 1.5;
  color: ${p => (p.$error ? theme.colors.error : theme.colors.textMuted)};
`;

export const Meta = styled.div`display: flex; justify-content: space-between; align-items: center; gap: ${theme.spacing.sm};`;
export const Counter = styled.span<{ $over: boolean }>`
  font-size: ${theme.fontSizes.xs}; font-variant-numeric: tabular-nums; direction: ltr;
  color: ${p => (p.$over ? theme.colors.error : theme.colors.textLight)};
`;

/* Bots fill every field; people never see this one. */
export const Honeypot = styled.input`position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0;`;
