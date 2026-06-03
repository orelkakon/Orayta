'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useRouter } from 'next/navigation';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary};
  padding: ${theme.spacing.md};
  position: relative;
`;

const BsdFixed = styled.div`
  position: absolute;
  top: ${theme.spacing.md};
  left: ${theme.spacing.lg};
  color: rgba(255,255,255,0.55);
  font-family: ${theme.fonts.body};
  font-size: 0.75rem;
  letter-spacing: 0.04em;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.radii.xl};
  padding: ${theme.spacing.xxl};
  width: 100%;
  max-width: 400px;
  box-shadow: ${theme.shadows.lg};
  animation: ${fadeIn} 0.4s ease;
  text-align: center;
`;

const AppName = styled.h1`
  font-size: 3rem;
  color: ${theme.colors.primary};
  margin-bottom: ${theme.spacing.xs};
  font-family: ${theme.fonts.body};
`;

const Subtitle = styled.p`
  color: ${theme.colors.textMuted};
  font-size: 0.9rem;
  margin-bottom: ${theme.spacing.xxl};
`;

const Input = styled.input<{ $hasError?: boolean }>`
  width: 100%;
  padding: ${theme.spacing.md};
  border: 2px solid ${({ $hasError }) => ($hasError ? theme.colors.error : theme.colors.border)};
  border-radius: ${theme.radii.md};
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 0.5em;
  color: ${theme.colors.text};
  background: ${theme.colors.background};
  outline: none;
  transition: border-color 0.15s;
  margin-bottom: ${theme.spacing.md};
  direction: ltr;

  &:focus {
    border-color: ${({ $hasError }) => ($hasError ? theme.colors.error : theme.colors.primaryLight)};
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: ${theme.spacing.md};
  background: ${theme.colors.primary};
  color: white;
  border-radius: ${theme.radii.md};
  font-size: 1rem;
  font-weight: 600;
  transition: background 0.15s;

  &:hover {
    background: ${theme.colors.primaryLight};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMsg = styled.p`
  color: ${theme.colors.error};
  font-size: 0.85rem;
  margin-bottom: ${theme.spacing.md};
`;

export default function LoginScreen() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });

    setLoading(false);

    if (res.ok) {
      router.push('/study');
    } else {
      setError(true);
      setPasscode('');
    }
  };

  return (
    <Page>
      <BsdFixed>בס״ד</BsdFixed>
      <Card>
        <AppName>{HE.APP_NAME}</AppName>
        <Subtitle>{HE.APP_SUBTITLE}</Subtitle>
        <form onSubmit={handleSubmit}>
          <Input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder={HE.LOGIN_PLACEHOLDER}
            $hasError={error}
            autoFocus
            maxLength={10}
          />
          {error && <ErrorMsg>{HE.LOGIN_ERROR}</ErrorMsg>}
          <SubmitButton type="submit" disabled={loading || !passcode}>
            {loading ? HE.LOADING : HE.LOGIN_BUTTON}
          </SubmitButton>
        </form>
      </Card>
    </Page>
  );
}
