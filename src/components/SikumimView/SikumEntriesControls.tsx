'use client';

import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { SikumSortKey } from '@/lib/sikum/order';
import SegmentedControl from '@/components/ui/SegmentedControl';
import SikumSortChips, { directionText } from './SikumSortChips';
import { SikumOrderPref, SikumViewMode } from './useSikumOrderPref';

const Wrap = styled.div`display: flex; flex-direction: column; gap: 4px;`;
const Row = styled.div`display: flex; align-items: center; justify-content: space-between; gap: ${theme.spacing.sm};`;

const settle = keyframes`from { opacity: 0; transform: translateY(-3px); } to { opacity: 1; transform: none; }`;

/** The direction in words under the chips, so the arrow never has to be decoded. */
const Caption = styled.p`
  margin: 0; min-height: 1.3em; line-height: 1.3;
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  & > span { display: inline-block; animation: ${settle} 0.25s ${theme.motion.outStrong}; }
  & b { font-weight: 600; color: ${theme.colors.text}; }
`;

const Icon = styled.svg`width: 18px; height: 18px; display: block;`;

const ListIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </Icon>
);
const GridIcon = () => (
  <Icon viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Icon>
);

interface Props {
  pref: SikumOrderPref;
  flipSeen: boolean;
  onPickSort: (by: SikumSortKey) => void;
  onView: (view: SikumViewMode) => void;
}

export default function SikumEntriesControls({ pref, flipSeen, onPickSort, onView }: Props) {
  const dir = directionText(pref.by, pref.rev[pref.by]);
  return (
    <Wrap>
      <Row>
        <SikumSortChips by={pref.by} rev={pref.rev} onPick={onPickSort} />
        <SegmentedControl<SikumViewMode>
          ariaLabel={HE.SIKUMIM_VIEW_ARIA}
          value={pref.view}
          onChange={onView}
          options={[
            { value: 'list', label: <ListIcon />, ariaLabel: HE.SIKUMIM_VIEW_LIST },
            { value: 'grid', label: <GridIcon />, ariaLabel: HE.SIKUMIM_VIEW_GRID },
          ]}
        />
      </Row>
      <Caption aria-live="polite">
        <span key={dir}>
          <b>{dir}</b>{!flipSeen && ` · ${HE.SIKUMIM_FLIP_HINT}`}
        </span>
      </Caption>
    </Wrap>
  );
}
