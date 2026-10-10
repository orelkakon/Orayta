'use client';

import { useCallback, useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import ListState from '@/components/common/ListState';
import { useRole } from '@/components/common/RoleContext';
import { useMinyanSearch } from './useMinyanSearch';
import LocatePanel from './LocatePanel';
import LocationBar from './LocationBar';
import MinyanResults, { Picker } from './MinyanResults';
import ReportModal from './ReportModal';
import GabbaiModal from './GabbaiModal';
import { Panel, GhostBtn } from './minyanStyles';

const Page = styled.div`display: flex; flex-direction: column; gap: ${theme.spacing.md}; max-width: 720px; margin: 0 auto; width: 100%;`;

const Title = styled.h1`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.h1}; color: ${theme.colors.primary};
  svg { color: ${theme.colors.secondary}; }
`;

const Subtitle = styled.p`font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted};`;

const Honesty = styled.p`
  font-size: ${theme.fontSizes.xs}; line-height: 1.6; color: ${theme.colors.textMuted};
  background: ${theme.colors.bgWarning}; border-radius: ${theme.radii.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
`;

const Notice = styled(Panel)`display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm}; text-align: center;`;

export default function MinyanView() {
  const isAdmin = useRole() === 'admin';
  const { phase, origin, radius, data, locate, searchAt, changeRadius, retry, patchPlace } = useMinyanSearch();
  const [picker, setPicker] = useState<Picker | null>(null);
  // Stable: Modal re-runs its focus effect whenever onClose changes.
  const closePicker = useCallback(() => setPicker(null), []);

  const body = () => {
    if (!origin) return <LocatePanel phase={phase} onLocate={locate} onPick={searchAt} />;
    if (phase === 'loading' || (phase === 'locating' && !data)) {
      return <ListState loading error={false} emptyText="" onRetry={retry} />;
    }
    if (phase === 'error') {
      return (
        <Notice role="alert">
          <strong>{HE.MN_ERROR_TITLE}</strong><span>{HE.MN_ERROR_SUB}</span>
          <GhostBtn onClick={retry}>{HE.MN_RETRY}</GhostBtn>
        </Notice>
      );
    }
    if (phase === 'rate-limited') {
      return <Notice role="alert"><span>{HE.MN_RATE_LIMITED}</span><GhostBtn onClick={retry}>{HE.MN_RETRY}</GhostBtn></Notice>;
    }
    return data && <MinyanResults data={data} origin={origin} radius={radius} isAdmin={isAdmin} onOpen={setPicker} />;
  };

  return (
    <Page>
      <header>
        <Title><LineIcon name="synagogue" size={28} /> {HE.MN_TITLE}</Title>
        <Subtitle>{HE.MN_SUBTITLE}</Subtitle>
      </header>
      <Honesty>{HE.MN_HONESTY}</Honesty>

      {origin && (
        <LocationBar origin={origin} phase={phase} radius={radius} onLocate={locate} onPick={searchAt} onRadius={changeRadius} />
      )}
      {body()}

      {picker?.kind === 'report' && (
        <ReportModal
          placeId={picker.s.id}
          placeName={picker.s.name ?? HE.MN_UNNAMED}
          existing={picker.time}
          isAdmin={isAdmin}
          onClose={closePicker}
          onDone={times => patchPlace(picker.s.id, { times })}
        />
      )}
      {picker?.kind === 'gabbai' && (
        <GabbaiModal
          placeId={picker.s.id}
          placeName={picker.s.name ?? HE.MN_UNNAMED}
          current={picker.s.gabbai}
          onClose={closePicker}
          onDone={gabbai => patchPlace(picker.s.id, { gabbai })}
        />
      )}
    </Page>
  );
}
