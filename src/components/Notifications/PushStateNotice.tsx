'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { Notice, NoticeTitle } from './sheetStyles';

const Steps = styled.ol`margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: ${theme.spacing.sm};`;
const Step = styled.li`display: flex; align-items: flex-start; gap: ${theme.spacing.sm};`;
const Num = styled.span`
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: ${theme.colors.primary}; color: ${theme.colors.onPrimary};
  font-size: ${theme.fontSizes.xs}; font-weight: 700; display: flex; align-items: center; justify-content: center;
`;
const ShareSvg = styled.svg`vertical-align: -3px; margin-inline-start: 4px; color: ${theme.colors.primary};`;

/** The iOS share glyph (box with up-arrow), same as the install sheet. */
const ShareGlyph = () => (
  <ShareSvg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3v12M8 7l4-4 4 4" /><path d="M5 11v8a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-8" />
  </ShareSvg>
);

export function IosInstallNotice() {
  return (
    <Notice>
      <NoticeTitle>{HE.PUSH_IOS_INSTALL_TITLE}</NoticeTitle>
      <span>{HE.PUSH_IOS_INSTALL_BODY}</span>
      <Steps>
        <Step><Num>1</Num><span>{HE.A2HS_IOS_STEP1} <ShareGlyph /></span></Step>
        <Step><Num>2</Num><span>{HE.A2HS_IOS_STEP2}</span></Step>
        <Step><Num>3</Num><span>{HE.A2HS_IOS_STEP3}</span></Step>
      </Steps>
      <span>{HE.PUSH_IOS_INSTALL_AFTER}</span>
    </Notice>
  );
}

export function DeniedNotice() {
  return (
    <Notice>
      <NoticeTitle>{HE.PUSH_DENIED_TITLE}</NoticeTitle>
      <span>{HE.PUSH_DENIED_BODY}</span>
    </Notice>
  );
}

export function UnsupportedNotice() {
  return <Notice><span>{HE.PUSH_UNSUPPORTED}</span></Notice>;
}
