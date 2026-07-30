import type { MetadataRoute } from 'next';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://orayta-eight.vercel.app';

type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

interface Route {
  path: string;
  changeFrequency: ChangeFrequency;
  priority: number;
}

const ROUTES: Route[] = [
  { path: '/',            changeFrequency: 'daily',   priority: 1.0 },
  { path: '/feed',        changeFrequency: 'daily',   priority: 1.0 },
  { path: '/today',       changeFrequency: 'daily',   priority: 0.9 },
  { path: '/study',       changeFrequency: 'weekly',  priority: 0.9 },
  { path: '/rabbis',      changeFrequency: 'weekly',  priority: 0.8 },
  { path: '/content',     changeFrequency: 'monthly', priority: 0.8 },
  { path: '/quiz',        changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/sikumim',     changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/chidushim',   changeFrequency: 'weekly',  priority: 0.7 },
  { path: '/gematria',    changeFrequency: 'weekly',  priority: 0.6 },
  { path: '/dedications', changeFrequency: 'weekly',  priority: 0.5 },
  { path: '/about',       changeFrequency: 'monthly', priority: 0.4 },
  { path: '/contact',     changeFrequency: 'yearly',  priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return ROUTES.map(({ path, changeFrequency, priority }) => ({
    url: `${APP_URL}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
