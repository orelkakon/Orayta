// Device-local comment state: the remembered display name, and the signed
// delete-tokens of comments this device wrote (so authors can remove them).
const NAME_KEY = 'orayta_comment_name';
const TOKENS_KEY = 'orayta_comment_tokens';
const MAX_TOKENS = 200;

export function loadCommentName(): string {
  try { return localStorage.getItem(NAME_KEY) ?? ''; } catch { return ''; }
}

export function saveCommentName(name: string): void {
  try {
    if (name) localStorage.setItem(NAME_KEY, name);
    else localStorage.removeItem(NAME_KEY);
  } catch {}
}

export function loadCommentTokens(): Record<string, string> {
  try {
    const raw = localStorage.getItem(TOKENS_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed as Record<string, string> : {};
  } catch { return {}; }
}

function writeTokens(tokens: Record<string, string>): void {
  try {
    // Insertion order is chronological — keep only the newest entries.
    const entries = Object.entries(tokens).slice(-MAX_TOKENS);
    localStorage.setItem(TOKENS_KEY, JSON.stringify(Object.fromEntries(entries)));
  } catch {}
}

export function rememberCommentToken(id: string, token: string): void {
  if (!token) return;
  writeTokens({ ...loadCommentTokens(), [id]: token });
}

export function forgetCommentToken(id: string): void {
  const tokens = loadCommentTokens();
  delete tokens[id];
  writeTokens(tokens);
}
