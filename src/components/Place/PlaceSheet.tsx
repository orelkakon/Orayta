'use client';

import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Sheet from '@/components/ui/Sheet';
import SearchField from '@/components/common/SearchField';
import { LineIcon } from '@/components/common/LineIcons';
import { MyPlace, placeFromGps, placeFromTown, savePlace, searchTowns } from '@/lib/myPlace';

/**
 * Picks "המקום שלי": one GPS fix (named after the nearest town) or a city
 * from the list. Saved on the device; every local-time view follows it.
 */
const Intro = styled.p`
  font-size: ${theme.fontSizes.sm}; line-height: 1.6; color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.md};
`;

const Row = styled.button<{ $on?: boolean }>`
  width: 100%; min-height: 52px;
  display: flex; align-items: center; gap: ${theme.spacing.ms};
  padding: 8px ${theme.spacing.md}; text-align: start;
  font-size: ${theme.fontSizes.md}; font-weight: ${p => (p.$on ? 700 : 500)};
  color: ${p => (p.$on ? theme.colors.primary : theme.colors.text)};
  border-bottom: 1px solid ${theme.colors.borderLight};
  &:last-child { border-bottom: none; }
  & > span { flex: 1; min-width: 0; }
  & > svg { color: ${theme.colors.textMuted}; flex-shrink: 0; }
  &:active { background: color-mix(in srgb, ${theme.colors.text} 5%, transparent); }
  &:disabled { opacity: 0.6; }
`;

const Sub = styled.small`
  display: block; font-size: ${theme.fontSizes.xs}; font-weight: 400; color: ${theme.colors.textMuted};
`;

const Group = styled.div`
  border-radius: ${theme.radii.lg}; overflow: hidden;
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  margin-top: ${theme.spacing.ms};
`;

const Note = styled.p<{ $error?: boolean }>`
  margin-top: ${theme.spacing.sm}; font-size: ${theme.fontSizes.sm};
  color: ${p => (p.$error ? theme.colors.error : theme.colors.textMuted)};
`;

const Search = styled.div`margin-top: ${theme.spacing.lg};`;

interface Props { open: boolean; current: MyPlace | null; onClose: () => void; }

type GpsState = 'idle' | 'locating' | 'denied';

export default function PlaceSheet({ open, current, onClose }: Props) {
  const [q, setQ] = useState('');
  const [gps, setGps] = useState<GpsState>('idle');
  const towns = useMemo(() => searchTowns(q), [q]);

  const choose = (p: MyPlace | null) => { savePlace(p); setQ(''); onClose(); };

  const locate = () => {
    if (!navigator.geolocation) { setGps('denied'); return; }
    setGps('locating');
    navigator.geolocation.getCurrentPosition(
      pos => {
        setGps('idle');
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Jerusalem';
        choose(placeFromGps(pos.coords.latitude, pos.coords.longitude, tz));
      },
      () => setGps('denied'),
      { timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  };

  const selected = (name: string) => current?.via === 'city' && current.name === name;

  return (
    <Sheet open={open} onClose={onClose} title={HE.PLACE_TITLE} tall>
      <Intro>{HE.PLACE_INTRO}</Intro>
      <Group>
        <Row type="button" onClick={locate} disabled={gps === 'locating'} $on={current?.via === 'gps'}>
          <LineIcon name="locate" size={20} />
          <span>
            {gps === 'locating' ? HE.PLACE_LOCATING : HE.PLACE_GPS}
            <Sub>{current?.via === 'gps' ? (current.name ?? HE.PLACE_ABROAD) : HE.PLACE_GPS_SUB}</Sub>
          </span>
          {current?.via === 'gps' && <LineIcon name="check" size={18} />}
        </Row>
        {current && (
          <Row type="button" onClick={() => choose(null)}>
            <LineIcon name="close" size={20} /><span>{HE.PLACE_CLEAR}</span>
          </Row>
        )}
      </Group>
      {gps === 'denied' && <Note $error role="alert">{HE.PLACE_DENIED}</Note>}

      <Search>
        <SearchField value={q} onChange={setQ} placeholder={HE.PLACE_SEARCH} debounceMs={0} />
      </Search>
      <Group role="list">
        {towns.map(t => (
          <Row key={t[0]} type="button" role="listitem" $on={selected(t[0])} onClick={() => choose(placeFromTown(t))}
            aria-current={selected(t[0]) || undefined}>
            <LineIcon name="pin" size={18} /><span>{t[0]}</span>
            {selected(t[0]) && <LineIcon name="check" size={18} />}
          </Row>
        ))}
      </Group>
      {towns.length === 0 && <Note>{HE.PLACE_NO_RESULTS}</Note>}
    </Sheet>
  );
}
