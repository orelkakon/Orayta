'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import { MASECHTOT, SEDARIM } from '@/lib/hebrewData';
import { Citation, Amud } from '@/types';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.lg};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-weight: 600;
  color: ${theme.colors.textMuted};
`;

const TextArea = styled.textarea`
  padding: ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  outline: none;
  line-height: 1.7;
  font-family: ${theme.fonts.body};

  &:focus {
    border-color: ${theme.colors.primaryLight};
  }
`;

const LocationBox = styled.div`
  border: 2px solid ${theme.colors.borderLight};
  border-radius: ${theme.radii.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceAlt};
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const LocationTitle = styled.div`
  font-weight: 600;
  font-size: 0.9rem;
  color: ${theme.colors.textMuted};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  outline: none;

  &:focus {
    border-color: ${theme.colors.primaryLight};
  }
`;

const Input = styled.input`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border};
  border-radius: ${theme.radii.md};
  font-size: 0.95rem;
  color: ${theme.colors.text};
  background: ${theme.colors.surface};
  outline: none;

  &:focus {
    border-color: ${theme.colors.primaryLight};
  }
`;

const AmudGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
`;

const AmudButton = styled.button<{ $active?: boolean }>`
  padding: ${theme.spacing.xs} ${theme.spacing.md};
  border-radius: ${theme.radii.sm};
  border: 2px solid ${({ $active }) => ($active ? theme.colors.primary : theme.colors.border)};
  background: ${({ $active }) => ($active ? theme.colors.primary : theme.colors.surface)};
  color: ${({ $active }) => ($active ? 'white' : theme.colors.text)};
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.15s;
`;

const RemoveButton = styled.button`
  color: ${theme.colors.error};
  font-size: 0.8rem;
  padding: 2px 8px;
  border-radius: ${theme.radii.sm};
  transition: background 0.15s;

  &:hover {
    background: rgba(155, 35, 53, 0.1);
  }
`;

const AddLocationButton = styled.button`
  align-self: flex-start;
  color: ${theme.colors.primaryLight};
  font-size: 0.9rem;
  font-weight: 500;
  padding: ${theme.spacing.xs} ${theme.spacing.sm};
  border-radius: ${theme.radii.sm};
  transition: background 0.15s;

  &:hover {
    background: rgba(92, 61, 30, 0.08);
  }
`;

const SubmitButton = styled.button`
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  align-self: flex-end;
  transition: background 0.15s;
  min-width: 160px;

  &:hover {
    background: ${theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface LocationDraft {
  masechet: string;
  daf: string;
  amud: Amud | null;
}

interface Props {
  initial?: Citation;
  onSave: (data: { content: string; locations: LocationDraft[] }) => Promise<void>;
  submitLabel: string;
}

const emptyLocation = (): LocationDraft => ({ masechet: '', daf: '', amud: null });

export default function CitationForm({ initial, onSave, submitLabel }: Props) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [locations, setLocations] = useState<LocationDraft[]>(
    initial?.locations.map((l) => ({
      masechet: l.masechet,
      daf: l.daf,
      amud: l.amud as Amud | null,
    })) ?? [emptyLocation()]
  );
  const [loading, setLoading] = useState(false);

  const updateLocation = (idx: number, patch: Partial<LocationDraft>) => {
    setLocations((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const isValid = content.trim() && locations.every((l) => l.masechet && l.daf.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    setLoading(true);
    await onSave({ content, locations });
    setLoading(false);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Field>
        <Label>{HE.ADD_CONTENT_LABEL}</Label>
        <TextArea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={HE.ADD_CONTENT_PLACEHOLDER}
          required
        />
      </Field>

      {locations.map((loc, idx) => (
        <LocationBox key={idx}>
          <LocationTitle>
            <span>{HE.ADD_LOCATION_TITLE} {locations.length > 1 ? idx + 1 : ''}</span>
            {locations.length > 1 && (
              <RemoveButton type="button" onClick={() => setLocations((p) => p.filter((_, i) => i !== idx))}>
                {HE.ADD_REMOVE_LOCATION}
              </RemoveButton>
            )}
          </LocationTitle>

          <Row>
            <Field>
              <Label>{HE.ADD_MASECHET_LABEL}</Label>
              <Select
                value={loc.masechet}
                onChange={(e) => updateLocation(idx, { masechet: e.target.value })}
                required
              >
                <option value="">{HE.ADD_MASECHET_PLACEHOLDER}</option>
                {SEDARIM.map((seder) => (
                  <optgroup key={seder} label={seder}>
                    {MASECHTOT.filter((m) => m.seder === seder).map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </optgroup>
                ))}
              </Select>
            </Field>

            <Field>
              <Label>{HE.ADD_DAF_LABEL}</Label>
              <Input
                value={loc.daf}
                onChange={(e) => updateLocation(idx, { daf: e.target.value })}
                placeholder={HE.ADD_DAF_PLACEHOLDER}
                required
              />
            </Field>
          </Row>

          <Field>
            <Label>{HE.ADD_AMUD_LABEL}</Label>
            <AmudGroup>
              {(['none', 'א', 'ב'] as const).map((val) => (
                <AmudButton
                  key={val}
                  type="button"
                  $active={loc.amud === (val === 'none' ? null : val)}
                  onClick={() => updateLocation(idx, { amud: val === 'none' ? null : val })}
                >
                  {val === 'none' ? HE.ADD_AMUD_NONE : val === 'א' ? HE.ADD_AMUD_A : HE.ADD_AMUD_B}
                </AmudButton>
              ))}
            </AmudGroup>
          </Field>
        </LocationBox>
      ))}

      <AddLocationButton type="button" onClick={() => setLocations((p) => [...p, emptyLocation()])}>
        + {HE.ADD_LOCATION_BUTTON}
      </AddLocationButton>

      <SubmitButton type="submit" disabled={!isValid || loading}>
        {loading ? HE.LOADING : submitLabel}
      </SubmitButton>
    </Form>
  );
}
