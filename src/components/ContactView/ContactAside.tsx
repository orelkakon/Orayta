'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { ShareGlyphs } from '@/components/AboutView/shareGlyphs';
import { enter } from './contactStyles';

const Col = styled.aside`display: flex; flex-direction: column; gap: ${theme.spacing.md};`;

const Box = styled.section<{ $i?: number }>`
  ${enter}
  display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  padding: ${theme.spacing.lg}; border-radius: 20px;
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  ${theme.media.sm} { padding: ${theme.spacing.md}; }
`;
const H = styled.h2`font-size: ${theme.fontSizes.sm}; font-weight: 800; color: ${theme.colors.textMuted}; letter-spacing: 0.02em;`;

const Channel = styled.a`
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  min-height: 60px; padding: ${theme.spacing.sm} ${theme.spacing.ms}; border-radius: 16px;
  border: 1px solid ${theme.colors.borderLight}; background: ${theme.colors.background};
  transition: transform 0.16s ${theme.motion.outStrong}, border-color 0.2s ease, background-color 0.2s ease;
  &:active { transform: scale(0.98); }
  @media (hover: hover) and (pointer: fine) {
    &:hover { border-color: ${theme.colors.gold}; background: ${theme.colors.surface}; }
    &:hover > svg:last-child { transform: translateX(-3px); }
  }
  > svg:last-child { margin-inline-start: auto; color: ${theme.colors.textLight}; transition: transform 0.2s ${theme.motion.outStrong}; }
`;
const Dot = styled.span<{ $bg: string; $ink: string }>`
  width: 42px; height: 42px; border-radius: 13px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: ${p => p.$bg}; color: ${p => p.$ink};
`;
const Txt = styled.span`
  display: flex; flex-direction: column; min-width: 0;
  strong { font-size: ${theme.fontSizes.md}; color: ${theme.colors.text}; }
  span { font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; direction: ltr; text-align: end; overflow: hidden; text-overflow: ellipsis; }
`;

const Steps = styled.ol`
  list-style: none; display: flex; flex-direction: column; gap: ${theme.spacing.ms}; counter-reset: step;
  li {
    counter-increment: step; position: relative; padding-inline-start: 38px;
    font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.text};
  }
  li::before {
    content: counter(step); position: absolute; inset-inline-start: 0; top: -1px;
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: ${theme.fontSizes.xs}; font-weight: 800;
    color: ${theme.gilded.ink}; background: ${theme.gilded.fill};
  }
  li:not(:last-child)::after {
    content: ''; position: absolute; inset-inline-start: 12.5px; top: 28px; bottom: -12px; width: 1px;
    background: linear-gradient(${theme.colors.gold}, transparent);
  }
`;

/** Direct channels (no form needed) and what happens to a message. */
export default function ContactAside({ wa }: { wa: string | null }) {
  return (
    <Col>
      <Box $i={2} aria-labelledby="ct-direct">
        <H id="ct-direct">{HE.CONTACT_DIRECT_TITLE}</H>
        {wa && (
          <Channel href={wa} target="_blank" rel="noopener noreferrer">
            <Dot $bg={theme.brand.whatsapp} $ink={theme.brand.whatsappText}>{ShareGlyphs.whatsapp}</Dot>
            <Txt><strong>{HE.CONTACT_DIRECT_WA}</strong><span>{HE.CONTACT_DIRECT_WA_SUB}</span></Txt>
            <LineIcon name="chevron" size={18} />
          </Channel>
        )}
        <Channel href={`mailto:${HE.ABOUT_CREATOR_EMAIL}`}>
          <Dot $bg={theme.colors.primary} $ink={theme.colors.onPrimary}><LineIcon name="send" size={20} /></Dot>
          <Txt><strong>{HE.CONTACT_DIRECT_MAIL}</strong><span>{HE.ABOUT_CREATOR_EMAIL}</span></Txt>
          <LineIcon name="chevron" size={18} />
        </Channel>
      </Box>
      <Box $i={3} aria-labelledby="ct-steps">
        <H id="ct-steps">{HE.CONTACT_STEPS_TITLE}</H>
        <Steps>{HE.CONTACT_STEPS.map(s => <li key={s}>{s}</li>)}</Steps>
      </Box>
    </Col>
  );
}
