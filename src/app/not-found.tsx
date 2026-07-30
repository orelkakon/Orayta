import type { Metadata } from 'next';
import { HE } from '@/lib/hebrewTexts';
import {
  Page,
  ErrorPageLogo,
  Title,
  Divider,
  Body,
  Actions,
  HomeLink,
} from './_components/ErrorPageShell';

export const metadata: Metadata = {
  title: HE.NOT_FOUND_TITLE,
  description: HE.NOT_FOUND_BODY,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <Page>
      <ErrorPageLogo />
      <Title>{HE.NOT_FOUND_TITLE}</Title>
      <Divider />
      <Body>{HE.NOT_FOUND_BODY}</Body>
      <Actions>
        <HomeLink href="/">{HE.ERROR_PAGE_HOME}</HomeLink>
      </Actions>
    </Page>
  );
}
