'use client';

import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { openAccessibility } from '@/lib/a11y';
import { LineIcon } from '@/components/common/LineIcons';
import IconButton from '@/components/ui/IconButton';
import { FEED_GOLD } from './feedTypes';

/**
 * Minimal top bar over the immersive feed: back (start), title + streak,
 * then accessibility, feed settings and saved items (end). Glass controls,
 * a soft scrim for legibility, under the status bar.
 */
const Bar = styled.div`
  position: absolute; top: 0; left: 0; right: 0; z-index: 200;
  padding: calc(8px + ${theme.safe.top}) max(10px, ${theme.safe.right}) 22px max(10px, ${theme.safe.left});
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px;
  background: linear-gradient(to bottom, ${theme.onMedia.shade} 0%, transparent 100%);
  pointer-events: none;
  & > * { pointer-events: auto; }
`;

const Start = styled.div`justify-self: start;`;
const End = styled.div`justify-self: end; display: flex; align-items: center; gap: 6px;`;

const TitleWrap = styled.div`display: flex; flex-direction: column; align-items: center; gap: 1px; min-width: 0;`;

const Title = styled.h1`
  color: ${theme.onMedia.ink}; font-size: 1.08rem; font-weight: 700; white-space: nowrap;
  text-shadow: ${theme.onMedia.textShadow};
`;

const Streak = styled.div`
  display: inline-flex; align-items: center; gap: 4px;
  color: rgba(${FEED_GOLD}, 0.9); font-size: ${theme.fontSizes.xxs}; font-weight: 700;
`;

const Glass = styled(IconButton)<{ $tint?: string }>`
  ${p => p.$tint && `color: rgb(${p.$tint}); border-color: rgba(${p.$tint}, 0.5);`}
`;

const CountBadge = styled.span`
  position: absolute; top: -3px; left: -3px;
  min-width: 18px; height: 18px; border-radius: ${theme.radii.pill}; padding: 0 5px;
  background: ${theme.gilded.fill}; color: ${theme.gilded.ink};
  font-size: 0.62rem; font-weight: 800; font-variant-numeric: tabular-nums;
  display: flex; align-items: center; justify-content: center;
`;

const SETTINGS_TINT = '196,180,255';

interface Props {
  streak: number;
  savedCount: number;
  custom: boolean;
  onSettings: () => void;
  onSaved: () => void;
}

export default function FeedHeader({ streak, savedCount, custom, onSettings, onSaved }: Props) {
  const router = useRouter();
  const exit = () => {
    // Back to wherever the feed was opened from; a direct visit goes home.
    const internal = document.referrer && new URL(document.referrer).origin === window.location.origin;
    if (internal && window.history.length > 1) router.back();
    else router.push('/');
  };
  return (
    <Bar>
      <Start>
        <Glass $variant="glass" $size="sm" onClick={exit} aria-label={HE.FEED_EXIT}>
          <LineIcon name="chevronBack" size={20} strokeWidth={2.2} />
        </Glass>
      </Start>
      <TitleWrap>
        <Title>{HE.FEED_TITLE}</Title>
        {streak >= 2 && <Streak><LineIcon name="flame" size={11} strokeWidth={2.2} />{streak} {HE.FEED_STREAK_DAYS}</Streak>}
      </TitleWrap>
      <End>
        <Glass $variant="glass" $size="sm" onClick={openAccessibility} aria-label={HE.A11Y_OPEN}>
          <LineIcon name="a11y" size={18} strokeWidth={1.9} />
        </Glass>
        <Glass $variant="glass" $size="sm" $tint={custom ? SETTINGS_TINT : undefined} onClick={onSettings} aria-label={HE.FEED_SETTINGS_OPEN}>
          <LineIcon name="sliders" size={18} strokeWidth={1.9} />
        </Glass>
        <Glass $variant="glass" $size="sm" $tint={savedCount > 0 ? FEED_GOLD : undefined} onClick={onSaved} aria-label={`${HE.FEED_SAVED_TITLE} (${savedCount})`}>
          <LineIcon name="bookmark" size={17} strokeWidth={1.9} filled={savedCount > 0} />
          {savedCount > 0 && <CountBadge aria-hidden="true">{savedCount}</CountBadge>}
        </Glass>
      </End>
    </Bar>
  );
}
