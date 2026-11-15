'use client';

import StyledComponentsRegistry from './StyledComponentsRegistry';
import GlobalStyles from './GlobalStyles';
import { RoleProvider } from './RoleContext';
import { ThemeProvider } from './ThemeContext';
import AccessibilityWidget from './AccessibilityWidget';
import NotificationsHost from '@/components/Notifications/NotificationsHost';
import RabbiBotHost from '@/components/RabbiBot/RabbiBotHost';
import WhatsNewHost from '@/components/WhatsNew/WhatsNewHost';
import PlaceHost from '@/components/Place/PlaceHost';
import InterestsHost from '@/components/Interests/InterestsHost';

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
          <WhatsNewHost />
          <PlaceHost />
          <InterestsHost />
        </RoleProvider>
      </ThemeProvider>
    </StyledComponentsRegistry>
  );
}
