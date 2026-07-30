'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { FEED_GOLD } from './feedTypes';

const Bar = styled.div`
  position: absolute; top: 0; left: 0; right: 0; z-index: 200;
  padding: calc(10px + env(safe-area-inset-top)) 12px 26px;
  display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 8px;
  background: linear-gradient(to bottom, rgba(4,3,8,0.78) 0%, rgba(4,3,8,0.35) 55%, transparent 100%);
  pointer-events: none;
  & > * { pointer-events: auto; }
`;

const BackBtn = styled(Link)`
  justify-self: start; white-space: nowrap;
  color: rgba(255,252,244,0.88); font-size: 0.82rem; font-weight: 700;
  background: rgba(255,255,255,0.08); backdrop-filter: blur(14px);
  border: 1px solid rgba(255,255,255,0.14); border-radius: 999px; padding: 8px 15px;
  transition: background 0.15s;
  &:hover { background: rgba(255,255,255,0.16); }
`;

const TitleWrap = styled.div`
  display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 0;
`;

const TitleRow = styled.div`
  display: flex; align-items: center; gap: 8px;
  color: #FFF9EC; font-family: var(--font-frank, serif);
  font-size: 1.08rem; font-weight: 800; white-space: nowrap;
`;

const TSpark = styled.span`color: rgba(${FEED_GOLD}, 0.75); font-size: 0.5rem;`;

const StreakNote = styled.div`
  color: rgba(${FEED_GOLD}, 0.8); font-size: 0.6rem; font-weight: 700; letter-spacing: 0.06em;
`;

const Side = styled.div`justify-self: end; display: flex; align-items: center; gap: 8px;`;

const RoundBtn = styled.button<{ $tint?: string }>`
  -webkit-tap-highlight-color: transparent; outline: none;
  -webkit-appearance: none; appearance: none;
  width: 38px; height: 38px; border-radius: 50%; cursor: pointer;
  display: flex; align-items: center; justify-content: center; position: relative;
  background: ${p => p.$tint ? `rgba(${p.$tint}, 0.14)` : 'rgba(255,255,255,0.08)'};
  border: 1px solid ${p => p.$tint ? `rgba(${p.$tint}, 0.45)` : 'rgba(255,255,255,0.14)'};
  color: ${p => p.$tint ? `rgb(${p.$tint})` : 'rgba(255,255,255,0.8)'};
  backdrop-filter: blur(14px);
  transition: background 0.2s, border-color 0.2s, color 0.2s, transform 0.12s;
  &:active { transform: scale(0.9); }
`;

const CountBadge = styled.span`
  position: absolute; top: -4px; left: -4px;
  min-width: 16px; height: 16px; border-radius: 999px; padding: 0 4px;
  background: linear-gradient(135deg, #FFD966, #E8A61E); color: #241A00;
  font-size: 0.6rem; font-weight: 900;
  display: flex; align-items: center; justify-content: center;
`;

const SETTINGS_TINT = '164,140,255';

interface Props {
  streak: number;
  savedCount: number;
  custom: boolean;
  onSettings: () => void;
  onSaved: () => void;
}

export default function FeedHeader({ streak, savedCount, custom, onSettings, onSaved }: Props) {
  return (
    <Bar>
      <BackBtn href="/">{HE.FEED_BACK}</BackBtn>
      <TitleWrap>
        <TitleRow><TSpark>✦</TSpark>{HE.FEED_TITLE}<TSpark>✦</TSpark></TitleRow>
        {streak >= 2 && <StreakNote>{streak} {HE.FEED_STREAK_DAYS}</StreakNote>}
      </TitleWrap>
      <Side>
        <RoundBtn
          $tint={custom ? SETTINGS_TINT : undefined}
          onClick={onSettings}
          aria-label={HE.FEED_SETTINGS_OPEN}
          title={HE.FEED_SETTINGS_OPEN}
        >
          <LineIcon name="gear" size={17} strokeWidth={1.8} />
        </RoundBtn>
        <RoundBtn
          $tint={savedCount > 0 ? FEED_GOLD : undefined}
          onClick={onSaved}
          aria-label={HE.FEED_SAVED_TITLE}
          title={HE.FEED_SAVED_TITLE}
        >
          <LineIcon name="bookmark" size={16} strokeWidth={1.8} filled={savedCount > 0} />
          {savedCount > 0 && <CountBadge>{savedCount}</CountBadge>}
        </RoundBtn>
      </Side>
    </Bar>
  );
}
