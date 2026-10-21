import Link from 'next/link';
import styled from 'styled-components';
import { theme } from '@/lib/theme';

const A = styled.a`
  color: ${theme.colors.primary}; font-weight: 600;
  text-decoration: underline; text-underline-offset: 3px;
  overflow-wrap: anywhere;
`;

const TOKEN = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
const LINK = /^\[([^\]]+)\]\(([^)]+)\)$/;

/** Renders the LegalBlock inline markup: `**bold**` and `[label](href)`. */
export default function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split(TOKEN).map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        const link = LINK.exec(part);
        if (!link) return part;
        const [, label, href] = link;
        return href.startsWith('/')
          ? <A key={i} as={Link} href={href}>{label}</A>
          : <A key={i} href={href}>{label}</A>;
      })}
    </>
  );
}
