'use client';

import { ReactNode } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import PageHeader from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/Button';
import LocatePanel from '@/components/MinyanView/LocatePanel';
import LocationBar from '@/components/MinyanView/LocationBar';
import { Panel } from '@/components/MinyanView/minyanStyles';
import type { NearbySearch, Origin } from '@/components/MinyanView/useMinyanSearch';
import NearbySkeleton from './NearbySkeleton';
import AlsoNearby from './AlsoNearby';
import Disclosure from './Disclosure';

/**
 * The page frame shared by מניין קרוב, מקווה בסביבה and קברי צדיקים:
 * header, locate / location bar, loading skeleton, error states, results,
 * then cross-links and the honesty note about the data (collapsed).
 */
const Page = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  max-width: 720px; margin: 0 auto; width: 100%;
  ${theme.up.wide} { max-width: none; }
`;

const Narrow = styled.div`
  display: flex; flex-direction: column; gap: ${theme.spacing.md};
  ${theme.up.wide} { max-width: 720px; }
`;

const Notice = styled(Panel)`
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm}; text-align: center;
  strong { font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; color: ${theme.colors.text}; }
  span { font-size: ${theme.fontSizes.sm}; color: ${theme.colors.textMuted}; }
`;

const About = styled(Panel)`
  padding-top: 0; padding-bottom: ${theme.spacing.xs};
  details { border-top: none; margin: 0; }
  p { font-size: ${theme.fontSizes.sm}; line-height: 1.65; color: ${theme.colors.textMuted}; }
`;

interface Props<T> {
  icon: string;
  title: string;
  subtitle: string;
  honesty: string;
  href: string;
  search: NearbySearch<T>;
  radii?: readonly number[];
  cta?: [string, string];
  errorTitle: string;
  errorSub?: string;
  children: (data: T, origin: Origin, radius: number, refreshing: boolean) => ReactNode;
}

export default function NearbyShell<T>({
  icon, title, subtitle, honesty, href, search, radii, cta, errorTitle, errorSub, children,
}: Props<T>) {
  const { phase, origin, radius, data, refreshing, locate, searchAt, changeRadius, retry } = search;
  const failed = phase === 'error' || phase === 'rate-limited';

  return (
    <Page>
      <Narrow>
        <PageHeader icon={icon} title={title} subtitle={subtitle} />
        {origin && (
          <LocationBar origin={origin} phase={phase} radius={radius} radii={radii}
            onLocate={locate} onPick={searchAt} onRadius={changeRadius} />
        )}
      </Narrow>

      {!origin && <Narrow><LocatePanel phase={phase} onLocate={locate} onPick={searchAt} cta={cta} /></Narrow>}
      {origin && !data && (phase === 'loading' || phase === 'locating') && <NearbySkeleton />}
      {origin && failed && (
        <Notice role="alert">
          <strong>{phase === 'error' ? errorTitle : HE.MN_RATE_LIMITED}</strong>
          {phase === 'error' && errorSub && <span>{errorSub}</span>}
          <Button $variant="secondary" $size="sm" onClick={retry}>{HE.MN_RETRY}</Button>
        </Notice>
      )}
      {origin && data && children(data, origin, radius, refreshing)}

      <Narrow>
        <AlsoNearby current={href} />
        <About><Disclosure label={HE.NB_ABOUT}><p>{honesty}</p></Disclosure></About>
      </Narrow>
    </Page>
  );
}
