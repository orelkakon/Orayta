import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest } from 'next/server';

// The repo is public, so the signing secret must come from env in production
// (AUTH_SECRET, falling back to PASSCODE). The dev fallback never runs in prod.
function getSecret(): string | null {
  const secret = process.env.AUTH_SECRET ?? process.env.PASSCODE;
  if (secret) return secret;
  return process.env.NODE_ENV === 'production' ? null : 'orayta-dev-secret';
}

// Signed admin token — set as the httpOnly `auth` cookie on login.
// A plain guessable value (like the old 'admin') could be forged by anyone.
export function createAuthToken(): string | null {
  const secret = getSecret();
  if (!secret) return null;
  return createHmac('sha256', secret).update('orayta-admin-v1').digest('hex');
}

export function isValidAuthToken(value: string | undefined): boolean {
  const expected = createAuthToken();
  if (!value || !expected) return false;
  const a = Buffer.from(value);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function isAdmin(req: NextRequest): boolean {
  return isValidAuthToken(req.cookies.get('auth')?.value);
}
