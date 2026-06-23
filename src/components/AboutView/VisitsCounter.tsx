'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.xl} ${theme.spacing.xxl};
  box-shadow: ${theme.shadows.md};
  width: 100%; max-width: 560px;
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.sm}; text-align: center;
  position: relative; overflow: hidden;
  &::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, ${theme.colors.primary}08, ${theme.colors.secondary}12);
    pointer-events: none;
  }
`;

const SectionTitle = styled.h2`
  font-size: 1rem; font-weight: 600; color: ${theme.colors.textMuted};
  width: 100%; border-bottom: 2px solid ${theme.colors.borderLight};
  padding-bottom: ${theme.spacing.sm}; margin-bottom: ${theme.spacing.sm};
`;

const Emoji = styled.div`font-size: 2.8rem; line-height: 1;`;

const CountWrap = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 4px;
`;

const CountNum = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 4rem; font-weight: 900; line-height: 1;
  color: ${theme.colors.primary};
  letter-spacing: -0.02em;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const CountLabel = styled.div`
  font-size: 1rem; font-weight: 600; color: ${theme.colors.text};
`;

const CountSub = styled.div`
  font-size: 0.8rem; color: ${theme.colors.textMuted};
`;

export default function VisitsCounter() {
  const [count, setCount] = useState<number | null>(null);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    fetch('/api/visits')
      .then(r => r.json())
      .then((d: { count: number }) => setCount(d.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (count === null) return;
    const duration = 1800;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * count));
      if (step >= steps) { setDisplayed(count); clearInterval(timer); }
    }, interval);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <Card>
      <SectionTitle>שימושים במערכת</SectionTitle>
      <Emoji>🌍</Emoji>
      <CountWrap>
        <CountNum>{count === null ? '...' : displayed.toLocaleString('he-IL')}</CountNum>
        <CountLabel>ביקורים ייחודיים</CountLabel>
        <CountSub>ממשתמשים שונים מכל הזמנים</CountSub>
      </CountWrap>
    </Card>
  );
}
