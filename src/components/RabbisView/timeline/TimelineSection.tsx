'use client';

import { memo } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { Rabbi, RabbiCategory } from '@/types';
import { CATEGORY_LABELS } from '@/lib/rabbisData';
import { TimelineSection as Section, centuryYears } from '@/lib/rabbisTimeline';
import TimelineNode from './TimelineNode';

/** One century on the line: the years that passed since the previous one, its heading, and its people. */
const Sec = styled.section`position: relative;`;

const Gap = styled.p`
  position: relative; padding: 18px 0; margin: 0;
  font-size: ${theme.fontSizes.xs}; font-weight: 500; letter-spacing: 0.04em;
  color: ${theme.colors.textLight};
  /* Dashes of page colour over the rail: here the line is broken. */
  &::before {
    content: ''; position: absolute; top: 0; bottom: 0; inset-inline-start: -25px; width: 4px;
    background: repeating-linear-gradient(to bottom, ${theme.colors.background} 0 5px, transparent 5px 10px);
  }
  ${theme.up.md} {
    text-align: center; padding: 26px 0;
    span { position: relative; padding: 4px 14px; border-radius: ${theme.radii.pill}; background: ${theme.colors.background}; }
    &::before { inset-inline-start: calc(50% - 2px); }
  }
`;

const Head = styled.header`
  position: relative; padding: 14px 0 8px;
  &::before {
    content: ''; position: absolute; top: 21px; inset-inline-start: -30px;
    width: 14px; height: 14px; border-radius: 50%; box-sizing: border-box;
    background: ${theme.colors.background}; border: 2px solid ${theme.colors.gold};
  }
  ${theme.up.md} {
    width: fit-content; margin: 10px auto; padding: 10px 22px; text-align: center;
    border-radius: ${theme.radii.lg}; background: ${theme.colors.background};
    border: 1px solid ${theme.colors.gold};
    &::before { display: none; }
  }
`;

const Title = styled.h3`
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.xl}; font-weight: 700; line-height: 1.2;
  color: ${theme.colors.text};
`;

const Sub = styled.p`
  margin-top: 2px; font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
  font-variant-numeric: tabular-nums;
`;

const List = styled.ul`margin: 0; padding: 0;`;

interface Props { section: Section<Rabbi>; onOpen: (rabbi: Rabbi) => void }

function TimelineSection({ section, onOpen }: Props) {
  const y = centuryYears(section.century);
  const eras = section.categories.map(c => CATEGORY_LABELS[c as RabbiCategory]).join(' · ');
  return (
    <Sec>
      {section.gap > 0 && <Gap><span>{HE.RABBIS_TL_GAP(section.gap)}</span></Gap>}
      <Head>
        <Title>{HE.RABBIS_TL_CENTURY(Math.abs(section.century), y.bce)}</Title>
        <Sub>{HE.RABBIS_TL_YEARS(y.from, y.to, y.bce)} · {eras}</Sub>
      </Head>
      <List>
        {section.items.map((r, i) => (
          <TimelineNode key={r.id} rabbi={r} side={(section.start + i) % 2 === 0 ? 'a' : 'b'} onOpen={onOpen} />
        ))}
      </List>
    </Sec>
  );
}

export default memo(TimelineSection);
