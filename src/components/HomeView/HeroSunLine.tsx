'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { openPlacePicker } from '@/lib/myPlace';
import { LineIcon } from '@/components/common/LineIcons';
import type { SunInfo } from './todayInfo';

/** "שקיעה 16:48 · 📍 בית שמש" — the next sun event and the place it's for (tap to change). */
const Sun = styled.p`
  display: inline-flex; align-items: center; gap: 6px;
  font-size: ${theme.fontSizes.sm}; color: ${theme.gilded.nightMuted};
  font-variant-numeric: tabular-nums;
`;

const PlaceBtn = styled.button`
  display: inline-flex; align-items: center; gap: 3px; min-height: 32px; padding: 0 2px;
  font: inherit; color: ${theme.game.goldLight};
  text-decoration: underline dotted; text-underline-offset: 3px;
`;

export default function HeroSunLine({ sun, place }: { sun: SunInfo; place: string }) {
  return (
    <Sun>
      <LineIcon name={sun.progress === null ? 'sunrise' : 'sun'} size={16} />
      {sun.label} ·
      <PlaceBtn type="button" onClick={openPlacePicker} aria-label={HE.PLACE_CHANGE_ARIA(place)}>
        <LineIcon name="pin" size={13} />{place}
      </PlaceBtn>
    </Sun>
  );
}
