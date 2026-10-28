'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { formatCommentAge } from '@/components/FeedView/comments/formatCommentAge';
import type { RabbiBotAdminRow } from '@/types/rabbiBot';
import { Grid, Section, SectionTitle, Pill } from './adminBotStyles';

const List = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column;`;
const Item = styled.li`
  display: flex; flex-direction: column; gap: 3px; min-width: 0; padding: ${theme.spacing.sm} 0;
  &:not(:last-child) { border-bottom: 1px solid ${theme.colors.borderLight}; }
`;
const Text = styled.span<{ $gone: boolean }>`
  font-family: ${theme.fonts.body}; font-size: 0.9rem; line-height: 1.55; overflow-wrap: anywhere;
  color: ${p => (p.$gone ? theme.colors.textLight : theme.colors.text)};
  font-style: ${p => (p.$gone ? 'italic' : 'normal')};
`;
const Note = styled.span`font-size: 0.8rem; color: ${theme.colors.error}; overflow-wrap: anywhere;`;
const Meta = styled.span`display: flex; flex-wrap: wrap; align-items: center; gap: 6px; font-size: 0.7rem; color: ${theme.colors.textLight};`;
const Stars = styled.span`color: ${theme.colors.secondary}; letter-spacing: 1px;`;
const None = styled.p`margin: 0; font-size: 0.8rem; color: ${theme.colors.textLight};`;

function Row({ r }: { r: RabbiBotAdminRow }) {
  return (
    <Item>
      <Text $gone={r.question === null}>{r.question ?? HE.RB_ADMIN_PURGED}</Text>
      {r.note && <Note>{r.note}</Note>}
      <Meta>
        <span>{formatCommentAge(r.createdAt)}</span>
        <span>· {HE.RB_STATUS[r.status]}</span>
        {r.topic && <span>· {HE.RB_TOPIC[r.topic] ?? r.topic}</span>}
        {r.points > 0 && <span>· {r.verified}/{r.points} ✓</span>}
        {r.rating !== null && <Stars aria-label={HE.RB_RATE_STAR(r.rating)}>{'★'.repeat(r.rating)}</Stars>}
        {r.reported && <Pill $bad>{HE.RB_ADMIN_REPORTED}</Pill>}
      </Meta>
    </Item>
  );
}

export default function AdminRabbiBotLists({ lowRated, recent }: { lowRated: RabbiBotAdminRow[]; recent: RabbiBotAdminRow[] }) {
  return (
    <Grid>
      <Section>
        <SectionTitle>{HE.RB_ADMIN_LOW}</SectionTitle>
        {lowRated.length ? <List>{lowRated.map(r => <Row key={r.id} r={r} />)}</List> : <None>{HE.RB_ADMIN_EMPTY}</None>}
      </Section>
      <Section>
        <SectionTitle>{HE.RB_ADMIN_RECENT}</SectionTitle>
        {recent.length ? <List>{recent.map(r => <Row key={r.id} r={r} />)}</List> : <None>{HE.RB_ADMIN_EMPTY}</None>}
      </Section>
    </Grid>
  );
}
