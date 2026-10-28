'use client';

import StyledComponentsRegistry from './StyledComponentsRegistry';
import GlobalStyles from './GlobalStyles';
import { RoleProvider } from './RoleContext';
import { ThemeProvider } from './ThemeContext';
import AccessibilityWidget from './AccessibilityWidget';
import NotificationsHost from '@/components/Notifications/NotificationsHost';
import RabbiBotHost from '@/components/RabbiBot/RabbiBotHost';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <StyledComponentsRegistry>
      <GlobalStyles />
      <ThemeProvider>
        <RoleProvider>
          {children}
          <AccessibilityWidget />
          <NotificationsHost />
          <RabbiBotHost />
        </RoleProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
