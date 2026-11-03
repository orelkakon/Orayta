'use client';

import { usePathname } from 'next/navigation';
import { isBareRoute } from '@/lib/routes';
import ShellChrome from './ShellChrome';

/**
 * Root-level app shell (mounted once in app/layout.tsx), so the header, tab
 * bar and "עוד" sheet persist across navigations instead of re-mounting with
 * every page. Immersive routes render bare.
 */
export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '/';
  if (isBareRoute(pathname)) return <>{children}</>;
  return <ShellChrome pathname={pathname}>{children}</ShellChrome>;
}
