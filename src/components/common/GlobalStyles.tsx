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
    --color-secondary:    #C4956A;
    --color-accent:       #9B2335;
    --color-accent-light: #C94B5F;
    --color-text:         #2C1810;
    --color-text-muted:   #6B5744;
    --color-text-light:   #9B8575;
    --color-border:       #E0D5C5;
    --color-border-light: #EDE8DE;
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
    --color-secondary:    #8B6240;
    --color-accent:       #C94B5F;
    --color-accent-light: #E07A8F;
    --color-text:         #F0E8DC;
    --color-text-muted:   #A09080;
    --color-text-light:   #6B5744;
    --color-border:       #3A3028;
    --color-border-light: #2E261E;
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

  body {
    font-family: ${theme.fonts.ui};
    background-color: ${theme.colors.background};
    color: ${theme.colors.text};
    line-height: 1.6;
    min-height: 100vh;
    transition: background-color 0.2s ease, color 0.2s ease;
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
