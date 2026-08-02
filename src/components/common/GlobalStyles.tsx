'use client';

import { createGlobalStyle } from 'styled-components';
import { theme } from '@/lib/theme';

const GlobalStylesheet = createGlobalStyle`
  :root {
    --color-background:   #FAF7F2;
    --color-surface:      #FFFFFF;
    --color-surface-alt:  #F5F0E8;
    --color-primary:      #5C3D1E;
    --color-primary-light:#8B6240;
    /* Text/icon colour to pair with --color-primary backgrounds. Must be
       re-declared per theme: primary inverts light to dark, so a literal
       white text colour silently drops to ~2.2:1 in dark mode. */
    --color-on-primary:   #FFFFFF;
    --color-secondary:    #C4956A;
    /* Darkened secondary for TEXT use — #C4956A is only 2.67:1 on white. */
    --color-secondary-text: #7A5530;
    --color-accent:       #9B2335;
    --color-accent-light: #C94B5F;
    --color-text:         #2C1810;
    --color-text-muted:   #6B5744;
    --color-text-light:   #7A6858;
    --color-border:       #E0D5C5;
    --color-border-light: #EDE8DE;
    /* Interactive control boundaries need 3:1 (WCAG 1.4.11); --color-border is 1.45:1. */
    --color-border-strong:#8A7B68;
    --color-success:      #2D6A4F;
    --color-error:        #9B2335;
    --color-bg-success:   #E8F5E9;
    --color-bg-error:     #FDECEA;
    --color-bg-warning:   #FFF8E1;
    --shadow-sm: 0 1px 3px rgba(44, 24, 16, 0.08);
    --shadow-md: 0 4px 12px rgba(44, 24, 16, 0.10);
    --shadow-lg: 0 8px 24px rgba(44, 24, 16, 0.12);
  }

  [data-theme="dark"] {
    --color-background:   #16120E;
    --color-surface:      #211A13;
    --color-surface-alt:  #2A2218;
    --color-primary:      #D4A574;
    --color-primary-light:#E0BA88;
    /* Dark theme primary is a light tan — white on it is 2.23:1, so pair it
       with near-black instead (≈11:1). */
    --color-on-primary:   #1B1408;
    --color-secondary:    #8B6240;
    --color-secondary-text: #D9AE80;
    --color-accent:       #C94B5F;
    --color-accent-light: #E07A8F;
    --color-text:         #F0E8DC;
    --color-text-muted:   #A09080;
    --color-text-light:   #8A7866;
    --color-border:       #3A3028;
    --color-border-light: #2E261E;
    --color-border-strong:#6E6152;
    --color-success:      #52B788;
    --color-error:        #D4606E;
    --color-bg-success:   #1A2E20;
    --color-bg-error:     #2E1A1C;
    --color-bg-warning:   #2A2410;
    --shadow-sm: 0 1px 4px rgba(0, 0, 0, 0.35);
    --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.45);
    --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.55);
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    direction: rtl;
    font-size: 16px;
  }

  /* ── Accessibility overrides (set by AccessibilityWidget via data-attrs) ── */
  html[data-acc-font="1"] { font-size: 18px; }
  html[data-acc-font="2"] { font-size: 20px; }

  /* Keyboard focus. Applies to anything focusable unless a component opts out
     with :focus-visible of its own. :focus-visible means pointer users never
     see it, so no component needs an outline reset to stay clean. */
  :where(a, button, [role="button"], input, select, textarea, summary, [tabindex]):focus-visible {
    outline: 3px solid ${theme.colors.primaryLight};
    outline-offset: 2px;
    border-radius: 4px;
  }

  /* Honour the OS motion preference. Mirrors the manual data-acc-motion switch
     below, which only helps users who find the accessibility widget. */
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    /* Infinite loops (marquees, drifting blobs) must rest at their natural
       position — the duration clamp above teleports them to a mid-animation
       frame and freezes there, which looks broken rather than calm. */
    .anim-loop, .anim-loop::before, .anim-loop::after {
      animation: none !important;
    }
  }

  /* Skip link — first focusable element on the page, visible only when focused. */
  .skip-link {
    position: absolute;
    right: ${theme.spacing.md};
    top: -100px;
    z-index: ${theme.z.toast};
    background: ${theme.colors.primary};
    color: ${theme.colors.onPrimary};
    padding: ${theme.spacing.sm} ${theme.spacing.md};
    border-radius: ${theme.radii.sm};
    font-size: ${theme.fontSizes.sm};
    font-weight: 600;
    transition: top 0.15s;
    &:focus { top: ${theme.spacing.md}; }
  }

  html[data-acc-contrast="on"] {
    --color-background:   #FFFFFF;
    --color-surface:      #FFFFFF;
    --color-surface-alt:  #F2F2F2;
    --color-primary:      #2A1500;
    --color-primary-light:#3D2A10;
    --color-on-primary:   #FFFFFF;
    --color-secondary:    #6B3E12;
    --color-secondary-text: #5A3410;
    --color-border-strong:#333333;
    --color-text:         #000000;
    --color-text-muted:   #1A1A1A;
    --color-text-light:   #333333;
    --color-border:       #444444;
    --color-border-light: #666666;
  }

  html[data-acc-readable="on"] * {
    font-family: var(--font-heebo, 'Heebo', system-ui, sans-serif) !important;
  }

  html[data-acc-links="on"] a {
    text-decoration: underline !important;
    text-underline-offset: 2px;
  }

  html[data-acc-motion="on"] *,
  html[data-acc-motion="on"] *::before,
  html[data-acc-motion="on"] *::after {
    animation: none !important;
    transition: none !important;
  }

  body {
    font-family: ${theme.fonts.ui};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
    min-height: 100vh;
    transition: background-color 0.2s ease, color 0.2s ease;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Mobile: no gray tap flash, no rubber-band past the page edges — the two
     strongest "this is a website" tells inside a home-screen install. */
  a, button, [role="button"] {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.body};
    font-weight: 700;
    line-height: 1.3;
  }

  button {
    font-family: ${theme.fonts.ui};
    cursor: pointer;
    border: none;
    background: none;
  }

  input, textarea, select {
    font-family: ${theme.fonts.ui};
    font-size: 1rem;
  }

  @media (max-width: 768px) {
    input, textarea, select { font-size: 16px !important; }
  }

  a { color: inherit; text-decoration: none; }

  ::selection {
    background: ${theme.colors.secondary};
    color: white;
  }
`;

export default function GlobalStyles() {
  return <GlobalStylesheet />;
}
