'use client';

import Link from 'next/link';
import styled, { css } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { FEED_TYPE_STYLES } from '@/components/FeedView/feedTypes';
import FeedMotif from '@/components/FeedView/motif/FeedMotif';
import { feedExcerpt } from '@/lib/feedExcerpt';
import type { FeedItem } from '@/types';

/** Portrait mini-card in the feed's own visual language (type gradient, accent, the post's motif). */
export const cardShape = css`
  position: relative; flex-shrink: 0; overflow: hidden;
  width: 148px; height: 214px; border-radius: 20px;
  display: flex; flex-direction: column; gap: 8px;
  padding: 14px 13px 13px; text-align: start;
  color: ${theme.onMedia.ink};
  box-shadow: ${theme.onMedia.lift};
  transition: transform 0.18s ${theme.motion.outStrong};
  &:active { transform: scale(0.96); }
  @media (hover: hover) and (pointer: fine) { &:hover { transform: translateY(-2px); } }
  ${theme.up.md} { width: 172px; height: 248px; }
`;

const CardShape = styled.button`${cardShape}`;

const Glow = styled.span<{ $accent: string }>`
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  background: radial-gradient(90% 55% at 50% 0%, rgba(${p => p.$accent}, 0.28), transparent 70%);
`;

const Kicker = styled.span<{ $accent: string }>`
  position: relative; z-index: 1;
  display: inline-flex; align-items: center; gap: 5px;
  font-size: ${theme.fontSizes.xxs}; font-weight: 700; letter-spacing: 0.02em;
  color: rgb(${p => p.$accent});
`;

const Title = styled.span`
  position: relative; z-index: 1;
  font-family: ${theme.fonts.body}; font-size: 1.02rem; font-weight: 700; line-height: 1.2;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
`;

const Text = styled.span<{ $lines: number }>`
  position: relative; z-index: 1;
  font-family: ${theme.fonts.body}; font-size: 0.88rem; line-height: 1.5;
  color: ${theme.onMedia.muted};
  display: -webkit-box; -webkit-line-clamp: ${p => p.$lines}; -webkit-box-orient: vertical; overflow: hidden;
`;

const Portrait = styled.img`
  position: relative; z-index: 1;
  width: 54px; height: 54px; border-radius: 50%; object-fit: cover;
  border: 2px solid ${theme.onMedia.line};
`;

interface Props { item: FeedItem; onOpen: () => void }

export default function FeedTeaserCard({ item, onOpen }: Props) {
  const style = FEED_TYPE_STYLES[item.type];
  const ex = feedExcerpt(item);
  return (
    <CardShape type="button" onClick={onOpen} style={{ background: style.bg }} aria-label={HE.HOME_FEED_ITEM_ARIA(style.label)}>
      <FeedMotif type={item.type} id={item.id} accent={style.accent} live={false} strength={1.7} />
      <Glow $accent={style.accent} />
      <Kicker $accent={style.accent}><LineIcon name={style.icon} size={13} strokeWidth={2} />{style.label}</Kicker>
      {ex.image && <Portrait src={ex.image} alt="" loading="lazy" referrerPolicy="no-referrer" />}
      {ex.title && <Title>{ex.title}</Title>}
      <Text $lines={ex.image ? 3 : ex.title ? 5 : 7}>{ex.text}</Text>
    </CardShape>
  );
}

const Continue = styled(Link)`
  ${cardShape}
  align-items: center; justify-content: center; text-align: center; gap: 10px;
  background: ${theme.gilded.night};
  border: 1px solid ${theme.gilded.nightLine};
`;

const Disc = styled.span`
  width: 52px; height: 52px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
`;

const ContTitle = styled.span`font-family: ${theme.fonts.body}; font-size: 1.05rem; font-weight: 700;`;
const ContSub = styled.span`font-size: ${theme.fontSizes.xs}; color: ${theme.gilded.nightMuted};`;

export function ContinueCard({ href }: { href: string }) {
  return (
    <Continue href={href}>
      <Disc aria-hidden="true"><LineIcon name="reels" size={24} strokeWidth={1.9} /></Disc>
      <ContTitle>{HE.HOME_FEED_CONTINUE}</ContTitle>
      <ContSub>{HE.HOME_FEED_CONTINUE_SUB}</ContSub>
    </Continue>
  );
}
