'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

const pop = keyframes`0% { transform: scale(0.92); } 60% { transform: scale(1.04); } 100% { transform: scale(1); }`;

const Wrap = styled.footer`
  max-width: 720px; margin: ${theme.spacing.xl} auto 0; width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding-top: ${theme.spacing.lg}; border-top: 1px solid ${theme.colors.borderLight};
`;

const DoneBtn = styled.button<{ $done: boolean }>`
  display: inline-flex; align-items: center; gap: 10px;
  min-height: 52px; padding: 0 28px; border-radius: 999px;
  font-size: ${theme.fontSizes.lg}; font-weight: 800;
  color: ${p => p.$done ? theme.colors.success : theme.colors.onPrimary};
  background: ${p => p.$done ? theme.colors.bgSuccess : theme.colors.primary};
  border: 2px solid ${p => p.$done ? theme.colors.success : theme.colors.primary};
  box-shadow: ${p => p.$done ? 'none' : theme.shadows.md};
  animation: ${p => p.$done ? pop : 'none'} 0.35s ${theme.motion.spring};
  transition: transform ${theme.motion.fast};
  &:active { transform: scale(0.97); }
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Streak = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${theme.colors.secondary};`;
const Undo = styled.button`font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-decoration: underline; min-height: 32px;`;

const Source = styled.p`
  display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 4px ${theme.spacing.sm};
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; text-align: center;
  a { display: inline-flex; align-items: center; gap: 4px; color: ${theme.colors.secondary}; font-weight: 700; }
`;

interface Props {
  done: boolean;
  streak: number;
  onToggle: () => void;
  version: string | null;
  license: string | null;
  url: string;
}

/** End of the portion: mark it learned (per device, with a day streak) and credit the source. */
export default function LearnFooter({ done, streak, onToggle, version, license, url }: Props) {
  return (
    <Wrap>
      <DoneBtn $done={done} onClick={done ? undefined : onToggle} aria-pressed={done} disabled={done}>
        <LineIcon name="check" size={22} strokeWidth={2.2} />
        {done ? HE.LEARN_DONE_ON : HE.LEARN_DONE_BTN}
      </DoneBtn>
      {streak > 0 && <Streak>🔥 {HE.LEARN_STREAK(streak)}</Streak>}
      {done && <Undo onClick={onToggle}>{HE.LEARN_UNDO}</Undo>}
      <Source>
        {version && <span>{HE.LEARN_SOURCE(version)}{license ? ` (${license})` : ''}</span>}
        <a href={url} target="_blank" rel="noopener noreferrer">{HE.LEARN_OPEN_SEFARIA} ↗</a>
      </Source>
    </Wrap>
  );
}
