'use client';

import StyledComponentsRegistry from './StyledComponentsRegistry';
import GlobalStyles from './GlobalStyles';
import { RoleProvider } from './RoleContext';
import { ThemeProvider } from './ThemeContext';
import AccessibilityWidget from './AccessibilityWidget';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      <ThemeProvider>
        <RoleProvider>
          {children}
          <AccessibilityWidget />
        </RoleProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
