export interface A11ySettings {
  fontScale: 0 | 1 | 2;
  contrast: boolean;
  readableFont: boolean;
  underlineLinks: boolean;
  reduceMotion: boolean;
}

export const DEFAULT_A11Y: A11ySettings = {
  fontScale: 0,
  contrast: false,
  readableFont: false,
  underlineLinks: false,
  reduceMotion: false,
};

const KEY = 'orayta_a11y';

export function loadA11y(): A11ySettings {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return DEFAULT_A11Y;
    const parsed = JSON.parse(raw) as Partial<A11ySettings>;
    return { ...DEFAULT_A11Y, ...parsed };
  } catch {
    return DEFAULT_A11Y;
  }
}

export function saveA11y(s: A11ySettings): void {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {}
}

/** Reflects settings as data-attributes on <html>, consumed by GlobalStyles. */
export function applyA11y(s: A11ySettings): void {
  const el = document.documentElement;
  const set = (attr: string, on: boolean) => {
    if (on) el.setAttribute(attr, 'on');
    else el.removeAttribute(attr);
  };
  if (s.fontScale > 0) el.setAttribute('data-acc-font', String(s.fontScale));
  else el.removeAttribute('data-acc-font');
  set('data-acc-contrast', s.contrast);
  set('data-acc-readable', s.readableFont);
  set('data-acc-links', s.underlineLinks);
  set('data-acc-motion', s.reduceMotion);
}
