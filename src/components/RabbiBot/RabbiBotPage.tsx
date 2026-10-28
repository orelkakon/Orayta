'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { TitleBox, Title, Sub } from '@/components/Notifications/sheetStyles';
import RabbiBotAvatar from './RabbiBotAvatar';
import RabbiBotPanel from './RabbiBotPanel';

const Page = styled.div`
  max-width: 680px; width: 100%; margin: 0 auto; padding-bottom: ${theme.spacing.xl};
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;

const Head = styled.header`display: flex; align-items: center; gap: ${theme.spacing.ms};`;

const Panel = styled.section`
  background: ${theme.colors.surface}; border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.lg}; box-shadow: ${theme.shadows.sm}; padding: ${theme.spacing.lg};
  @media (max-width: 520px) { padding: ${theme.spacing.md}; }
`;

/** /ask — the same panel as the floating sheet, full page (shareable link). */
export default function RabbiBotPage() {
  return (
    <Page>
      <Head>
        <RabbiBotAvatar size={64} />
        <TitleBox>
          <Title as="h1">{HE.RB_NAME}</Title>
          <Sub>{HE.RB_TAGLINE}</Sub>
        </TitleBox>
      </Head>
      <Panel><RabbiBotPanel idPrefix="rb-page" /></Panel>
    </Page>
  );
}
