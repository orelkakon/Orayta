import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'אורייתא',
    short_name: 'אורייתא',
    description: 'מערכת לניהול ולימוד ציטוטים מהתלמוד הבבלי',
    start_url: '/',
    display: 'standalone',
    background_color: '#5C3D1E',
    theme_color: '#5C3D1E',
    orientation: 'portrait',
    lang: 'he',
    dir: 'rtl',
    icons: [
      { src: '/icon', sizes: '512x512', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
