import type { RawAnswer } from './verify';

/**
 * Reads an answer the model is still writing (streamed JSON, cut anywhere):
 * the fields already closed — status, short, dispute — and every point whose
 * object is complete. A half-written point or string is left out until it
 * closes. Pure — unit-tested.
 */
export function partialAnswer(text: string): RawAnswer {
  const out: RawAnswer = {};
  const status = closedString(text, 'status');
  if (status !== null) out.status = status;
  const short = closedString(text, 'short');
  if (short !== null) out.short = short;
  const dispute = text.match(/"dispute"\s*:\s*(true|false)/);
  if (dispute) out.dispute = dispute[1] === 'true';
  const at = text.search(/"points"\s*:\s*\[/);
  if (at >= 0) out.points = closedObjects(text.slice(text.indexOf('[', at) + 1));
  return out;
}

/** The value of `"key": "…"` once its closing quote has arrived; null before. */
function closedString(text: string, key: string): string | null {
  const m = text.match(new RegExp(`"${key}"\\s*:\\s*("(?:[^"\\\\]|\\\\.)*")`));
  if (!m) return null;
  try {
    return JSON.parse(m[1]) as string;
  } catch {
    return null;
  }
}

/** The complete top-level objects at the start of an array's body (`{…}, {…}, {…` → the first two). */
function closedObjects(body: string): unknown[] {
  const out: unknown[] = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (inString) {
      if (ch === '\\') i++;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === '{') { if (depth++ === 0) start = i; }
    else if (ch === '}' && --depth === 0) {
      try { out.push(JSON.parse(body.slice(start, i + 1))); } catch { /* malformed — skipped */ }
    } else if (ch === ']' && depth === 0) break;
  }
  return out;
}
