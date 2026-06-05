'use client';

import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';
import OraytaLogo from '@/components/common/OraytaLogo';

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(32px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0%, 100% { filter: drop-shadow(0 0 10px rgba(196,149,106,0.3)); }
  50%       { filter: drop-shadow(0 0 26px rgba(196,149,106,0.65)); }
`;

const shimmer = keyframes`
  from { left: -100%; }
  to   { left: 100%; }
`;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at 28% 38%, #7a4f28 0%, ${theme.colors.primary} 48%, #2a1408 100%);
  padding: ${theme.spacing.md};
  position: relative;
  overflow: hidden;
`;

const Orb1 = styled.div`
  position: absolute; border-radius: 50%; pointer-events: none;
  width: 560px; height: 560px; top: -180px; right: -140px;
  background: radial-gradient(circle, rgba(196,149,106,0.13) 0%, transparent 68%);
`;
const Orb2 = styled.div`
  position: absolute; border-radius: 50%; pointer-events: none;
  width: 340px; height: 340px; bottom: -100px; left: -90px;
  background: radial-gradient(circle, rgba(196,149,106,0.10) 0%, transparent 68%);
`;
const Orb3 = styled.div`
  position: absolute; border-radius: 50%; pointer-events: none;
  width: 200px; height: 200px; top: 30%; left: 8%;
  background: radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 70%);
`;
const Ring1 = styled.div`
  position: absolute; border-radius: 50%; pointer-events: none;
  width: 420px; height: 420px; top: -120px; left: -120px;
  border: 1px solid rgba(196,149,106,0.13);
`;
const Ring2 = styled.div`
  position: absolute; border-radius: 50%; pointer-events: none;
  width: 280px; height: 280px; bottom: 8%; right: 4%;
  border: 1px solid rgba(196,149,106,0.10);
`;

const Bsd = styled.div`
  position: absolute; top: ${theme.spacing.md}; left: ${theme.spacing.lg};
  color: rgba(255,255,255,0.4); font-family: ${theme.fonts.body};
  font-size: 0.72rem; letter-spacing: 0.07em;
`;

const Card = styled.div`
  background: rgba(255,255,255,0.98);
  border-radius: 28px;
  padding: ${theme.spacing.xxl} ${theme.spacing.xl};
  width: 100%; max-width: 420px;
  box-shadow: 0 40px 90px rgba(20,8,0,0.5), 0 0 0 1px rgba(196,149,106,0.18);
  animation: ${slideUp} 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  text-align: center; position: relative; z-index: 1;
`;

const CardBar = styled.div`
  position: absolute; top: 0; left: 0; right: 0; height: 4px;
  border-radius: 28px 28px 0 0;
  background: linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.secondary}, ${theme.colors.primaryLight});
`;

const LogoWrap = styled.div`
  display: flex; justify-content: center;
  margin-bottom: ${theme.spacing.md};
  animation: ${glow} 3.5s ease-in-out infinite;
`;

const AppName = styled.h1`
  font-family: ${theme.fonts.body};
  font-size: 2.75rem; font-weight: 700;
  color: ${theme.colors.primary};
  letter-spacing: -0.01em; line-height: 1.1;
  margin-bottom: ${theme.spacing.xs};
`;

const Sub = styled.p`
  color: ${theme.colors.textMuted}; font-size: 0.875rem; line-height: 1.5;
  margin-bottom: ${theme.spacing.md};
`;

const Verse = styled.p`
  font-family: ${theme.fonts.body};
  font-size: 0.82rem; color: ${theme.colors.textLight}; font-style: italic;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.borderLight};
  border-bottom: 1px solid ${theme.colors.borderLight};
  margin-bottom: ${theme.spacing.xl};
`;

const FieldLabel = styled.div`
  font-size: 0.78rem; font-weight: 600; letter-spacing: 0.07em;
  text-transform: uppercase; color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.sm};
`;

const Input = styled.input<{ $err?: boolean }>`
  width: 100%; padding: ${theme.spacing.md};
  border: 2px solid ${({ $err }) => ($err ? theme.colors.error : theme.colors.border)};
  border-radius: ${theme.radii.md};
  font-size: 1.4rem; text-align: center; letter-spacing: 0.55em;
  color: ${theme.colors.text}; background: ${theme.colors.background};
  outline: none; direction: ltr;
  transition: border-color 0.2s, box-shadow 0.2s;
  margin-bottom: ${theme.spacing.sm};
  &:focus {
    border-color: ${({ $err }) => ($err ? theme.colors.error : theme.colors.primary)};
    box-shadow: 0 0 0 4px ${({ $err }) =>
      $err ? 'rgba(155,35,53,0.10)' : 'rgba(92,61,30,0.09)'};
  }
  &::placeholder { letter-spacing: 0.15em; font-size: 0.95rem; color: ${theme.colors.textLight}; }
`;

const Btn = styled.button`
  width: 100%; margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.primaryLight} 100%);
  color: white; border-radius: ${theme.radii.md};
  font-size: 1rem; font-weight: 600; letter-spacing: 0.04em;
  position: relative; overflow: hidden;
  transition: transform 0.18s, box-shadow 0.18s;
  &::after {
    content: ''; position: absolute;
    top: 0; left: -100%; width: 60%; height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  }
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 28px rgba(92,61,30,0.38);
    &::after { animation: ${shimmer} 0.55s ease forwards; }
  }
  &:active:not(:disabled) { transform: translateY(0); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const ErrMsg = styled.p`
  color: ${theme.colors.error}; font-size: 0.85rem;
  margin-bottom: ${theme.spacing.sm};
  animation: ${slideUp} 0.2s ease;
`;

export default function LoginScreen() {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(false);
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode }),
    });
    setLoading(false);
    if (res.ok) { window.location.href = '/study'; }
    else { setError(true); setPasscode(''); }
  };

  return (
    <Page>
      <Bsd>בס״ד</Bsd>
      <Orb1 /><Orb2 /><Orb3 /><Ring1 /><Ring2 />
      <Card>
        <CardBar />
        <LogoWrap><OraytaLogo size={76} /></LogoWrap>
        <AppName>{HE.APP_NAME}</AppName>
        <Sub>{HE.APP_SUBTITLE}</Sub>
        <Verse>&ldquo;{HE.ABOUT_VERSE}&rdquo;</Verse>
        <form onSubmit={handleSubmit}>
          <FieldLabel>{HE.LOGIN_SUBTITLE}</FieldLabel>
          <Input
            type="password"
            value={passcode}
            onChange={e => setPasscode(e.target.value)}
            placeholder={HE.LOGIN_PLACEHOLDER}
            $err={error}
            autoFocus
            maxLength={10}
          />
          {error && <ErrMsg>{HE.LOGIN_ERROR}</ErrMsg>}
          <Btn type="submit" disabled={loading || !passcode}>
            {loading ? HE.LOADING : HE.LOGIN_BUTTON}
          </Btn>
        </form>
      </Card>
    </Page>
  );
}
