import { MetadataRoute } from 'next';

const ICON_512 = { src: '/icon', sizes: '512x512', type: 'image/png' };

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'אורייתא',
    short_name: 'אורייתא',
    description: 'מערכת לניהול, לימוד ותרגול מקורות יהודיים — תלמוד, רבנים, ספרים, חידונים ועוד',
    id: '/',
    scope: '/',
    start_url: '/?source=pwa',
    display: 'standalone',
    background_color: '#5C3D1E',
    theme_color: '#5C3D1E',
    orientation: 'portrait',
    lang: 'he',
    dir: 'rtl',
    categories: ['education', 'books', 'lifestyle'],
    icons: [
      { ...ICON_512, purpose: 'any' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
      { ...ICON_512, purpose: 'maskable' },
    ],
    shortcuts: [
      { name: 'רגע של תורה', url: '/feed', icons: [ICON_512] },
      { name: 'לימוד יומי', url: '/today', icons: [ICON_512] },
      { name: 'תרגול', url: '/quiz', icons: [ICON_512] },
    ],
  };
}
