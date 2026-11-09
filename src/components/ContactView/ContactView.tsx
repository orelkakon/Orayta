'use client';

import styled from 'styled-components';
import { theme } from '@/lib/theme';
import ContactHero from './ContactHero';
import ContactForm from './ContactForm';
import ContactDone from './ContactDone';
import ContactAside from './ContactAside';
import { useContactForm } from './useContactForm';

const Page = styled.div`
  width: 100%; max-width: 1000px; margin: 0 auto;
  display: flex; flex-direction: column; gap: ${theme.spacing.lg};
  padding-bottom: ${theme.spacing.xl};
`;

const Grid = styled.div`
  display: grid; grid-template-columns: minmax(0, 1fr); gap: ${theme.spacing.lg};
  ${theme.up.md} { grid-template-columns: minmax(0, 1.65fr) minmax(0, 1fr); align-items: start; }
`;

/** /contact — topic, message, optional reply details; sent by email or WhatsApp. */
export default function ContactView() {
  const f = useContactForm();
  return (
    <Page>
      <ContactHero />
      <Grid>
        {f.sent ? <ContactDone sent={f.sent} onNew={f.reset} /> : <ContactForm f={f} />}
        <ContactAside wa={f.directWa} />
      </Grid>
    </Page>
  );
}
