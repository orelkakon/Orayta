/**
 * Writes into the summary's textarea the way typing would: through
 * `execCommand('insertText')` when the field has focus, so the browser's own
 * undo (⌘Z / shake) takes the insert back. Where that isn't possible (the
 * field isn't focused — iOS won't focus it outside a tap — or the command is
 * missing) the value is set through React and the caret is placed after it.
 */
type SetText = (v: string) => void;

function placeCaret(el: HTMLTextAreaElement, pos: number) {
  requestAnimationFrame(() => { try { el.setSelectionRange(pos, pos); } catch {} });
}

/** Replaces [start, end) with `text`; returns where the inserted text begins. */
export function replaceRange(el: HTMLTextAreaElement, start: number, end: number, text: string, setText: SetText): number {
  if (document.activeElement === el) {
    el.setSelectionRange(start, end);
    try {
      if (document.execCommand('insertText', false, text)) return start;
    } catch { /* fall through */ }
  }
  const v = el.value;
  setText(v.slice(0, start) + text + v.slice(end));
  placeCaret(el, start + text.length);
  return start;
}

/** Inserts at the caret (replacing a selection). `build` sees the text around it to fix spacing. */
export function insertAtCaret(
  el: HTMLTextAreaElement, setText: SetText, build: (before: string, after: string) => string,
): { start: number; text: string } | null {
  const start = el.selectionStart ?? el.value.length;
  const end = el.selectionEnd ?? start;
  const text = build(el.value.slice(0, start), el.value.slice(end));
  if (!text) return null;
  return { start: replaceRange(el, start, end, text, setText), text };
}
