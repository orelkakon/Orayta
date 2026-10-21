import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';
import { HE } from '@/lib/hebrewTexts';

/* Site-wide footer: copyright + the legal page (terms, privacy and the
   accessibility statement the regulations require "in a prominent place"). */

const Foot = styled.footer`
  border-top: 1px solid ${theme.colors.borderLight};
  padding: ${theme.spacing.lg} ${theme.spacing.md};
  display: flex; flex-direction: column; align-items: center; gap: ${theme.spacing.xs};
  text-align: center;
  ${theme.media.md} {
    /* Clear the fixed bottom tab bar, and keep the links clear of the
       floating accessibility button on the right edge. */
    padding: ${theme.spacing.md} 64px calc(76px + env(safe-area-inset-bottom) + ${theme.spacing.md});
  }
`;

const Links = styled.nav`
  display: flex; flex-wrap: wrap; justify-content: center;
  column-gap: ${theme.spacing.md}; row-gap: ${theme.spacing.xs};
`;

const FootLink = styled(Link)`
  display: inline-flex; align-items: center; min-height: 32px;
  font-size: ${theme.fontSizes.sm}; font-weight: 600; color: ${theme.colors.textMuted};
  text-decoration: underline; text-decoration-color: transparent; text-underline-offset: 3px;
  transition: color ${theme.motion.fast}, text-decoration-color ${theme.motion.fast};
  &:hover { color: ${theme.colors.primary}; text-decoration-color: currentColor; }
`;

const Copy = styled.p`
  font-size: ${theme.fontSizes.xs}; color: ${theme.colors.textMuted};
`;

export default function SiteFooter() {
  return (
    <Foot>
      <Links aria-label={HE.FOOTER_ARIA}>
        <FootLink href="/legal#terms">{HE.FOOTER_TERMS}</FootLink>
        <FootLink href="/legal#privacy">{HE.FOOTER_PRIVACY}</FootLink>
        <FootLink href="/legal#accessibility">{HE.FOOTER_ACCESSIBILITY}</FootLink>
      </Links>
      <Copy>{HE.ABOUT_FOOTER}</Copy>
    </Foot>
  );
}
