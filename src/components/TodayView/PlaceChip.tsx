'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { MyPlace, openPlacePicker } from '@/lib/myPlace';

/** "📍 בית שמש · שינוי": which place the day's times are for, one tap to change. */
const Chip = styled.button`
  align-self: flex-start;
  display: inline-flex; align-items: center; gap: 6px;
  min-height: 36px; padding: 0 ${theme.spacing.ms};
  border-radius: ${theme.radii.pill};
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.text};
  svg { color: ${theme.colors.secondary}; }
  &:active { transform: scale(0.97); }
`;

const Change = styled.span`font-weight: 500; color: ${theme.colors.textMuted};`;

export default function PlaceChip({ place }: { place: MyPlace }) {
  const name = place.name ?? HE.PLACE_ABROAD;
  return (
    <Chip type="button" onClick={openPlacePicker} aria-label={HE.PLACE_CHANGE_ARIA(name)}>
      <LineIcon name="pin" size={15} />{name}<Change>· {HE.PLACE_CHIP_CHANGE}</Change>
    </Chip>
  );
}
