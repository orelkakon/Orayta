'use client';

import { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Button } from '@/components/ui/Button';
import { LineIcon } from '@/components/common/LineIcons';
import { shareTextSmart } from '@/lib/siteUrl';
import { trackShare } from '@/lib/shareCounter';
import { answerShareText } from '@/lib/rabbiBot/share';
import type { RabbiBotAnswer } from '@/types/rabbiBot';

const Row = styled.div`display: flex; flex-wrap: wrap; gap: ${theme.spacing.sm};`;

const COPIED_MS = 1800;

/** Share the answer (native sheet, WhatsApp otherwise) or copy it as text. */
export default function ShareAnswer({ question, answer }: { question: string; answer: RabbiBotAnswer }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const text = () => answerShareText(question, answer);
  const share = () => {
    trackShare('wa');
    void shareTextSmart(text(), HE.RB_NAME);
  };
  const copy = () => {
    void navigator.clipboard?.writeText(text()).then(() => {
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), COPIED_MS);
    }).catch(() => undefined);
  };

  return (
    <Row>
      <Button $size="sm" $variant="tonal" onClick={share}><LineIcon name="share" size={17} />{HE.RB_SHARE}</Button>
      <Button $size="sm" $variant="ghost" onClick={copy} aria-live="polite">
        <LineIcon name={copied ? 'check' : 'copy'} size={17} />{copied ? HE.RB_COPIED : HE.RB_COPY}
      </Button>
    </Row>
  );
}
