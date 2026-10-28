'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import type { RabbiBotStep } from '@/types/rabbiBot';
import RabbiBotAvatar, { AvatarMood } from './RabbiBotAvatar';
import Bookshelf from './Bookshelf';

const ORDER: RabbiBotStep[] = ['plan', 'search', 'read', 'answer', 'verify'];
const MOOD: Record<RabbiBotStep, AvatarMood> = { plan: 'think', search: 'think', read: 'write', answer: 'write', verify: 'happy' };

const bob = keyframes`0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-6px) rotate(2deg); }`;
const fadeIn = keyframes`from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; }`;
const write = keyframes`0% { width: 0; } 70%, 100% { width: var(--w); }`;
const quill = keyframes`0% { inset-inline-start: 0; } 70%, 100% { inset-inline-start: calc(var(--w) - 6px); }`;

const Stage = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  border-radius: ${theme.radii.lg}; border: 1px solid ${theme.colors.borderLight};
  background: radial-gradient(ellipse at 50% 0%, color-mix(in srgb, ${theme.colors.secondary} 18%, transparent), transparent 70%), ${theme.colors.surfaceAlt};
`;

const Avatar = styled.div`
  animation: ${bob} 2.6s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Head = styled.div`text-align: center; display: flex; flex-direction: column; gap: 4px; animation: ${fadeIn} 0.35s ease both;`;
const Headline = styled.div`font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 800; color: ${theme.colors.primary};`;
const Sub = styled.div`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Parchment = styled.div`
  width: min(100%, 300px); padding: ${theme.spacing.ms} ${theme.spacing.md};
  border-radius: ${theme.radii.md}; background: ${theme.colors.surface}; border: 1px solid ${theme.colors.border};
  display: flex; flex-direction: column; gap: 9px;
`;
const Line = styled.div<{ $w: number; $d: number }>`
  --w: ${p => p.$w}%; position: relative; height: 6px;
  & > i {
    display: block; height: 100%; border-radius: 3px; background: ${theme.colors.border};
    animation: ${write} 2.4s ease-in-out ${p => p.$d}s infinite;
  }
  & > b {
    position: absolute; bottom: 0; color: ${theme.colors.secondary};
    animation: ${quill} 2.4s ease-in-out ${p => p.$d}s infinite;
  }
  @media (prefers-reduced-motion: reduce) { & > i, & > b { animation: none; width: var(--w); } }
`;

const Dots = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; gap: 6px;`;
const StepDot = styled.li<{ $on: boolean; $now: boolean }>`
  width: ${p => (p.$now ? '22px' : '8px')}; height: 8px; border-radius: 999px;
  background: ${p => (p.$on ? theme.colors.secondary : theme.colors.border)};
  transition: width ${theme.motion.base} ${theme.motion.out}, background ${theme.motion.base};
`;

interface Props { steps: { step: RabbiBotStep; count?: number; books?: string[] }[] }

/** What רבי־בוט is doing right now — the real books it found, writing, then checking quotes. */
export default function ThinkingStage({ steps }: Props) {
  const reached = steps.length ? Math.max(...steps.map(s => ORDER.indexOf(s.step))) : 0;
  const step = ORDER[reached];
  const read = steps.find(s => s.step === 'read');
  const books = read?.books ?? [];
  const headline = step === 'read' && read?.count !== undefined ? HE.RB_STEP_READ(read.count) : HE.RB_STEPS[step];

  return (
    <Stage aria-live="polite" aria-busy="true">
      <Avatar><RabbiBotAvatar size={76} mood={MOOD[step]} /></Avatar>
      <Head key={step}>
        <Headline>{headline}</Headline>
        <Sub>{HE.RB_STEPS_SUB[step]}</Sub>
      </Head>
      {step !== 'plan' && <Bookshelf books={books} verifying={step === 'verify'} />}
      {step === 'answer' && (
        <Parchment aria-hidden="true">
          {[92, 78, 86, 54].map((w, i) => (
            <Line key={i} $w={w} $d={i * 0.6}><i /><b><LineIcon name="quill" size={16} /></b></Line>
          ))}
        </Parchment>
      )}
      <Dots aria-label={HE.RB_STEP_ARIA(reached + 1, ORDER.length, HE.RB_STEPS[step])}>
        {ORDER.map((s, i) => <StepDot key={s} $on={i <= reached} $now={i === reached} />)}
      </Dots>
    </Stage>
  );
}
