'use client';

import { useEffect } from 'react';
import { HE } from '@/lib/hebrewTexts';
import {
  Page,
  ErrorPageLogo,
  Title,
  Divider,
  Body,
  Actions,
  HomeLink,
  RetryButton,
} from './_components/ErrorPageShell';

interface Props {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: Props) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Page>
      <ErrorPageLogo />
      <Title>{HE.ERROR_PAGE_TITLE}</Title>
      <Divider />
      <Body>{HE.ERROR_PAGE_BODY}</Body>
      <Actions>
        <RetryButton type="button" onClick={() => reset()}>
          {HE.ERROR_PAGE_RETRY}
        </RetryButton>
        <HomeLink href="/">{HE.ERROR_PAGE_HOME}</HomeLink>
      </Actions>
    </Page>
  );
}
