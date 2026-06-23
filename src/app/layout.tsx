import type { Metadata } from 'next';
import { Frank_Ruhl_Libre, Heebo } from 'next/font/google';
import ClientProviders from '@/components/common/ClientProviders';

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
  title: 'אורייתא',
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
  themeColor: '#5C3D1E',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="he" dir="rtl" className={`${frankRuhl.variable} ${heebo.variable}`}>
      <head>
        {/* Prevent dark-mode flash: read localStorage before first paint */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('orayta_theme')==='dark')document.documentElement.setAttribute('data-theme','dark')}catch(e){}` }} />
      </head>
      <body>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
