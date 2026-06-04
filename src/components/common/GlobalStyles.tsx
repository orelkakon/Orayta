'use client';

import { createGlobalStyle } from 'styled-components';
import { theme } from '@/lib/theme';

const GlobalStylesheet = createGlobalStyle`
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

  /* Prevent iOS/Android zoom on input focus — requires font-size >= 16px */
  @media (max-width: 768px) {
    input, textarea, select {
      font-size: 16px !important;
    }
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  ::selection {
    background: ${theme.colors.secondary};
    color: white;
  }
`;

export default function GlobalStyles() {
  return <GlobalStylesheet />;
}
