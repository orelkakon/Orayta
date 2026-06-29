'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const scaleIn = keyframes`
  from { opacity: 0; transform: scale(0.75); }
  to   { opacity: 1; transform: scale(1); }
`;

const glowPulse = keyframes`
  0%, 100% { box-shadow: 0 0 18px rgba(255,215,0,0.35), 0 0 40px rgba(255,215,0,0.12); }
  50%       { box-shadow: 0 0 36px rgba(255,215,0,0.7),  0 0 80px rgba(255,215,0,0.3); }
`;

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

const trophyBounce = keyframes`
  0%, 100% { transform: translateY(0) scale(1); }
  30%       { transform: translateY(-14px) scale(1.08); }
  60%       { transform: translateY(-4px)  scale(1.02); }
`;

const floatUp = keyframes`
  0%   { opacity: 1; transform: translateY(0)   rotate(0deg)   scale(1); }
  100% { opacity: 0; transform: translateY(-80px) rotate(360deg) scale(0.4); }
`;

const Card = styled.div`
  background: linear-gradient(135deg, #fffbe6 0%, #fff8d6 50%, #ffeea3 100%);
  border: 2.5px solid #ffd700;
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xxl} ${theme.spacing.xl};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.md};
  text-align: center;
  position: relative;
  overflow: hidden;
  animation: ${scaleIn} 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both,
             ${glowPulse} 2.4s ease-in-out 0.6s infinite;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      105deg,
      transparent 35%,
      rgba(255, 255, 255, 0.55) 50%,
      transparent 65%
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3.5s linear infinite;
    pointer-events: none;
  }
`;

const Trophy = styled.div`
  font-size: 4.5rem;
  line-height: 1;
  animation: ${trophyBounce} 1.8s ease-in-out infinite;
  filter: drop-shadow(0 0 12px rgba(255, 215, 0, 0.9))
          drop-shadow(0 0 28px rgba(255, 180, 0, 0.5));
  position: relative;
  z-index: 1;
`;

const Title = styled.h2`
  font-size: 1.7rem;
  font-weight: 800;
  background: linear-gradient(90deg, #a0680a, #f5c400, #d4920a, #f5c400, #a0680a);
  background-size: 300% auto;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: ${shimmer} 2.5s linear infinite;
  position: relative;
  z-index: 1;
`;

const Sub = styled.p`
  font-size: 0.97rem;
  color: #8a6500;
  opacity: 0.85;
  position: relative;
  z-index: 1;
`;

const ResetBtn = styled.button`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: linear-gradient(135deg, #e6b800, #ffd700, #e6b800);
  background-size: 200% auto;
  color: #5a4000;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 700;
  border: none;
  cursor: pointer;
  position: relative;
  z-index: 1;
  transition: filter 0.2s, transform 0.15s;
  &:hover {
    filter: brightness(1.08);
    transform: translateY(-2px);
  }
  &:active { transform: translateY(0); }
`;

const StarWrap = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
`;

interface StarProps { $x: number; $delay: number; $size: number; }
const Star = styled.span<StarProps>`
  position: absolute;
  bottom: 8%;
  left: ${({ $x }) => $x}%;
  font-size: ${({ $size }) => $size}rem;
  animation: ${floatUp} 2.2s ease-out ${({ $delay }) => $delay}s infinite;
  opacity: 0;
  user-select: none;
`;

const STARS: StarProps[] = [
  { $x: 8,  $delay: 0,    $size: 1.1 },
  { $x: 22, $delay: 0.35, $size: 0.75 },
  { $x: 38, $delay: 0.7,  $size: 1.4 },
  { $x: 52, $delay: 0.15, $size: 0.85 },
  { $x: 66, $delay: 0.9,  $size: 1.2 },
  { $x: 80, $delay: 0.45, $size: 0.7 },
  { $x: 14, $delay: 1.1,  $size: 1.05 },
  { $x: 72, $delay: 0.6,  $size: 0.95 },
];

interface Props { onReset: () => void; }

export default function AllDoneCard({ onReset }: Props) {
  return (
    <Card>
      <StarWrap>
        {STARS.map((s, i) => (
          <Star key={i} $x={s.$x} $delay={s.$delay} $size={s.$size}>⭐</Star>
        ))}
      </StarWrap>
      <Trophy>🏆</Trophy>
      <Title>{HE.QUIZ_STREAK_ALL_DONE}</Title>
      <Sub>{HE.QUIZ_STREAK_DONE_SUB}</Sub>
      <ResetBtn onClick={onReset}>{HE.QUIZ_STREAK_RESET}</ResetBtn>
    </Card>
  );
}
