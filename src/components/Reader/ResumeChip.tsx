'use client';

import { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';

/** Floating "continue from …" offer; fades away by itself after a while. */
const rise = keyframes`from { opacity: 0; transform: translate(-50%, 12px); } to { opacity: 1; transform: translate(-50%, 0); }`;

const Wrap = styled.div`
  position: fixed; left: 50%; z-index: ${theme.z.toast};
  bottom: calc(max(var(--tabbar-h, 0px), ${theme.safe.bottom}) + 16px);
  transform: translateX(-50%);
  display: flex; align-items: center; gap: 4px; padding: 4px;
  max-width: calc(100vw - 32px);
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.chrome}; color: ${theme.colors.onChrome};
  box-shadow: ${theme.shadows.lg};
  animation: ${rise} 0.32s ${theme.motion.outStrong} both;
`;

const Go = styled.button`
  display: inline-flex; align-items: center; gap: 6px; min-height: 40px; padding: 0 14px;
  border-radius: ${theme.radii.pill}; font-weight: 700; font-size: ${theme.fontSizes.sm};
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
  &:active { transform: scale(0.97); }
`;

const Dismiss = styled.button`
  min-height: 40px; padding: 0 12px; border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; color: color-mix(in srgb, ${theme.colors.onChrome} 75%, transparent);
`;

interface Props { title: string; onGo: () => void }

export default function ResumeChip({ title, onGo }: Props) {
  const [shown, setShown] = useState(true);
  useEffect(() => {
    const t = window.setTimeout(() => setShown(false), 9000);
    return () => window.clearTimeout(t);
  }, []);
  if (!shown) return null;
  return (
    <Wrap role="status">
      <Go type="button" onClick={() => { setShown(false); onGo(); }}>
        <LineIcon name="bookmark" size={16} strokeWidth={2} />{HE.READER_RESUME(title)}
      </Go>
      <Dismiss type="button" onClick={() => setShown(false)}>{HE.READER_RESUME_DISMISS}</Dismiss>
    </Wrap>
  );
}
