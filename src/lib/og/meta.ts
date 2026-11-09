import type { Metadata } from 'next';
import { HE } from '@/lib/hebrewTexts';

/**
 * The share metadata a page declares: Open Graph + Twitter with its own
 * preview image from `/api/og`. Next merges metadata per top-level key, so a
 * page that sets `openGraph` must bring its image along — that's this helper.
 */
const OG_VERSION = '1';

export type OgParams = Record<string, string>;

export function ogImageUrl(params: OgParams): string {
  return `/api/og?${new URLSearchParams({ ...params, v: OG_VERSION }).toString()}`;
}

export function shareMeta(title: string, description: string, url: string, params: OgParams): Pick<Metadata, 'openGraph' | 'twitter'> {
  const image = { url: ogImageUrl(params), width: 1200, height: 630, alt: title };
  return {
    openGraph: { title, description, url, siteName: HE.APP_NAME, locale: 'he_IL', type: 'website', images: [image] },
    twitter: { card: 'summary_large_image', title, description, images: [image.url] },
  };
}

/** 'YYYY-MM-DD' in Israel — busts WhatsApp's preview cache on cards that change daily. */
export const ogDay = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date());
