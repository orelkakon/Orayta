'use client';

import { KeyboardEvent, ReactNode, useRef } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

/**
 * iOS-style segmented control: a radiogroup with a thumb that slides between
 * equal-width segments (transform only). Arrow keys move the selection.
 */
const Track = styled.div<{ $count: number }>`
  position: relative;
  display: grid; grid-template-columns: repeat(${p => p.$count}, 1fr);
  padding: 3px; border-radius: ${theme.radii.pill};
  background: color-mix(in srgb, ${theme.colors.text} 7%, transparent);
`;

const Thumb = styled.span<{ $count: number; $index: number }>`
  position: absolute; top: 3px; bottom: 3px; right: 3px;
  width: calc((100% - 6px) / ${p => p.$count});
  border-radius: ${theme.radii.pill};
  background: ${theme.colors.surface};
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  /* RTL: segment 0 sits at the right edge, later segments move left. */
  transform: translateX(${p => p.$index * -100}%);
  transition: transform 0.28s ${theme.motion.outStrong};
`;

const Segment = styled.button<{ $active: boolean }>`
  position: relative; z-index: 1;
  min-height: 36px; padding: 0 10px;
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  border-radius: ${theme.radii.pill};
  font-size: ${theme.fontSizes.sm}; font-weight: ${p => (p.$active ? 700 : 500)};
  color: ${p => (p.$active ? theme.colors.text : theme.colors.textMuted)};
  transition: color 0.2s ease;
  white-space: nowrap;
`;

export interface SegmentOption<T extends string> { value: T; label: ReactNode; ariaLabel?: string }

interface Props<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
}

export default function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel }: Props<T>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const index = Math.max(0, options.findIndex(o => o.value === value));

  const onKey = (e: KeyboardEvent) => {
    // RTL: ArrowLeft moves forward.
    const step = e.key === 'ArrowLeft' ? 1 : e.key === 'ArrowRight' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <Track role="radiogroup" aria-label={ariaLabel} $count={options.length} onKeyDown={onKey}>
      <Thumb aria-hidden="true" $count={options.length} $index={index} />
      {options.map((o, i) => (
        <Segment
          key={o.value}
          ref={el => { refs.current[i] = el; }}
          type="button"
          role="radio"
          aria-checked={i === index}
          aria-label={o.ariaLabel}
          tabIndex={i === index ? 0 : -1}
          $active={i === index}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </Segment>
      ))}
    </Track>
  );
}
