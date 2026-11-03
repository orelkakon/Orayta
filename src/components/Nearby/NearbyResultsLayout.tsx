'use client';

import { ReactNode, useState } from 'react';
import styled, { css, keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import SegmentedControl from '@/components/ui/SegmentedControl';

/**
 * Results of a "near me" search.
 * Phones/tablets: a רשימה | מפה switch. The map view fills the screen and
 * shows the tapped pin's card floating over it — the map never scrolls away.
 * Desktop: list and a sticky full-height map side by side.
 * While a new radius loads the old results stay, dimmed, under a thin bar.
 */
type View = 'list' | 'map';

const Wrap = styled.div<{ $refreshing: boolean }>`
  position: relative; display: flex; flex-direction: column; gap: ${theme.spacing.ms};
  ${p => p.$refreshing && css`& > :not([data-keep]) { opacity: 0.55; transition: opacity 0.2s ease; }`}
  ${theme.up.wide} {
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr);
    gap: ${theme.spacing.lg}; align-items: start;
  }
`;

const slide = keyframes`from { transform: translateX(100%); } to { transform: translateX(-100%); }`;

const Progress = styled.div.attrs({ 'data-keep': '', className: 'anim-loop' })`
  position: absolute; top: -10px; left: 0; right: 0; height: 3px; overflow: hidden; border-radius: 2px;
  background: ${theme.colors.goldSoft};
  &::after { content: ''; position: absolute; inset: 0; width: 40%; background: ${theme.colors.gold}; animation: ${slide} 1.1s ${theme.motion.inOut} infinite; }
  ${theme.up.wide} { grid-column: 1 / -1; position: relative; top: 0; }
`;

const Switch = styled.div`${theme.up.wide} { display: none; }`;

const ListCol = styled.div<{ $hidden: boolean }>`
  display: ${p => (p.$hidden ? 'none' : 'flex')}; flex-direction: column; gap: ${theme.spacing.ms}; min-width: 0;
  ${theme.up.wide} { display: flex; }
`;

const MapCol = styled.div<{ $hidden: boolean }>`
  display: ${p => (p.$hidden ? 'none' : 'block')}; position: relative; min-width: 0;
  --map-h: max(320px, calc(100dvh - var(--header-h, 56px) - var(--tabbar-h, 0px) - 190px));
  ${theme.up.wide} {
    display: block; position: sticky; top: calc(var(--header-h, 64px) + ${theme.spacing.md});
    --map-h: calc(100dvh - var(--header-h, 64px) - ${theme.spacing.xl});
  }
`;

const Floating = styled.div`
  position: absolute; left: 10px; right: 10px; bottom: 10px; z-index: 500;
  max-height: 60%; overflow-y: auto; border-radius: 18px; box-shadow: ${theme.shadows.lg};
  ${theme.up.wide} { display: none; }
`;

const Hint = styled.div`
  position: absolute; left: 50%; bottom: 14px; z-index: 500; transform: translateX(-50%);
  display: inline-flex; align-items: center; gap: 6px; padding: 8px 14px; border-radius: ${theme.radii.pill};
  background: ${theme.colors.elevated}; color: ${theme.colors.textMuted}; box-shadow: ${theme.shadows.md};
  font-size: ${theme.fontSizes.xs}; font-weight: 600; white-space: nowrap; pointer-events: none;
  ${theme.up.wide} { display: none; }
`;

interface Props {
  map: ReactNode | null;
  list: ReactNode;
  toolbar?: ReactNode;
  /** The selected result's card, floated over the map on phones. */
  selectedCard?: ReactNode;
  refreshing?: boolean;
}

export default function NearbyResultsLayout({ map, list, toolbar, selectedCard, refreshing = false }: Props) {
  const [view, setView] = useState<View>('list');
  const showMap = map !== null;
  return (
    <Wrap $refreshing={refreshing} aria-busy={refreshing}>
      {refreshing && <Progress role="status" aria-label={HE.NB_REFRESHING} />}
      {showMap && (
        <Switch data-keep="">
          <SegmentedControl<View>
            ariaLabel={HE.NB_VIEW_ARIA}
            value={view}
            onChange={setView}
            options={[
              { value: 'list', label: <><LineIcon name="list2" size={16} />{HE.NB_VIEW_LIST}</> },
              { value: 'map', label: <><LineIcon name="map" size={16} />{HE.NB_VIEW_MAP}</> },
            ]}
          />
        </Switch>
      )}
      <ListCol $hidden={showMap && view === 'map'}>
        {toolbar}
        {list}
      </ListCol>
      {showMap && (
        <MapCol $hidden={view === 'list'}>
          {map}
          {selectedCard ? <Floating>{selectedCard}</Floating> : <Hint>{HE.NB_MAP_HINT}</Hint>}
        </MapCol>
      )}
    </Wrap>
  );
}
