'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { LineIcon } from '@/components/common/LineIcons';
import { KIND_GROUPS } from '@/lib/play/kinds';
import type { PlayQuestionKind, PlayTopic } from '@/types/play';
import { Chip, ChipRow } from './Chips';

/** Question types grouped by topic, each group with an all/none switch. */
const Group = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  border-radius: ${theme.radii.lg};
  background: rgba(0,0,0,0.18);
  border: 1px solid ${theme.game.glassLine};
`;
const Head = styled.div`display: flex; align-items: center; gap: ${theme.spacing.sm};`;
const Icon = styled.span`
  display: inline-flex; width: 34px; height: 34px; align-items: center; justify-content: center;
  border-radius: ${theme.radii.md}; background: ${theme.game.glass}; color: ${theme.game.gold};
`;
const Name = styled.strong`font-size: ${theme.fontSizes.md};`;
const Count = styled.span`color: ${theme.game.inkFaint}; font-size: ${theme.fontSizes.xs}; font-variant-numeric: tabular-nums;`;
const Toggle = styled.button`
  margin-inline-start: auto;
  background: none;
  color: ${theme.game.gold};
  font-family: ${theme.fonts.ui};
  font-size: ${theme.fontSizes.sm};
  font-weight: 700;
  padding: 4px 8px;
  cursor: pointer;
`;

const TOPIC: Record<PlayTopic, { icon: string; label: string }> = {
  talmud: { icon: 'scroll', label: HE.PLAY_TOPIC_TALMUD },
  rabbis: { icon: 'users', label: HE.PLAY_TOPIC_RABBIS },
  gematria: { icon: 'aleph', label: HE.PLAY_TOPIC_GEMATRIA },
};

interface Props { value: PlayQuestionKind[]; onChange: (kinds: PlayQuestionKind[]) => void; }

export default function KindPicker({ value, onChange }: Props) {
  const on = new Set(value);
  const toggle = (k: PlayQuestionKind) => onChange(on.has(k) ? value.filter(x => x !== k) : [...value, k]);
  return (
    <>
      {KIND_GROUPS.map(({ topic, kinds }) => {
        const n = kinds.filter(k => on.has(k)).length;
        const all = n === kinds.length;
        return (
          <Group key={topic} aria-label={TOPIC[topic].label}>
            <Head>
              <Icon><LineIcon name={TOPIC[topic].icon} size={18} /></Icon>
              <Name>{TOPIC[topic].label}</Name>
              <Count>{n}/{kinds.length}</Count>
              <Toggle type="button" onClick={() => onChange(all
                ? value.filter(k => !kinds.includes(k))
                : [...value.filter(k => !kinds.includes(k)), ...kinds])}>
                {all ? HE.PLAY_NONE : HE.PLAY_ALL}
              </Toggle>
            </Head>
            <ChipRow>
              {kinds.map(k => (
                <Chip key={k} type="button" $on={on.has(k)} aria-pressed={on.has(k)} onClick={() => toggle(k)}>
                  {HE[`PLAY_KIND_${k}`]}
                </Chip>
              ))}
            </ChipRow>
          </Group>
        );
      })}
    </>
  );
}
