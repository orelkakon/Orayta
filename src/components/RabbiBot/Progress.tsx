'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import type { RabbiBotStep } from '@/types/rabbiBot';
import { Card, Dot } from './styles';

const ORDER: RabbiBotStep[] = ['plan', 'search', 'read', 'answer', 'verify'];

const Row = styled.li<{ $todo: boolean }>`
  display: flex; align-items: center; gap: ${theme.spacing.sm};
  font-size: ${theme.fontSizes.sm}; font-weight: 600;
  color: ${p => (p.$todo ? theme.colors.textLight : theme.colors.text)};
  transition: color ${theme.motion.base};
`;

const List = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px;`;

interface Props { steps: { step: RabbiBotStep; count?: number }[] }

/** Live pipeline steps — showing the work is what makes the answer trustworthy. */
export default function Progress({ steps }: Props) {
  const reached = steps.length ? Math.max(...steps.map(s => ORDER.indexOf(s.step))) : -1;
  const readCount = steps.find(s => s.step === 'read')?.count;
  return (
    <Card aria-live="polite">
      <List>
        {ORDER.map((step, i) => {
          const state = i < reached ? 'done' : i === reached || (reached < 0 && i === 0) ? 'active' : 'todo';
          const label = step === 'read' && readCount !== undefined ? HE.RB_STEP_READ(readCount) : HE.RB_STEPS[step];
          return (
            <Row key={step} $todo={state === 'todo'}>
              <Dot $state={state}>{state === 'done' ? '✓' : state === 'active' ? <i /> : null}</Dot>
              {label}
            </Row>
          );
        })}
      </List>
    </Card>
  );
}
