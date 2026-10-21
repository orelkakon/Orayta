import { HE } from '@/lib/hebrewTexts';

/* Shared details for the three legal documents on /legal. The operator is also
   the privacy-database controller and the accessibility coordinator. */

export const LEGAL_OWNER = 'אוראל קקון';
export const LEGAL_EMAIL = HE.ABOUT_CREATOR_EMAIL;

/** Bump on every material change to any of the three documents. */
export const LEGAL_UPDATED = '21 באוקטובר 2026 (י׳ בחשוון התשפ״ז)';

/** Inline-link snippets (see LegalBlock) reused across the documents. */
export const MAIL_LINK = `[${LEGAL_EMAIL}](mailto:${LEGAL_EMAIL})`;
export const CONTACT_LINK = '[עמוד יצירת הקשר](/contact)';

export const CONTACT_BLOCK: string[] = [
  `**מפעיל האתר:** ${LEGAL_OWNER}`,
  `**דוא״ל:** ${MAIL_LINK}`,
  `**טופס פנייה:** ${CONTACT_LINK}`,
];
