'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import Modal from '@/components/common/Modal';
import { markAnchor } from '@/lib/siddur';
import type { PrayerService } from '@/lib/siddur';
import { partApplies, sectionApplies, PrayerDay } from '@/lib/siddur/calendar';

const List = styled.ol`list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column;`;

const Item = styled.li`border-bottom: 1px solid ${theme.colors.borderLight}; &:last-child { border-bottom: none; }`;

const SectionBtn = styled.button<{ $on: boolean; $dim?: boolean }>`
  opacity: ${p => p.$dim ? 0.55 : 1};
  width: 100%; min-height: 48px; display: flex; align-items: center; gap: ${theme.spacing.sm};
  text-align: start; padding: ${theme.spacing.xs} 0;
  font-family: ${theme.fonts.body}; font-size: ${theme.fontSizes.lg}; font-weight: 700;
  color: ${p => p.$on ? theme.colors.primary : theme.colors.text};
  &:hover { color: ${theme.colors.primary}; }
`;

const Num = styled.span<{ $on: boolean }>`
  flex-shrink: 0; width: 28px; height: 28px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-family: ${theme.fonts.ui}; font-size: ${theme.fontSizes.xs}; font-weight: 700;
  color: ${p => p.$on ? theme.colors.onPrimary : theme.colors.textMuted};
  background: ${p => p.$on ? theme.colors.secondary : theme.colors.surfaceAlt};
`;

const Marks = styled.div`display: flex; flex-wrap: wrap; gap: 6px; padding: 0 36px ${theme.spacing.sm} 0;`;

const MarkBtn = styled.button<{ $dim: boolean }>`
  min-height: 32px; padding: 0 12px; border-radius: 999px;
  font-size: ${theme.fontSizes.sm}; color: ${p => p.$dim ? theme.colors.textLight : theme.colors.textMuted};
  border: 1px ${p => p.$dim ? 'dashed' : 'solid'} ${theme.colors.borderLight};
  &:hover { color: ${theme.colors.primary}; border-color: ${theme.colors.secondary}; }
`;

interface Props {
  service: PrayerService;
  active: string;
  day: PrayerDay;
  onJump: (id: string) => void;
  onClose: () => void;
}

/** Full outline of the service: every section and its inner jump points. */
export default function ContentsSheet({ service, active, day, onJump, onClose }: Props) {
  return (
    <Modal title={`${HE.SIDDUR_CONTENTS} · ${service.title}`} onClose={onClose}>
      <List>
        {service.sections.map((s, i) => {
          const marks = s.parts.map((p, pi) => ({ p, pi }))
            .filter(({ p }) => p.mark && !(p.only && !partApplies(p, day)));
          return (
            <Item key={s.id}>
              <SectionBtn $on={s.id === active} $dim={!sectionApplies(s, day)} onClick={() => onJump(s.id)} aria-current={s.id === active ? 'location' : undefined}>
                <Num $on={s.id === active}>{i + 1}</Num>{s.title}
              </SectionBtn>
              {marks.length > 0 && (
                <Marks>
                  {marks.map(({ p, pi }) => (
                    <MarkBtn key={pi} $dim={Boolean(p.when) && !partApplies(p, day)} onClick={() => onJump(markAnchor(s.id, pi))}>
                      {p.mark}
                    </MarkBtn>
                  ))}
                </Marks>
              )}
            </Item>
          );
        })}
      </List>
    </Modal>
  );
}
