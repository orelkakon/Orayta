import type { Metadata } from 'next';
import { Frank_Ruhl_Libre, Heebo } from 'next/font/google';
import ClientProviders from '@/components/common/ClientProviders';
import AppShell from '@/components/Layout/AppShell';
import { THEME_BOOT_SCRIPT } from '@/lib/themeBoot';

const frankRuhl = Frank_Ruhl_Libre({
  subsets: ['hebrew', 'latin'],
  weight: ['400', '500', '700'],
  variable: '--font-frank',
  display: 'swap',
});

const heebo = Heebo({
  subsets: ['hebrew', 'latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-heebo',
  display: 'swap',
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orayta-eight.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: { default: 'אורייתא', template: '%s | אורייתא' },
  description: 'מערכת לניהול, לימוד ותרגול מקורות יהודיים — תלמוד, רבנים, ספרים, חידונים ועוד',
  openGraph: {
    title: 'אורייתא',
    description: 'מערכת לניהול, לימוד ותרגול מקורות יהודיים',
    url: APP_URL,
    siteName: 'אורייתא',
    locale: 'he_IL',
    type: 'website',
    images: [{ url: `${APP_URL}/opengraph-image?v=6`, width: 1200, height: 630, alt: 'אורייתא — מקורות יהודיים' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'אורייתא',
    description: 'מערכת לניהול, לימוד ותרגול מקורות יהודיים',
  },
  // Next 13.5 API — the standalone `viewport` export only exists from Next 14.
  // viewport-fit=cover + a translucent status bar let the espresso header run
  // under the iPhone status bar / notch like a native app; every top-anchored
  // surface pads itself with env(safe-area-inset-top) (theme.safe.top).
  viewport: { width: 'device-width', initialScale: 1, viewportFit: 'cover' },
  appleWebApp: { capable: true, title: 'אורייתא', statusBarStyle: 'black-translucent' },
  // Updated at runtime by ThemeContext / immersive pages (useThemeColor).
  themeColor: '#4E3218',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} ${heebo.variable}`}>
      <head>
        {/* Prevent dark-mode flash: read localStorage before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `${THEME_BOOT_SCRIPT};window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__bip=e});` }} />
      </head>
      <body>
        <ClientProviders>
          <AppShell>{children}</AppShell>
        </ClientProviders>
      </body>
    </html>
  );
}
