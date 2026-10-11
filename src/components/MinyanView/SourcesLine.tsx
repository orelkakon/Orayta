'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { SourceRef } from '@/types/minyan';
import { formatSourceDate } from '@/lib/minyan/format';

const Line = styled.p`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted}; line-height: 1.6;
  a { color: ${theme.colors.primaryLight}; text-decoration: underline; text-underline-offset: 2px; }
`;

/** "מקורות: OpenStreetMap (עודכן 12.03.2024) · עיריית באר שבע (עודכן 05.10.2026)" with links. */
export default function SourcesLine({ sources }: { sources: SourceRef[] }) {
  return (
    <Line>
      {HE.MN_SOURCES}:{' '}
      {sources.map((s, i) => {
        const date = formatSourceDate(s.updatedAt);
        const name = HE.MN_PROVIDERS[s.provider];
        return (
          <span key={s.provider}>
            {i > 0 && ' · '}
            {s.url ? <a href={s.url} target="_blank" rel="noopener noreferrer">{name}</a> : name}
            {' '}({date ? HE.MN_UPDATED(date) : HE.MN_NO_DATE})
          </span>
        );
      })}
    </Line>
  );
}
