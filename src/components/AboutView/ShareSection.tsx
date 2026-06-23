'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.sm};
  border: 1px solid ${theme.colors.borderLight};
  border-top: 3px solid ${theme.colors.secondary};
  width: 100%;
  max-width: 560px;
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
  align-items: center;
`;

const CardTitle = styled.h2`
  font-size: 1rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  align-self: flex-start;
  padding-bottom: ${theme.spacing.sm};
  border-bottom: 2px solid ${theme.colors.borderLight};
  width: 100%;
`;

const Desc = styled.p`
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
  text-align: center;
  line-height: 1.6;
`;

const BtnGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.sm};
  width: 100%;
  @media (max-width: 360px) { grid-template-columns: 1fr; }
`;

const ShareBtn = styled.button<{ $border: string; $hoverBg: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: ${theme.spacing.md} ${theme.spacing.sm};
  border-radius: ${theme.radii.md};
  border: 1.5px solid ${p => p.$border};
  background: transparent;
  color: ${theme.colors.text};
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.18s;
  cursor: pointer;
  &:hover {
    background: ${p => p.$hoverBg};
    border-color: ${p => p.$border};
    transform: translateY(-2px);
    box-shadow: ${theme.shadows.md};
  }
`;

const BtnIcon = styled.span`font-size: 1.4rem;`;

const NativeBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  transition: all 0.18s;
  cursor: pointer;
  &:hover {
    background: ${theme.colors.primaryLight};
    box-shadow: ${theme.shadows.md};
    transform: translateY(-1px);
  }
`;

export default function ShareSection() {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const url  = typeof window !== 'undefined' ? window.location.origin : 'https://orayta.vercel.app';
  // ‏ = RIGHT-TO-LEFT MARK — forces WhatsApp to render Hebrew lines RTL
  const rtl  = '‏';
  const text = `${rtl}${HE.APP_NAME}\n${rtl}${HE.APP_SUBTITLE}\n${url}`;

  const handleNative   = () => { void navigator.share({ title: HE.APP_NAME, text: `${rtl}${HE.APP_SUBTITLE}`, url }); };
  const handleWhatsApp = () => window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(text)}`, '_blank');
  const handleTelegram = () => window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
  const handleCopy     = () => {
    void navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  return (
    <Card>
      <CardTitle>{HE.ABOUT_SHARE_TITLE}</CardTitle>
      <Desc>{HE.ABOUT_SHARE_SUBTITLE}</Desc>

      {canNative && (
        <NativeBtn onClick={handleNative}>
          🔗 {HE.ABOUT_SHARE_NATIVE}
        </NativeBtn>
      )}

      <BtnGrid>
        <ShareBtn
          $border="#25D366"
          $hoverBg="rgba(37,211,102,0.07)"
          onClick={handleWhatsApp}
        >
          <BtnIcon>💬</BtnIcon>
          {HE.ABOUT_SHARE_WHATSAPP}
        </ShareBtn>

        <ShareBtn
          $border="#2AABEE"
          $hoverBg="rgba(42,171,238,0.07)"
          onClick={handleTelegram}
        >
          <BtnIcon>✈️</BtnIcon>
          {HE.ABOUT_SHARE_TELEGRAM}
        </ShareBtn>

        <ShareBtn
          $border={copied ? theme.colors.success : theme.colors.border}
          $hoverBg={theme.colors.surfaceAlt}
          onClick={handleCopy}
        >
          <BtnIcon>{copied ? '✓' : '📋'}</BtnIcon>
          {copied ? HE.ABOUT_SHARE_COPIED : HE.ABOUT_SHARE_COPY}
        </ShareBtn>
      </BtnGrid>
    </Card>
  );
}
