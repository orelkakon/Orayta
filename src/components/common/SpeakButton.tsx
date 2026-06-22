'use client';

import { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';

const Btn = styled.button<{ $active: boolean }>`
  font-size: 1rem;
  line-height: 1;
  opacity: ${({ $active }) => ($active ? 1 : 0.45)};
  transition: opacity 0.15s;
  &:hover { opacity: 1; }
`;

export default function SpeakButton({ text }: { text: string }) {
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    setSupported('speechSynthesis' in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const toggle = useCallback(() => {
    if (!supported) return;
    if (active) {
      window.speechSynthesis.cancel();
      setActive(false);
      return;
    }
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = 'he-IL';
    utt.rate = 0.85;
    utt.onend = () => setActive(false);
    utt.onerror = () => setActive(false);
    window.speechSynthesis.speak(utt);
    setActive(true);
  }, [text, active, supported]);

  if (!supported) return null;

  return (
    <Btn $active={active} onClick={toggle} title={active ? 'עצור' : 'הקרא בקול'}>
      {active ? '🔊' : '🔈'}
    </Btn>
  );
}
