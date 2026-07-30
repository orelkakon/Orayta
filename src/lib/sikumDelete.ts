import { HE } from './hebrewTexts';

export type DeleteResult = 'ok' | 'cancelled' | 'wrong-pass' | 'error';

/**
 * Deleting sikum content re-confirms the admin passcode: the user types it
 * into a prompt and it is verified server-side (x-admin-pass header) on top
 * of the regular admin-cookie check.
 */
export async function deleteWithPasscode(url: string): Promise<DeleteResult> {
  const pass = window.prompt(HE.SIKUMIM_DELETE_PASSWORD_PROMPT);
  if (pass === null || !pass.trim()) return 'cancelled';
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { 'x-admin-pass': pass.trim() },
  });
  if (res.ok) return 'ok';
  return res.status === 401 ? 'wrong-pass' : 'error';
}
