'use client';

import { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { trackShare } from '@/lib/shareCounter';
import { shareStory, inviteStory, shareTemplateStory } from '@/lib/storyShare';
import { SITE_URL, RLM } from '@/lib/siteUrl';
import { ShareGlyphs } from './shareGlyphs';

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

const NativeBtn = styled.button`
  padding: ${theme.spacing.sm} ${theme.spacing.xl};
  background: linear-gradient(180deg, ${theme.colors.primaryLight}, ${theme.colors.primary});
  color: ${theme.colors.onPrimary};
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  box-shadow: ${theme.shadows.sm};
  transition: transform ${theme.motion.fast} ${theme.motion.spring}, box-shadow ${theme.motion.fast};
  &:hover { box-shadow: ${theme.shadows.md}; transform: translateY(-2px); }
  &:active { transform: scale(0.96); }
`;

/* Share-sheet row: five round brand medallions with labels underneath —
   an odd count sits naturally, unlike a rectangular button grid. */
const IconRow = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: ${theme.spacing.md};
  width: 100%;
  flex-wrap: wrap;
  ${theme.media.xs} { gap: ${theme.spacing.sm}; }
`;

const IconBtn = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 7px;
  width: 74px;
  transition: transform ${theme.motion.fast} ${theme.motion.spring};
  &:hover { transform: translateY(-3px); }
  &:active { transform: scale(0.9); }
`;

const Medal = styled.span<{ $bg: string; $glow: string; $bordered?: boolean }>`
  width: 54px;
  height: 54px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  background: ${p => p.$bg};
  box-shadow: 0 4px 14px ${p => p.$glow};
  transition: box-shadow ${theme.motion.fast};
  ${p => p.$bordered && css`
    color: ${theme.colors.textMuted};
    border: 1.5px solid ${theme.colors.borderStrong};
    box-shadow: none;
  `}
  ${IconBtn}:hover & { box-shadow: 0 7px 20px ${p => p.$glow}; }
`;

const Lbl = styled.span`
  font-size: 0.72rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
  line-height: 1.25;
  text-align: center;
`;

const IG_GRADIENT = 'linear-gradient(45deg, #F58529 0%, #DD2A7B 55%, #8134AF 100%)';
const GOLD_GRADIENT = 'linear-gradient(145deg, #d9b56c, #8a5a2e)';

export default function ShareSection() {
  const [copied, setCopied] = useState(false);
  const [canNative, setCanNative] = useState(false);

  useEffect(() => {
    setCanNative(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const url  = typeof window !== 'undefined' ? window.location.origin : SITE_URL;
  const text = `${RLM}${HE.APP_NAME}\n${RLM}${HE.APP_SUBTITLE}\n${url}`;

  const copyLegacy = () => {
    const ta = document.createElement('textarea');
    ta.value = url;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try { document.execCommand('copy'); } catch { /* non-blocking */ }
    ta.remove();
  };

  const markCopied = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleNative   = () => { navigator.share({ title: HE.APP_NAME, text: `${RLM}${HE.APP_SUBTITLE}`, url }).catch(() => {}); };
  const handleWhatsApp = () => { trackShare(); window.open(`https://api.whatsapp.com/send/?text=${encodeURIComponent(text)}`, '_blank'); };
  const handleTelegram = () => { trackShare('tg'); window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank'); };
  const handleCopy     = () => {
    void navigator.clipboard.writeText(url).then(markCopied).catch(() => {
      copyLegacy();
      markCopied();
    });
  };

  const options = [
    {
      key: 'wa', label: HE.ABOUT_SHARE_WHATSAPP, glyph: ShareGlyphs.whatsapp,
      bg: theme.brand.whatsapp, glow: 'rgba(37,211,102,0.35)', onClick: handleWhatsApp,
    },
    {
      key: 'tg', label: HE.ABOUT_SHARE_TELEGRAM, glyph: ShareGlyphs.telegram,
      bg: theme.brand.telegram, glow: 'rgba(42,171,238,0.35)', onClick: handleTelegram,
    },
    {
      key: 'ig', label: HE.ABOUT_SHARE_INSTAGRAM, glyph: ShareGlyphs.instagram,
      bg: IG_GRADIENT, glow: 'rgba(221,42,123,0.35)', onClick: () => { void shareStory(inviteStory()); },
    },
    {
      key: 'tpl', label: HE.ABOUT_TEMPLATE_BTN, glyph: ShareGlyphs.template,
      bg: GOLD_GRADIENT, glow: 'rgba(217,181,108,0.4)', onClick: () => { void shareTemplateStory(); },
    },
  ];

  return (
    <Card>
      <CardTitle>{HE.ABOUT_SHARE_TITLE}</CardTitle>
      <Desc>{HE.ABOUT_SHARE_SUBTITLE}</Desc>

      {canNative && (
        <NativeBtn onClick={handleNative}>
          {ShareGlyphs.link} {HE.ABOUT_SHARE_NATIVE}
        </NativeBtn>
      )}

      <IconRow>
        {options.map(o => (
          <IconBtn key={o.key} onClick={o.onClick} aria-label={o.label}>
            <Medal $bg={o.bg} $glow={o.glow}>{o.glyph}</Medal>
            <Lbl>{o.label}</Lbl>
          </IconBtn>
        ))}
        <IconBtn onClick={handleCopy} aria-label={HE.ABOUT_SHARE_COPY}>
          <Medal
            $bg={copied ? theme.colors.success : theme.colors.surfaceAlt}
            $glow={copied ? 'rgba(45,106,79,0.35)' : 'transparent'}
            $bordered={!copied}
          >
            {copied ? ShareGlyphs.check : ShareGlyphs.copy}
          </Medal>
          <Lbl>{copied ? HE.ABOUT_SHARE_COPIED : HE.ABOUT_SHARE_COPY}</Lbl>
        </IconBtn>
      </IconRow>
    </Card>
  );
}
