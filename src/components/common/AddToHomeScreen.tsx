'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import {
  INSTALL_GUIDE_EVENT, bumpSnooze, initInstall, installMode, isSecondPlusVisitDay, isSnoozed,
  isStandalone, promptInstall, subscribeInstall,
} from '@/lib/install';

/**
 * The install sheet. It offers itself from the second visit day (then stays
 * quiet for 14 / 60 days after a dismissal), and opens on demand as the iOS
 * step-by-step guide when an "install" button asks (INSTALL_GUIDE_EVENT).
 */
const slideUp = keyframes`from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}`;
const Backdrop = styled.div`position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:${theme.z.toast}`;
const Sheet = styled.div`
  position:fixed;left:0;right:0;margin:0 auto;max-width:420px;bottom:24px;
  background:${theme.colors.surface};border:1px solid ${theme.colors.borderLight};
  border-radius:20px;box-shadow:${theme.shadows.lg};z-index:${theme.z.toast};direction:rtl;
  display:flex;flex-direction:column;gap:${theme.spacing.md};
  padding:${theme.spacing.lg} ${theme.spacing.lg} calc(${theme.spacing.lg} + env(safe-area-inset-bottom, 0px));
  animation:${slideUp} .5s ${theme.motion.spring} both;
  ${theme.media.md}{
    bottom:${theme.layout.tabbarClear};
    max-width:none;border-radius:20px 20px 0 0;padding-bottom:${theme.spacing.lg};
  }
`;
const TopRow = styled.div`display:flex;align-items:center;gap:${theme.spacing.ms}`;
const AppMark = styled.div`
  width:44px;height:44px;border-radius:12px;flex-shrink:0;
  background:${theme.colors.primary};color:${theme.colors.accent};
  font-family:${theme.fonts.body};font-size:1.6rem;font-weight:700;line-height:1;
  display:flex;align-items:center;justify-content:center;box-shadow:${theme.shadows.sm};
`;
const Headline = styled.div`font-size:${theme.fontSizes.lg};font-weight:700;color:${theme.colors.text}`;
const Tagline = styled.div`font-size:${theme.fontSizes.xs};color:${theme.colors.textMuted}`;
const Benefits = styled.div`display:flex;flex-direction:column;gap:${theme.spacing.sm}`;
const Benefit = styled.div`display:flex;align-items:center;gap:${theme.spacing.sm};font-size:.85rem;color:${theme.colors.text}`;
const BIcon = styled.span`color:${theme.colors.primary};display:flex;flex-shrink:0`;
const BtnRow = styled.div`display:flex;gap:${theme.spacing.sm};align-items:center`;
const PrimaryBtn = styled.button`
  flex:1;background:${theme.colors.primary};color:${theme.colors.onPrimary};
  border-radius:${theme.radii.md};padding:12px;font-size:${theme.fontSizes.sm};font-weight:600;
  transition:transform ${theme.motion.fast} ${theme.motion.out},opacity ${theme.motion.fast};
  &:hover{opacity:.92}&:active{transform:scale(.97)}
`;
const GhostBtn = styled.button`
  padding:12px 14px;border-radius:${theme.radii.md};color:${theme.colors.textMuted};
  font-size:${theme.fontSizes.sm};font-weight:500;
  transition:background ${theme.motion.fast};&:hover{background:${theme.colors.surfaceAlt}}
`;
const GuideTitle = styled.h3`font-size:${theme.fontSizes.lg};font-weight:700;color:${theme.colors.text};text-align:center`;
const Step = styled.div`display:flex;align-items:flex-start;gap:${theme.spacing.ms}`;
const StepNum = styled.div`
  width:26px;height:26px;border-radius:50%;background:${theme.colors.primary};color:${theme.colors.onPrimary};
  font-size:.8rem;font-weight:700;display:flex;align-items:center;justify-content:center;flex-shrink:0`;
const StepText = styled.span`font-size:${theme.fontSizes.sm};color:${theme.colors.text};padding-top:3px;line-height:1.5`;
const SafariNote = styled.div`font-size:${theme.fontSizes.xs};color:${theme.colors.textMuted};text-align:center`;
const ShareSvg = styled.svg`vertical-align:-3px;margin-inline-start:2px;color:${theme.colors.primary}`;

/** The real iOS share glyph (box with up-arrow), inline — not an emoji. */
const ShareGlyph = () => (
  <ShareSvg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </ShareSvg>
);

export default function AddToHomeScreen() {
  const [visible, setVisible] = useState(false);
  const [guide, setGuide] = useState(false);
  const asked = useRef(false); // opened by a button, not by us — closing it is not a "no"

  useEffect(() => {
    if (isStandalone()) return;
    initInstall();
    const onGuide = () => { asked.current = true; setGuide(true); setVisible(true); };
    window.addEventListener(INSTALL_GUIDE_EVENT, onGuide);

    let timer: number | undefined;
    const auto = !isSnoozed() && isSecondPlusVisitDay();
    const sync = () => {
      const mode = installMode();
      if (!mode) { if (!asked.current) setVisible(false); return; }
      // Show once, after a calm 2.5s — never mid-page-load.
      if (auto && timer === undefined) timer = window.setTimeout(() => setVisible(true), 2500);
    };
    sync();
    const off = subscribeInstall(sync);
    return () => {
      window.removeEventListener(INSTALL_GUIDE_EVENT, onGuide);
      off();
      if (timer) window.clearTimeout(timer);
    };
  }, []);

  const dismiss = useCallback(() => {
    if (!asked.current) bumpSnooze();
    asked.current = false;
    setVisible(false); setGuide(false);
  }, []);

  const install = useCallback(async () => {
    if (installMode() === 'ios') { setGuide(true); return; }
    const outcome = await promptInstall();
    if (outcome === 'dismissed') bumpSnooze();
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <>
      {guide && <Backdrop onClick={dismiss} />}
      <Sheet role="dialog" aria-label={guide ? HE.A2HS_IOS_TITLE : HE.A2HS_HEADLINE}>
        {!guide ? (
          <>
            <TopRow>
              <AppMark>א</AppMark>
              <div>
                <Headline>{HE.A2HS_HEADLINE}</Headline>
                <Tagline>{HE.HEADER_TAGLINE}</Tagline>
              </div>
            </TopRow>
            <Benefits>
              <Benefit><BIcon><LineIcon name="sparkle" size={16} /></BIcon>{HE.A2HS_BENEFIT_FAST}</Benefit>
              <Benefit><BIcon><LineIcon name="home" size={16} /></BIcon>{HE.A2HS_BENEFIT_FULL}</Benefit>
              <Benefit><BIcon><LineIcon name="calendar" size={16} /></BIcon>{HE.A2HS_BENEFIT_DAILY}</Benefit>
            </Benefits>
            <BtnRow>
              <PrimaryBtn onClick={install}>{HE.A2HS_BTN}</PrimaryBtn>
              <GhostBtn onClick={dismiss}>{HE.A2HS_DISMISS}</GhostBtn>
            </BtnRow>
          </>
        ) : (
          <>
            <GuideTitle>{HE.A2HS_IOS_TITLE}</GuideTitle>
            <Step><StepNum>1</StepNum><StepText>{HE.A2HS_IOS_STEP1} <ShareGlyph /></StepText></Step>
            <Step><StepNum>2</StepNum><StepText>{HE.A2HS_IOS_STEP2}</StepText></Step>
            <Step><StepNum>3</StepNum><StepText>{HE.A2HS_IOS_STEP3}</StepText></Step>
            {/CriOS|FxiOS/i.test(navigator.userAgent) && <SafariNote>{HE.A2HS_IOS_SAFARI_NOTE}</SafariNote>}
            <GhostBtn onClick={dismiss}>{HE.A2HS_DISMISS}</GhostBtn>
          </>
        )}
      </Sheet>
    </>
  );
}
