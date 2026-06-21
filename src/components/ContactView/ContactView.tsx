'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  display: flex; flex-direction: column; align-items: center;
  gap: ${theme.spacing.xl}; padding: ${theme.spacing.xl} 0 ${theme.spacing.xxl};
  animation: ${fadeUp} 0.4s ease;
`;


const Hero = styled.div`
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.sm};
`;
const Icon = styled.div`font-size: 3rem; line-height: 1;`;
const Title = styled.h1`font-size: 1.9rem; font-weight: 700; color: ${theme.colors.primary};`;
const Sub = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted}; max-width: 380px; line-height: 1.6;`;

const Card = styled.div`
  background: ${theme.colors.surface}; border-radius: ${theme.radii.lg};
  padding: ${theme.spacing.xl}; box-shadow: ${theme.shadows.md};
  border: 1px solid ${theme.colors.borderLight}; width: 100%; max-width: 520px;
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
`;

const FieldLabel = styled.label`
  display: block; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em;
  color: ${theme.colors.textMuted}; margin-bottom: ${theme.spacing.xs};
`;

const Input = styled.input`
  width: 100%; padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; background: ${theme.colors.background}; color: ${theme.colors.text};
  outline: none; transition: border-color 0.15s;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const Textarea = styled.textarea`
  width: 100%; padding: ${theme.spacing.sm} ${theme.spacing.md};
  border: 2px solid ${theme.colors.border}; border-radius: ${theme.radii.md};
  font-size: 0.95rem; background: ${theme.colors.background}; color: ${theme.colors.text};
  outline: none; resize: vertical; min-height: 120px; font-family: inherit; line-height: 1.6;
  transition: border-color 0.15s;
  &:focus { border-color: ${theme.colors.primaryLight}; }
`;

const StarsRow = styled.div`display: flex; gap: 6px; direction: ltr;`;
const Star = styled.button<{ $on: boolean }>`
  font-size: 1.6rem; line-height: 1; transition: transform 0.1s;
  color: ${p => (p.$on ? '#e0a800' : theme.colors.borderLight)};
  &:hover { transform: scale(1.2); }
`;

const SubmitBtn = styled.button`
  width: 100%; padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryLight});
  color: white; border-radius: ${theme.radii.md}; font-size: 1rem; font-weight: 600;
  transition: transform 0.15s, box-shadow 0.15s;
  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: ${theme.shadows.md}; }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const WaBtn = styled.a`
  display: flex; align-items: center; justify-content: center; gap: ${theme.spacing.sm};
  width: 100%; padding: ${theme.spacing.md};
  background: #25D366; color: white; border-radius: ${theme.radii.md};
  font-size: 1rem; font-weight: 600; text-align: center;
  transition: opacity 0.15s;
  &:hover { opacity: 0.88; }
`;

const SuccessBox = styled.div`
  text-align: center; display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.md};
`;
const BigCheck = styled.div`font-size: 3rem;`;
const SuccessTitle = styled.h2`font-size: 1.4rem; font-weight: 700; color: ${theme.colors.primary};`;
const SuccessText = styled.p`font-size: 0.95rem; color: ${theme.colors.textMuted}; line-height: 1.6;`;
const NewBtn = styled.button`
  font-size: 0.9rem; color: ${theme.colors.primary}; font-weight: 600;
  border-bottom: 1px dashed ${theme.colors.primary};
  &:hover { opacity: 0.75; }
`;
const ErrMsg = styled.p`font-size: 0.85rem; color: ${theme.colors.error}; text-align: center;`;

export default function ContactView() {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [waUrl, setWaUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setLoading(true); setError(false);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, message, rating: rating || undefined }),
      });
      const data = await res.json() as { ok?: boolean; waUrl?: string };
      if (res.ok && data.ok) {
        setWaUrl(data.waUrl ?? '');
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    }
    setLoading(false);
  };

  const reset = () => { setName(''); setMessage(''); setRating(0); setWaUrl(''); setError(false); };

  return (
    <Page>
      <Hero>
        <Icon>📞</Icon>
        <Title>{HE.CONTACT_PAGE_TITLE}</Title>
        <Sub>{HE.CONTACT_PAGE_SUBTITLE}</Sub>
      </Hero>

      <Card>
        {waUrl ? (
          <SuccessBox>
            <BigCheck>✅</BigCheck>
            <SuccessTitle>{HE.CONTACT_SUCCESS_TITLE}</SuccessTitle>
            <SuccessText>{HE.CONTACT_SUCCESS_MSG}</SuccessText>
            <WaBtn href={waUrl} target="_blank" rel="noopener noreferrer">
              💬 {HE.CONTACT_WA_BTN}
            </WaBtn>
            <NewBtn onClick={reset}>{HE.CONTACT_NEW}</NewBtn>
          </SuccessBox>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <div>
              <FieldLabel htmlFor="contact-name">{HE.CONTACT_FORM_NAME}</FieldLabel>
              <Input id="contact-name" value={name} onChange={e => setName(e.target.value)} placeholder="שם (לא חובה)" />
            </div>
            <div>
              <FieldLabel htmlFor="contact-msg">{HE.CONTACT_FORM_MESSAGE} *</FieldLabel>
              <Textarea id="contact-msg" value={message} onChange={e => setMessage(e.target.value)} placeholder="כתוב/י כאן..." required />
            </div>
            <div>
              <FieldLabel>{HE.CONTACT_FORM_RATING}</FieldLabel>
              <StarsRow>
                {[1, 2, 3, 4, 5].map(n => (
                  <Star key={n} $on={n <= rating} type="button" onClick={() => setRating(r => r === n ? 0 : n)}>★</Star>
                ))}
              </StarsRow>
            </div>
            {error && <ErrMsg>{HE.CONTACT_SAVE_ERROR}</ErrMsg>}
            <SubmitBtn type="submit" disabled={loading || !message.trim()}>
              {loading ? HE.LOADING : HE.CONTACT_FORM_SUBMIT}
            </SubmitBtn>
          </form>
        )}
      </Card>
    </Page>
  );
}
