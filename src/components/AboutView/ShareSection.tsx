'use client';

import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';

const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;
const glow = keyframes`
  0%,100% { box-shadow: 0 0 20px #c9a84c33, 0 8px 32px rgba(0,0,0,0.5); }
  50%      { box-shadow: 0 0 40px #c9a84c66, 0 8px 32px rgba(0,0,0,0.5); }
`;

const Outer = styled.div`
  width: 100%; max-width: 560px;
  padding: 2px;
  border-radius: calc(${theme.radii.lg} + 2px);
  background: linear-gradient(120deg,#c9a84c,#f5d07a,#c9a84c,#8a6a1e,#c9a84c);
  background-size: 300% 100%;
  animation: ${shimmer} 4s linear infinite, ${glow} 3s ease-in-out infinite;
`;

const Inner = styled.div`
  background: linear-gradient(160deg,#070f1c 0%,#0d1b2e 60%,#06101e 100%);
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.lg}; text-align: center;
`;

const GlowCircle = styled.div`
  width: 76px; height: 76px; border-radius: 50%;
  background: linear-gradient(135deg,#0f2040,#1a3a6b);
  border: 2px solid #c9a84c55;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 0 22px #1a3a6b66, 0 0 44px #0d1b2e44;
`;

const GoldName = styled.div`
  font-family: ${theme.fonts.body};
  font-size: 1.6rem; font-weight: 700;
  background: linear-gradient(135deg,#c9a84c,#f5d07a,#c9a84c);
  background-size: 200% 100%;
  -webkit-background-clip: text; background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: ${shimmer} 3s linear infinite;
`;

const Sub = styled.div`font-size:0.85rem; color:rgba(255,255,255,0.45); line-height:1.5;`;

const Divider = styled.div`
  width:80%; height:1px;
  background: linear-gradient(90deg,transparent,#c9a84c66,transparent);
`;

const SectionTitle = styled.div`
  font-size: 0.78rem; font-weight: 700; letter-spacing: 0.1em;
  color: #c9a84caa; text-transform: uppercase;
`;

const BtnGrid = styled.div`
  display: grid; grid-template-columns: repeat(3,1fr); gap: ${theme.spacing.sm}; width: 100%;
  @media (max-width:360px) { grid-template-columns:1fr; }
`;

const ShareBtn = styled.button<{ $c: string }>`
  display: flex; flex-direction: column; align-items: center;
  gap: 5px; padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-radius: ${theme.radii.md};
  border: 1px solid ${p=>p.$c}44; background: ${p=>p.$c}10;
  color: ${p=>p.$c}; font-size: 0.75rem; font-weight: 700;
  transition: all 0.2s; cursor: pointer;
  &:hover {
    background: ${p=>p.$c}22; border-color: ${p=>p.$c}99;
    transform: translateY(-2px); box-shadow: 0 6px 16px ${p=>p.$c}33;
  }
`;
const BtnIcon = styled.span`font-size:1.5rem;`;

const NativeBtn = styled.button`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: linear-gradient(135deg,#c9a84c,#f5d07a);
  color: #06101e; border-radius: ${theme.radii.md};
  font-weight: 700; font-size: 0.9rem;
  transition: all 0.2s; cursor: pointer;
  &:hover { transform:translateY(-2px); box-shadow:0 8px 24px #c9a84c55; }
`;

export default function ShareSection() {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const url  = typeof window !== 'undefined' ? window.location.origin : 'https://orayta.vercel.app';
  const text = `${HE.APP_NAME} — ${HE.APP_SUBTITLE} 📜\n${url}`;

  const handleNative = () => navigator.share({ title: HE.APP_NAME, text: HE.APP_SUBTITLE, url });
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  const handleTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  const handleCopy = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <Outer>
      <Inner>
        <GlowCircle><OraytaLogo size={46} /></GlowCircle>
        <GoldName>{HE.APP_NAME}</GoldName>
        <Sub>{HE.APP_SUBTITLE}</Sub>
        <Divider />
        <SectionTitle>{HE.ABOUT_SHARE_TITLE}</SectionTitle>
        {canNative && (
          <NativeBtn onClick={handleNative}>
            <span>✦</span> {HE.ABOUT_SHARE_NATIVE}
          </NativeBtn>
        )}
        <BtnGrid>
          <ShareBtn $c="#25D366" onClick={handleWhatsApp}>
            <BtnIcon>💬</BtnIcon>{HE.ABOUT_SHARE_WHATSAPP}
          </ShareBtn>
          <ShareBtn $c="#2AABEE" onClick={handleTelegram}>
            <BtnIcon>✈️</BtnIcon>{HE.ABOUT_SHARE_TELEGRAM}
          </ShareBtn>
          <ShareBtn $c={copied ? '#4caf50' : '#c9a84c'} onClick={handleCopy}>
            <BtnIcon>{copied ? '✓' : '📋'}</BtnIcon>
            {copied ? HE.ABOUT_SHARE_COPIED : HE.ABOUT_SHARE_COPY}
          </ShareBtn>
        </BtnGrid>
      </Inner>
    </Outer>
  );
}
