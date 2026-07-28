Import Instagram reel links into the Orayta database so they appear in the רגע של תורה feed.

**Input** (`$ARGUMENTS`): an Instagram profile URL (e.g. `https://www.instagram.com/haravyosefdeloya/`) or one or more specific reel URLs. If no argument is given, ask which page to import from (or list existing pages from the DB).

## Steps

1. **Read the config**: get the max allowed duration in seconds from the DB (`AppConfig` key `reel_max_seconds`, default 60):
   ```bash
   npx tsx -e "import {PrismaClient} from '@prisma/client'; const p=new PrismaClient(); p.appConfig.findUnique({where:{key:'reel_max_seconds'}}).then(r=>console.log(r?.value??'60')).finally(()=>p.\$disconnect())"
   ```

2. **Collect reel links**:
   - If given specific reel URLs, use them directly.
   - If given a profile URL: invoke the `claude-in-chrome` skill and open `https://www.instagram.com/<username>/reels/` in the user's Chrome. Scroll down 2–3 times to load more items, then extract all reel hrefs from the DOM via JavaScript: collect `document.querySelectorAll('a[href*="/reel/"]')` hrefs (dedupe). Do NOT download any media — links only.

3. **Filter by duration (best effort)**: for each candidate reel (skip ones already in the DB — check first, see step 4), open the reel page in Chrome and read `document.querySelector('video')?.duration`. Skip reels longer than the configured max seconds. If duration cannot be determined, ask the user whether to include it or skip it.

4. **Insert into the DB** with an inline `npx tsx` script using the Prisma client:
   - Upsert the `InstagramPage` by `username` (url = `https://www.instagram.com/<username>/`) when importing from a profile.
   - `instagramReel.createMany` with `skipDuplicates: true`; each reel: `code` = the shortcode from the URL (`/reel/<code>/`), `url` = `https://www.instagram.com/reel/<code>/`, `pageId` = the page's id (or null for standalone links).
   - Before opening reels in step 3, query existing codes (`instagramReel.findMany({select:{code:true}})`) and skip those — don't waste time checking durations of reels already imported.

5. **Report**: how many reels were added, skipped as duplicates, and skipped for duration. No build is needed (data only), but if anything looks off verify with `npm run build`.

## Notes

- URL parsing helpers exist in `src/lib/instagram.ts` (`parseReelCode`, `parseProfileUsername`) — mirror their regex logic; a reel code is the `[A-Za-z0-9_-]{5,}` segment after `/reel/`, `/reels/` or `/p/`.
- Only import from public pages the admin has added or named — this is the admin's curated list.
- Never download, re-host, or store video files — the DB stores links only; the feed displays them via Instagram's official embed player.
