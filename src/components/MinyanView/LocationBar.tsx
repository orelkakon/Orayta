'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { RADIUS_OPTIONS_M } from '@/lib/minyan/geo';
import PlaceSearch from './PlaceSearch';
import type { Origin, Phase } from './useMinyanSearch';
import { Panel, Chip, GhostBtn, Muted, ErrorText } from './minyanStyles';

const Bar = styled(Panel)`display: flex; flex-direction: column; gap: ${theme.spacing.sm}; padding: ${theme.spacing.ms};`;

const Top = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;

const Where = styled.div`
  flex: 1; min-width: 0; display: flex; align-items: center; gap: 6px;
  font-weight: 700; color: ${theme.colors.primary}; font-size: ${theme.fontSizes.sm};
  span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  svg { color: ${theme.colors.secondary}; flex-shrink: 0; }
`;

const IconBtn = styled(GhostBtn)`padding: 8px 10px;`;

const Chips = styled.div`
  display: flex; align-items: center; gap: 6px; overflow-x: auto;
  scrollbar-width: none; &::-webkit-scrollbar { display: none; }
`;

interface Props {
  origin: Origin;
  phase: Phase;
  radius: number;
  onLocate: () => void;
  onPick: (o: Origin) => void;
  onRadius: (r: number) => void;
}

export default function LocationBar({ origin, phase, radius, onLocate, onPick, onRadius }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const busy = phase === 'locating' || phase === 'loading';

  return (
    <Bar>
      <Top>
        <Where>
          <LineIcon name="pin" size={16} />
          <span>{origin.label ? HE.MN_FROM_SEARCH(origin.label) : HE.MN_FROM_GPS}</span>
        </Where>
        <IconBtn onClick={onLocate} disabled={busy} aria-label={HE.MN_LOCATE_BTN}>
          <LineIcon name="target" size={17} />
          {phase === 'locating' ? HE.MN_LOCATING : HE.MN_LOCATE_BTN}
        </IconBtn>
        <IconBtn onClick={() => setSearchOpen(o => !o)} aria-expanded={searchOpen} aria-label={HE.MN_SEARCH_BTN}>
          <LineIcon name="search" size={17} />
        </IconBtn>
      </Top>
      {(phase === 'denied' || phase === 'unavailable') && (
        <ErrorText role="alert">{phase === 'denied' ? HE.MN_DENIED_SUB : HE.MN_UNAVAILABLE_SUB}</ErrorText>
      )}
      {searchOpen && <PlaceSearch onPick={o => { setSearchOpen(false); onPick(o); }} />}
      <Chips role="group" aria-label={HE.MN_RADIUS_LABEL}>
        <Muted>{HE.MN_RADIUS_LABEL}</Muted>
        {RADIUS_OPTIONS_M.map(r => (
          <Chip key={r} $active={r === radius} aria-pressed={r === radius} onClick={() => onRadius(r)} disabled={busy}>
            {HE.MN_KM(r)}
          </Chip>
        ))}
      </Chips>
    </Bar>
  );
}
