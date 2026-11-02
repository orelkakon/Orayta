'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import RabbiBotAvatar, { AvatarMood } from '@/components/RabbiBot/RabbiBotAvatar';
import { rise } from './whatsNewStyles';

const G = theme.game;

const spin = keyframes`to { transform: rotate(360deg); }`;
const bob = keyframes`0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); }`;
const twinkle = keyframes`0%, 100% { opacity: 0.15; transform: scale(0.7); } 50% { opacity: 1; transform: scale(1); }`;
const dot = keyframes`0%, 80%, 100% { opacity: 0.25; } 40% { opacity: 1; }`;

const Stage = styled.div`
  position: relative; overflow: hidden; isolation: isolate;
  background: ${G.stage}; color: ${G.ink};
  padding: ${theme.spacing.xl} ${theme.spacing.lg} ${theme.spacing.lg};
  display: flex; flex-direction: column; align-items: center; text-align: center; gap: ${theme.spacing.sm};
`;

/* Slow-turning god-rays behind the character. */
const Rays = styled.div`
  position: absolute; z-index: -1; top: -120px; left: 50%; width: 420px; height: 420px; margin-left: -210px;
  background: repeating-conic-gradient(from 0deg, ${G.goldGlow} 0deg 6deg, transparent 6deg 22deg);
  mask-image: radial-gradient(circle, #000 18%, transparent 62%);
  -webkit-mask-image: radial-gradient(circle, #000 18%, transparent 62%);
  animation: ${spin} 60s linear infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Spark = styled.span<{ $x: string; $y: string; $d: number }>`
  position: absolute; z-index: -1; left: ${p => p.$x}; top: ${p => p.$y};
  color: ${G.gold}; font-size: 11px; line-height: 1;
  animation: ${twinkle} 2.6s ease-in-out ${p => p.$d}s infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; opacity: 0.6; }
`;

const Halo = styled.div`
  position: relative; padding: 10px; border-radius: 50%;
  background: radial-gradient(circle, rgba(226,184,107,0.32), transparent 70%);
  animation: ${bob} 3.6s ease-in-out infinite;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const Eyebrow = styled.span`
  font-size: 0.72rem; font-weight: 800; letter-spacing: 0.18em; color: ${G.gold};
  padding: 4px 14px; border-radius: 999px; border: 1px solid ${G.glassLine}; background: ${G.glass};
`;

const Title = styled.h2`
  font-family: ${theme.fonts.body}; font-size: clamp(1.7rem, 7vw, 2.1rem); font-weight: 900; line-height: 1.15;
  background: linear-gradient(180deg, ${G.goldInk} 0%, ${G.gold} 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent;
`;

const Lead = styled.p`font-size: ${theme.fontSizes.sm}; color: ${G.inkMuted}; line-height: 1.65; max-width: 330px;`;

const Chat = styled.div`
  width: 100%; max-width: 340px; min-height: 132px; margin-top: ${theme.spacing.xs};
  display: flex; flex-direction: column; gap: 8px; text-align: right;
`;

const Ask = styled.div`
  align-self: flex-start; max-width: 88%;
  padding: 8px 14px; border-radius: 16px 16px 4px 16px;
  background: ${G.glassHi}; border: 1px solid ${G.glassLine};
  font-size: ${theme.fontSizes.sm}; color: ${G.ink}; min-height: 38px;
`;

const Caret = styled.span`
  display: inline-block; width: 2px; height: 1em; margin-inline-start: 2px; vertical-align: -2px;
  background: ${G.gold}; animation: ${dot} 1s steps(1) infinite;
`;

const Thinking = styled.div`
  align-self: flex-end; display: flex; gap: 5px; padding: 12px 16px; border-radius: 16px;
  background: ${G.glass};
  span { width: 7px; height: 7px; border-radius: 50%; background: ${G.gold}; animation: ${dot} 1.2s infinite; }
  span:nth-child(2) { animation-delay: 0.15s; } span:nth-child(3) { animation-delay: 0.3s; }
`;

const Answer = styled.div`
  align-self: flex-end; max-width: 92%;
  padding: 10px 14px; border-radius: 16px 16px 16px 4px;
  background: linear-gradient(180deg, rgba(255,236,210,0.16), rgba(255,236,210,0.08));
  border: 1px solid rgba(226,184,107,0.42);
  display: flex; flex-direction: column; gap: 6px;
  animation: ${rise} 0.45s ${theme.motion.out} both;
  @media (prefers-reduced-motion: reduce) { animation: none; }
`;

const AnswerText = styled.span`font-size: ${theme.fontSizes.sm}; font-weight: 700; color: ${G.ink};`;
const Source = styled.span`
  align-self: flex-start; font-size: 0.72rem; font-weight: 700; color: ${G.onGold};
  background: ${G.gold}; border-radius: 999px; padding: 2px 10px;
`;
const Verified = styled.span`display: inline-flex; align-items: center; gap: 4px; font-size: 0.7rem; color: ${G.rightSoft};`;

const SPARKS = [
  { x: '12%', y: '18%', d: 0 }, { x: '84%', y: '14%', d: 0.8 }, { x: '20%', y: '52%', d: 1.6 },
  { x: '78%', y: '46%', d: 0.4 }, { x: '8%', y: '78%', d: 1.2 }, { x: '90%', y: '72%', d: 2 },
];

type Step = 'typing' | 'think' | 'answer';

/** Dark stage: the character, then a tiny live demo — question typed, answer with a verified source. */
export default function RabbiBotHero({ titleId }: { titleId: string }) {
  const q = HE.WN_RB_DEMO_Q;
  const [typed, setTyped] = useState(0);
  const [step, setStep] = useState<Step>('typing');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setTyped(q.length); setStep('answer'); return; }
    let i = 0;
    let tick: number | undefined;
    const timers: number[] = [];
    timers.push(window.setTimeout(() => {
      tick = window.setInterval(() => {
        i += 1;
        setTyped(i);
        if (i >= q.length) {
          window.clearInterval(tick);
          setStep('think');
          timers.push(window.setTimeout(() => setStep('answer'), 1200));
        }
      }, 48);
    }, 650));
    return () => { timers.forEach(window.clearTimeout); window.clearInterval(tick); };
  }, [q]);

  const mood: AvatarMood = step === 'think' ? 'think' : step === 'answer' ? 'happy' : 'idle';

  return (
    <Stage>
      <Rays aria-hidden="true" />
      {SPARKS.map((s, i) => <Spark key={i} $x={s.x} $y={s.y} $d={s.d} aria-hidden="true">✦</Spark>)}
      <Eyebrow>✦ {HE.WN_EYEBROW} ✦</Eyebrow>
      <Halo><RabbiBotAvatar size={104} mood={mood} /></Halo>
      <Title id={titleId}>{HE.WN_RB_TITLE}</Title>
      <Lead>{HE.WN_RB_LEAD}</Lead>
      <Chat aria-hidden="true">
        <Ask>{q.slice(0, typed)}{step === 'typing' && <Caret />}</Ask>
        {step === 'think' && <Thinking><span /><span /><span /></Thinking>}
        {step === 'answer' && (
          <Answer>
            <AnswerText>{HE.WN_RB_DEMO_A}</AnswerText>
            <Source>{HE.WN_RB_DEMO_SRC}</Source>
            <Verified><LineIcon name="check" size={13} strokeWidth={2.4} /> {HE.WN_RB_DEMO_VERIFIED}</Verified>
          </Answer>
        )}
      </Chat>
    </Stage>
  );
}
