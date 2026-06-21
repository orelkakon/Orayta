'use client';

import { useEffect, useState, useCallback } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'orayta_a2hs_dismissed';

const Banner = styled.div`
  position: fixed; bottom: 0; left: 0; right: 0;
  background: ${theme.colors.primary}; color: white;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  display: flex; align-items: center; gap: ${theme.spacing.md};
  z-index: 200; box-shadow: 0 -4px 20px rgba(0,0,0,0.3);
  @media (max-width: 500px) {
    flex-direction: column; align-items: stretch;
    padding: ${theme.spacing.sm} ${theme.spacing.md}; gap: ${theme.spacing.sm};
  }
`;
const BannerContent = styled.div`display:flex;align-items:center;gap:${theme.spacing.sm};flex:1`;
const BannerTitle = styled.div`font-size:.9rem;font-weight:600`;
const BannerDesc = styled.div`font-size:.78rem;opacity:.8`;
const BannerActions = styled.div`display:flex;gap:${theme.spacing.sm};align-items:center;flex-shrink:0`;
const InstallBtn = styled.button`
  background:white;color:${theme.colors.primary};border-radius:${theme.radii.sm};
  padding:6px 16px;font-size:.85rem;font-weight:600;
  transition:opacity .15s;&:hover{opacity:.85}
`;
const DismissBtn = styled.button`
  color:rgba(255,255,255,.7);font-size:.82rem;padding:6px 8px;
  transition:color .15s;&:hover{color:white}
`;
const Overlay = styled.div`
  position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:300;
  display:flex;align-items:flex-end;justify-content:center;padding:${theme.spacing.md}
`;
const Modal = styled.div`
  background:${theme.colors.surface};
  border-radius:${theme.radii.xl} ${theme.radii.xl} ${theme.radii.md} ${theme.radii.md};
  padding:${theme.spacing.xl};width:100%;max-width:440px;
  display:flex;flex-direction:column;gap:${theme.spacing.md}
`;
const ModalTitle = styled.h3`font-size:1.1rem;color:${theme.colors.text};text-align:center`;
const Step = styled.div`display:flex;align-items:flex-start;gap:${theme.spacing.sm}`;
const StepNum = styled.div`
  width:26px;height:26px;border-radius:50%;background:${theme.colors.primary};
  color:white;font-size:.8rem;font-weight:700;
  display:flex;align-items:center;justify-content:center;flex-shrink:0
`;
const StepText = styled.span`font-size:.9rem;color:${theme.colors.text};padding-top:3px;line-height:1.5`;
const CloseBtn = styled.button`
  margin-top:${theme.spacing.sm};padding:10px;border-radius:${theme.radii.md};
  background:${theme.colors.surfaceAlt};color:${theme.colors.textMuted};
  font-size:.88rem;font-weight:500;text-align:center;width:100%;
  transition:background .15s;&:hover{background:${theme.colors.border}}
`;

export default function AddToHomeScreen() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [showIos, setShowIos] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const nav = window.navigator as Navigator & { standalone?: boolean };
    if (nav.standalone) return;
    if (localStorage.getItem(DISMISSED_KEY)) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIos) {
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = useCallback(() => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setShow(false);
    setShowIos(false);
  }, []);

  const install = useCallback(async () => {
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) { setShowIos(true); return; }
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') { setShow(false); setInstallPrompt(null); }
  }, [installPrompt]);

  if (!show) return null;

  return (
    <>
      {!showIos && (
        <Banner>
          <BannerContent>
            <span style={{ fontSize: '1.4rem' }}>📱</span>
            <div><BannerTitle>{HE.A2HS_TITLE}</BannerTitle><BannerDesc>{HE.A2HS_DESC}</BannerDesc></div>
          </BannerContent>
          <BannerActions>
            <InstallBtn onClick={install}>{HE.A2HS_BTN}</InstallBtn>
            <DismissBtn onClick={dismiss}>{HE.A2HS_DISMISS}</DismissBtn>
          </BannerActions>
        </Banner>
      )}
      {showIos && (
        <Overlay onClick={() => setShowIos(false)}>
          <Modal onClick={e => e.stopPropagation()}>
            <ModalTitle>{HE.A2HS_IOS_TITLE}</ModalTitle>
            <Step><StepNum>1</StepNum><StepText>{HE.A2HS_IOS_STEP1}</StepText></Step>
            <Step><StepNum>2</StepNum><StepText>{HE.A2HS_IOS_STEP2}</StepText></Step>
            <Step><StepNum>3</StepNum><StepText>{HE.A2HS_IOS_STEP3}</StepText></Step>
            <CloseBtn onClick={dismiss}>{HE.A2HS_DISMISS}</CloseBtn>
          </Modal>
        </Overlay>
      )}
    </>
  );
}
