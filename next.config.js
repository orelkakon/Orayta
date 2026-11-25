/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true,
  },
  experimental: {
    // The story images draw with Skia (a native module): keep it out of the
    // webpack bundle, and ship the fonts they draw with.
    serverComponentsExternalPackages: ['@napi-rs/canvas'],
    outputFileTracingIncludes: {
      '/api/story/daily.png': ['./assets/fonts/**'],
      '/api/story/shabbat.png': ['./assets/fonts/**'],
      // The whole Shulchan Arukh, read from disk by רבי־בוט (lib/rabbiBot/saCorpus.ts).
      '/api/rabbi-bot/ask': ['./src/lib/rabbiBot/data/sa-text.json'],
    },
  },
  // The push service worker must never be served stale, or fixes to it would
  // take days to reach installed devices.
  async headers() {
    return [{
      source: '/sw.js',
      headers: [
        { key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' },
        { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
      ],
    }];
  },
};

module.exports = nextConfig;
