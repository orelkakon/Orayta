'use client';

import StyledComponentsRegistry from './StyledComponentsRegistry';
import GlobalStyles from './GlobalStyles';
import { RoleProvider } from './RoleContext';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      <RoleProvider>
        {children}
      </RoleProvider>
    </StyledComponentsRegistry>
  );
}
