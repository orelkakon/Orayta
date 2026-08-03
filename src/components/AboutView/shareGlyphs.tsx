import React from 'react';

/** White stroke glyphs for the share medallions — crisp on brand-color fills. */
function G({ children, size = 22 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg
      width={size} height={size} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.9"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const ShareGlyphs = {
  whatsapp: (
    <G>
      <path d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z" />
      <path d="M8.9 8.1c.2-.5.5-.5.8-.5h.6c.2 0 .4 0 .6.4l.8 1.9c.1.2 0 .4-.1.6l-.5.6c-.1.2-.2.3 0 .6a7 7 0 0 0 2.7 2.6c.3.2.4.1.6-.1l.6-.7c.2-.2.4-.2.6-.1l1.9.9c.3.2.4.3.4.5v.7c0 .3-.1.6-.5.8-.5.2-1.3.4-2.5-.1a11 11 0 0 1-4.5-3.5c-1-1.3-1.6-2.6-1.7-3.5-.1-.7 0-1 .2-1.1z" />
    </G>
  ),
  telegram: (
    <G>
      <path d="M21.5 3.6 2.9 10.8c-.6.2-.6.9 0 1.1l4.6 1.5 1.7 5.4c.2.6.9.7 1.3.2l2.5-2.7 4.7 3.5c.5.4 1.2.1 1.3-.5l3-14.6c.1-.7-.5-1.3-1.5-1.1z" />
      <path d="M7.5 13.4 19.2 6l-8.9 8.5-.2 3.3" />
    </G>
  ),
  instagram: (
    <G>
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.3" cy="6.7" r="1.15" fill="currentColor" stroke="none" />
    </G>
  ),
  template: (
    <G>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.8" />
      <path d="M21 15.5l-4.5-4.5L6 21.5" />
    </G>
  ),
  copy: (
    <G size={20}>
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </G>
  ),
  check: (
    <G size={20}>
      <polyline points="20 6 9 17 4 12" />
    </G>
  ),
  link: (
    <G size={17}>
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </G>
  ),
};
