/** UI-only role cookie — the server re-checks with the signed auth cookie. */
export function isAdminBrowser(): boolean {
  try { return /(?:^|;\s*)role=admin(?:;|$)/.test(document.cookie); } catch { return false; }
}
