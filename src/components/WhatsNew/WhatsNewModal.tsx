'use client';

import { useEffect, useId, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { useBodyScrollLock } from '@/components/common/useBodyScrollLock';
import type { WhatsNewFeature } from './features';
import {
  Backdrop, Frame, Card, CloseBtn, Body, Points, Point, PointIcon, PointText, Note, Actions, Cta, Later,
} from './whatsNewStyles';

interface Props { feature: WhatsNewFeature; closing: boolean; onClose: () => void; }

/** Centered announcement card: hero, points, one call to action. Esc / backdrop / ✕ close it. */
export default function WhatsNewModal({ feature, closing, onClose }: Props) {
  const titleId = useId();
  const router = useRouter();
  const ctaRef = useRef<HTMLButtonElement>(null);
  useBodyScrollLock(true);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    ctaRef.current?.focus({ preventScroll: true });
    return () => opener?.focus?.({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const act = () => {
    onClose();
    if ('run' in feature.cta) window.setTimeout(feature.cta.run, 280);
    else router.push(feature.cta.href);
  };

  // Keep Tab inside the dialog.
  const trap = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Tab') return;
    const f = e.currentTarget.querySelectorAll<HTMLElement>('button, a[href]');
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };

  return (
    <Backdrop $out={closing} onClick={onClose}>
      <Frame $out={closing} role="dialog" aria-modal="true" aria-labelledby={titleId}
        onClick={e => e.stopPropagation()} onKeyDown={trap}>
        <Card>
          <CloseBtn type="button" onClick={onClose} aria-label={HE.WN_CLOSE}><LineIcon name="close" size={18} /></CloseBtn>
          {feature.hero(titleId)}
          <Body>
            <Points>
              {feature.points.map((p, i) => (
                <Point key={p.title} $i={i}>
                  <PointIcon><LineIcon name={p.icon} size={20} /></PointIcon>
                  <PointText><strong>{p.title}</strong><span>{p.text}</span></PointText>
                </Point>
              ))}
            </Points>
            {feature.note && <Note>{feature.note}</Note>}
          </Body>
          <Actions>
            <Cta ref={ctaRef} type="button" onClick={act}>{feature.cta.label} <span aria-hidden="true">←</span></Cta>
            <Later type="button" onClick={onClose}>{HE.WN_LATER}</Later>
          </Actions>
        </Card>
      </Frame>
    </Backdrop>
  );
}
