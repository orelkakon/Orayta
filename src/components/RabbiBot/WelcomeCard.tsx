'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { PrimaryBtn } from '@/components/Notifications/sheetStyles';
import { Card, CardTitle } from './styles';

const List = styled.ul`
  margin: 0; padding-inline-start: 18px; display: flex; flex-direction: column; gap: ${theme.spacing.sm};
  & > li:nth-child(2) { font-weight: 700; color: ${theme.colors.primary}; }
`;

/** Shown once per device: what רבי־בוט is, and that it is not a posek. */
export default function WelcomeCard({ onAccept }: { onAccept: () => void }) {
  return (
    <Card role="note">
      <CardTitle>{HE.RB_WELCOME_TITLE}</CardTitle>
      <List>
        {HE.RB_WELCOME_LINES.map(line => <li key={line}>{line}</li>)}
      </List>
      <PrimaryBtn type="button" onClick={onAccept}>{HE.RB_WELCOME_OK}</PrimaryBtn>
    </Card>
  );
}
