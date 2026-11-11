/**
 * Reads a server-sent-events body, calling `onData` with each `data:` payload
 * parsed as JSON (unparsable payloads and "[DONE]" are skipped). Server-only.
 */
export async function readSse(body: ReadableStream<Uint8Array>, onData: (data: unknown) => void): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = '';
  const flush = (line: string) => {
    const payload = line.trim().startsWith('data:') ? line.trim().slice(5).trim() : '';
    if (!payload || payload === '[DONE]') return;
    try { onData(JSON.parse(payload)); } catch { /* a keep-alive or a cut line */ }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (value) buf += decoder.decode(value, { stream: !done });
    let nl = buf.indexOf('\n');
    while (nl >= 0) {
      flush(buf.slice(0, nl));
      buf = buf.slice(nl + 1);
      nl = buf.indexOf('\n');
    }
    if (done) break;
  }
  flush(buf);
}
