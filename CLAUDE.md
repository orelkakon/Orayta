# Project Overview

**Orayta — אורייתא**
מערכת לניהול, לימוד ותרגול מקורות יהודיים.

The system manages and studies citations from the Babylonian Talmud and includes a directory of Jewish leaders across all generations (from biblical figures through modern day). The goal is to make learning and review fast, organized, and interactive.

---

## Sections

### 1. תלמוד (Talmud)
Two sub-tabs visible in the nav:

**צפייה (View/Study)**
- Browse all citations sorted by: Seder → Masechet → Daf → Amud
- Filter by masechet, daf, free-text search
- Edit and delete citations (admin only)
- Random citation modal

**הוספה (Add)**
- Admin-only form to add new citations
- A citation can have multiple locations (same text can appear in multiple masechtot/dafim)
- Fields: content, masechet, daf, amud (optional)

---

### 2. רבנים (Rabbis / Jewish Leaders)
Chronological directory of Jewish leaders and decision-makers across all generations, sorted by `sortYear`.

**Viewing**
- Grouped by category (12 categories, see Data Model below)
- Search by name, bio, or full name
- Filter by category

**Admin controls (admin login required)**
- Add, edit, delete any rabbi entry
- RabbiForm modal with all fields

**Views** (`SegmentedControl` under the page header): רשימה · ציר הדורות · מפה. `/rabbis?view=timeline` opens the timeline.

**ציר הדורות** (`RabbisView/timeline/`, data shaping in `lib/rabbisTimeline.ts`, pure, tested): everyone on one line from the earliest figure to today, grouped by century (`buildTimeline`; empty centuries become a "חולפות כ־N שנה" break).
- Phones: one rail on the start side; from tablets up the cards alternate around a centre rail.
- Scroll-driven CSS only (no JS, `@supports (animation-timeline: view())` + no reduced motion): the rail fills with gold up to a "reading line" at 42% of the screen, and each card settles in while entering (no fill mode, so nothing stays promoted). Without support: a plain line and static cards. No century watermark — the user found it in the way.
- A card opens its bio in place; "לכרטיס המלא" switches to the list filtered to that rabbi.

---

### 2b. שידור חי (Live Torah) — `/live`
Live YouTube streams from a followed list of channels (`LiveChannel` model), watched inside the app via an embedded player.

- **Detection is scraping-based, no YouTube API key.** `src/lib/youtubeLive.ts` fetches each channel's public `youtube.com/channel/<id>/live` page. A page counts as live only if it contains `"isLive":true` and NOT `"isUpcoming":true` (waiting rooms/scheduled streams have both a canonical watch URL and `isUpcoming`). Video id comes from the canonical link, falling back to `currentVideoEndpoint` — YouTube serves datacenter IPs (Vercel) a page variant with `canonical="undefined"` and no `videoDetails`, so don't "simplify" back to those markers.
- **Caching:** the sweep result is stored in `AppConfig` under `live_snapshot` with a 60s TTL — refreshed on demand by `/api/live`, never by cron (Vercel Hobby crons are once/day). Admin channel mutations invalidate it.
- **API:** `GET /api/live` (public snapshot), `GET/POST /api/live/channels` + `PATCH/DELETE /api/live/channels/[id]` (admin; add accepts any channel URL/@handle and resolves it by scraping, including the channel avatar). Channels GET lazily backfills missing `avatarUrl` values (null = retry later, `""` = none found).
- **UI:** `src/components/LiveView/` (cards, in-app player overlay, admin card), `HomeView/LiveBannerBlock.tsx` (a red strip with the stream thumbnail, shown only while something is live).
- Channels whose owners disabled embedding show an error inside the player; the overlay always offers an "open on YouTube" fallback link.

---

### 2c. מניין קרוב (Nearby minyanim) — `/minyan`
Map + distance-sorted list of synagogues near the visitor. **Fully automatic — no manual reports, contacts or admin workflow.** Never show data no source publishes; missing fields are omitted or marked unknown.

- **Sources** (`src/lib/minyan/sources/`, queried in parallel by `GET /api/minyan/nearby`, each cached in-process on a ~1km grid; a failing source is reported in `providers` and contributes nothing):
  - `osm.ts` — OpenStreetMap via Overpass (ODbL). Names/locations/addresses, sometimes phone/website/`service_times`. Freshness = latest of last edit and `check_date`.
  - `wikidata.ts` — Wikidata SPARQL (CC0), notable synagogues only. Freshness = item `dateModified`.
  - `municipal.ts` — data.gov.il CKAN API, Be'er Sheva municipal dataset (official, coords). data.gov.il terms require naming site + dataset + update date (shown in the attribution footer). Haifa (no coords) and Petah Tikva (empty) were evaluated and are unusable.
  - `telaviv.ts` — Tel Aviv municipal GIS dataset 96 (prayer times, nusach, gabbai). **Off unless `TLV_OPENDATA_APPROVED=1`** — the portal's terms forbid re-publishing on other sites / automated access without written consent.
- **Merge + reliability** (`merge.ts`, `reliability.ts`, pure + tested): records are merged by distance + Hebrew name tokens (one record per provider per place). Reliability is computed separately for location and schedule: high = ≥2 independent current providers agree, medium = one current provider, low = stale/undated/conflicting. Copies of one source count once (an OSM `source` tag naming another provider collapses them). Current = 5y for location, 1y for schedules.
- **Prayer times** are shown verbatim as published, with the source and its date. Nedarim Plus has no documented API — we only link to its public area page (`nedarimAreaUrl`).
- **Resilience:** public Overpass instances block (HTTP 406) or time out from Vercel most of the time. `sources/overpass.ts` hedges the instances (next one races after 1.5s, refusals hand over at once, 3-min cooldown per dead instance, hard deadline) and the route caps every source at 12s (`withDeadline`) — a slow source can never take the whole search past `maxDuration` again. When live Overpass fails, `osm.ts` answers from the **offline snapshot** (`src/lib/minyan/data/osm-*.json`, built by `scripts/osm-snapshot.py` from the Geofabrik Israel extract — rerun it every few months); the provider reports `snapshot: true` and the footer shows its date. `ttlCache` serves stale entries when a refresh fails. Providers carry a short `detail` (failure reason) for diagnostics.
- **Map tiles:** `src/lib/mapTiles.ts` (OSM standard tiles, keyless; CARTO now returns "API KEY REQUIRED" images). Override with `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`. Leaflet path classes must be passed as the `className` prop, not inside `pathOptions` (setStyle ignores it).
- **"חדש" badges:** `src/lib/newBadges.ts` — date-expiring, no follow-up commit needed.

### Nearby UI (shared by `/minyan`, `/mikveh`, `/kivrei`)
- **`Nearby/NearbyShell`:** the page frame (header, location bar / locate panel, skeleton, errors, then cross-links and a collapsed "על המידע" note).
- **`Nearby/NearbyResultsLayout`:**
  - Phones and tablets get a רשימה | מפה switch; the map view fills the screen and floats the tapped pin's card over it.
  - Desktop shows the list beside a sticky full-height map.
  - A new radius keeps the old results dimmed under a progress bar (`refreshing`).
- **`NearbyMap`:** one map for all three. Teardrop DivIcon pins coloured by tone (`sched`/`nosched` for minyan), tiles inverted in dark mode, height from `--map-h`.
- **Cards** keep the key facts visible and fold provenance into `Nearby/Disclosure` ("פרטים ומקורות").
- **Shared origin:** the search origin is shared for 30 minutes in sessionStorage (`orayta_nearby_origin`), so switching pages doesn't ask again. The privacy policy says so.

### 2m. מקווה בסביבה — `/mikveh`
Same flow as מניין קרוב (shared `useNearbySearch`, `LocatePanel`, `LocationBar` with `radii`, generic map `components/NearbyMap/`). Radii 2/5/10/20 km.
- **Sources:** the Ministry of Religious Services dataset "מקוואות טהרה" on data.gov.il (`lib/mikveh/dataset.ts`, ~650 rows: women/men/vessels, summer/winter/Shabbat hours verbatim, phone, accessibility, bride room, מיגון, מקווה תורן — fetched whole once a day, stale up to 30 days) + OSM mikvaot from the snapshot only (`lib/mikveh/sources.ts`). The dataset has **no coordinates**: `src/lib/mikveh/data/mikveh-geo.json` (key `town|address`) is built by `npx tsx scripts/mikveh-geocode.ts` (Nominatim, 1 req/s, resumable — rerun when the dataset changes; new rows without an entry fall back to the town centre or are skipped). Precision e/s/a/c → exact/street/area/city; town-centre pins are listed but kept off the map.
- **Merge** (`merge.ts`, pure, tested): gov wins for type/hours/phone/accessibility, OSM adds the exact pin, fee and website; town-centre pins and opposite audiences never merge. The current season comes from Israel summer time (`isIsraelSummer`). Fees are shown only when OSM publishes them (the official dataset has none). The attendant's name in the dataset is deliberately not shown.
- **UI** (`components/MikvehView/`): audience chips double as the map legend, "נגיש" toggle, filter remembered in `orayta_mikveh_filter`.

### 2n. קברי צדיקים באזור — `/kivrei`
- **Data** is committed: `src/lib/kivrei/data/kivrei.json`, built by `npx tsx scripts/kivrei-build.ts` (after `osm-snapshot.py`): Hebrew Wikipedia's curated category tree "קברי צדיקים" (grave pages with coordinates → position, photo, intro) + OSM tombs (`osm-tombs.json`, enrich a Wikipedia grave by wikidata/wikipedia tag or proximity, or kept alone when clearly a tzadik's grave — rules in `lib/kivrei/build.ts`, pure, tested: archaeology, memorials, other faiths' shrines and state figures are blocked; "אוהל" counts only with a tzadik title). The bio is the buried person's own Wikipedia page, accepted only when Wikidata says it's a person (so "חולדה" isn't the rodent).
- **API** `GET /api/kivrei/nearby?lat&lng&r` (radii 5/15/30/60 km) links each grave to the rabbi directory (`rabbiMatch.ts`: word sets without titles, ambiguous → no link) → hilula date, period, `/rabbis?q=` link, and the directory bio when Wikipedia has none.
- **UI** (`components/KivreiView/`): photo banner (Wikimedia, `referrerPolicy=no-referrer`), name filter, visiting hours only when OSM publishes them, Wikipedia (CC BY-SA) credited on every card.

### 2o. "חדש באורייתא" — one-time announcement
`components/WhatsNew/` mounted in `ClientProviders`: shown once per device (marked seen the moment it appears, `orayta_whats_new`), 1.4s after load, never on `/play`, `/login`, `/ask`, `/feed`, admin pages. Currently רבי־בוט (dark stage, live typed demo, CTA opens the bot). **To announce something new:** write a hero + texts (`lib/texts/whatsNew.ts`), point `CURRENT_FEATURE` (`features.tsx`) at it and change `WHATS_NEW_ID` (`lib/whatsNew.ts`). The bot's teaser bubble holds back for 20h after an announcement.

### Nearby search statistics (admin)
Each search on `/api/minyan|mikveh|kivrei/nearby` writes one `NearbySearch` row (`lib/nearbyStats/server.ts`): feature, **area = nearest city/town name only, never coordinates** (`area.ts` + `data/towns.json`, OSM place=city|town built by `scripts/osm-towns.py`, none beyond 20 km), via gps/place (client sends `via`), radius, result count, nearest distance, status ok/partial/error, degraded sources (`osm:snapshot`, `<provider>:error`), latency, ipHash (erased after 10 days when stats load). The DB is woken (`$connect`) while sources run and the write is capped at 1.5s, so recording never slows a search. `GET /api/admin/nearby-stats` → `compute.ts` (pure, tested: 30-day window, unique/returning searchers, zero-result %, median nearest distance, hours in Israel time, top areas, coverage gaps = area+feature with empty searches, source failures) → `AdminStatsView/nearby/`. Chart series colours are the `chart1–3` theme tokens. The privacy policy describes this — keep it true.

### Home (`/`, `HomeView/`)
The page is "today in Orayta", in order of daily use:
- Stories row: one circle per group (`lib/storyGroups.ts`, pure, tested). The 13 daily stories form 5 groups (לימוד יומי, גדולי ישראל, חידון, חידוש, צפייה).
  - The viewer's progress bars cover only the current group.
  - Opening a group resumes at its first unseen story.
  - The viewer grows out of the tapped circle and shrinks back into it (`useStoryFlip`).
  - Gestures (`useStoryGestures`): pull down to close (follows the finger), swipe or tap to move, hold to pause (the chrome fades).
  - A tap inside the video embed pauses the clock.
- `TodayHero`: a dark "night" card with the greeting, the Hebrew date and year, the parasha and occasions, and a `SunArc` showing where the sun is in Jerusalem. Its CTA is the prayer that fits now (`/siddur/<service>`).
  - Motion: `HeroSky` (stars / dawn / rays by the real sun) + `RisingLetters` (gold letters floating up); the gold rule draws in and the tags pop.
  - `ArkCurtain` ("פתיחת ההיכל"): once a day (`orayta_ark_day`) a velvet פרוכת with a gold crown parts over the already-rendered hero, light spills out, gone after 1.9s. Skipped under reduced motion (OS or the a11y widget). The privacy policy mentions it.
  - `HomeView` wraps it in `HeroDepth`: it sinks back as the page scrolls past (scroll-driven CSS, no JS).
  - Shabbat (`lib/shabbat.ts`, pure, tested — Jerusalem: candles = Friday sunset − 40 min, end = Saturday's sun 8.5° below the horizon via `jerusalemSunAt`, ר״ת = sunset + 72 min): from Friday until Shabbat goes out `ShabbatCandles` replaces `SunArc` — two gold line-art candlesticks whose flames catch right first, with a burst at each wick, then a warm glow on the card and rising embers — and `ShabbatTimes` under the tags shows a live countdown to candle lighting (then "שבת שלום ומבורך") over three time tiles. Flames are shared with the menorah (`HomeView/Flame.tsx`). Preview with `/?shabbat=1` (today as Friday) or `=2` (just after candle lighting).
  - `ChanukahLights`: on Chanukah (`lib/chanukah.ts`, pure, tested — the day begins at nightfall) a חנוכייה with tonight's candles burns in the hero. Preview any night with `/?chanukah=1…8`.
- Live strip, shown only while live.
- `FeedTeaser`: today's first feed items (a per-day seed) as portrait cards. Tapping one hands the item to `/feed` via sessionStorage (`stashFeedStart` / `takeFeedStart` in `lib/feedExcerpt.ts`), so the feed opens on it.
- `QuickAccess` (the `HE.HOME_QUICK` tiles), the nearby hub, the push card and `DedicateCard`.
- No daily-cycle learning card on home: the hero's "הלימוד היומי" button links to `/today#daily` (today's רב / ציטוט / סיכום / חידוש, Orayta's own content).

Layout: one column on phones, side cards in pairs on tablets, main + side columns at ≥1100px (`isWideRoute`).

### Home "בסביבתך" hub
`HomeView/HomeNearbyHub.tsx` — one gold-framed card with the three location features (מניין · מקווה · קברי צדיקים) on a dashed "route"; tiles come from `HE.NB_TILES`. Strings for these newer features live in `src/lib/texts/*.ts` and are spread into `HE` (still used as `HE.KEY`).

### 2f. סידור (Siddur) — `/siddur`, `/siddur/[shacharit|mincha|arvit]`
Weekday services in נוסח עדות המזרח, read as one continuous text with section navigation.

**Prayers hub (`/content`, the "תפילות" tab, `ContentsView/`):**
- `PrayersHub` shows `NowServiceCard`, then `HE.PRAYERS_QUICK` (ברכת המזון, ברכות הנהנין, אשר יצר, תפילת הדרך, ק״ש על המיטה, …), more of the siddur, then Tehillim / Tanakh.
- `?open=<SECTIONS id | SIDDUR_EXTRAS id>[&chapter=N]` opens `HubReader` (sticky back · title · text settings bar), so the back gesture returns to the hub.

- **Definitions** (`src/lib/siddur/`): each service is an ordered list of sections; each section is a list of parts = exact 1-based segment ranges of a Sefaria node under `Siddur_Edot_HaMizrach` (segment 1 of a node is its title and is skipped). `fill()` (`parts.ts`) builds a node's parts from just its special slices — used for the three Amidot and Hallel (`amida.ts`). A part may carry a `mark` (sub-anchor), a `when` condition, `only` (hide instead of fold — e.g. one of eight Chanukah readings) or a `weekday` (שיר של יום); a section may carry `when` (הלל, מוסף, תחנון, קריאת התורה). Ranges were mapped against the live text — re-verify them if Sefaria's version changes.
- **Calendar engine** (`occasions.ts` + `calendar.ts`, pure, tested): per service, the Hebrew day via `Intl` (arvit from midday = tomorrow) → occasions (ראש חודש, חנוכה + day, פורים, תעניות with Shabbat postponement, חול המועד, עשי״ת, מוצ״ש, winter = ותן טל ומטר from 7 Cheshvan to Pesach) and tachanun with its reason (Edot HaMizrach: Nisan, 1–12 Sivan, Erev YK–end of Tishrei, Friday mincha, …). `CONDITIONS` in `calendar.ts` is the single table mapping each `when` to a rule; `EVERYDAY` conditions read inline when they apply, others show a "נאמר היום" box. `today.ts` lists what's special for the banner. Not modelled: Yom HaAtzmaut/Yerushalayim, Shushan Purim in Jerusalem, Chol HaMoed mussaf, fast-day selichot.
- **Text:** `GET /api/siddur/[service]` fetches each distinct node once (Next data cache, 7 days), sanitizes the HTML to presentational tags (`sanitize.ts`), and returns `{ nodes, failed }` with a 1-day CDN cache (no-store when a node failed).
- **Time of day:** Jerusalem sun times (NOAA equation, `calendar.ts`) → `suggestService` drives the "עכשיו" badge on `/siddur`.
- **UI** (`src/components/SiddurView/`):
  - `/siddur` landing: the shared `Prayers/NowServiceCard` (the service that fits now, lit by the time of day, with today's inserts), then the three services, then `SIDDUR_EXTRAS` (opened in the hub reader at `/content?open=<id>`).
  - Reader: `TodayStrip`; a sticky `ReaderBar` (section chips with scroll-spy, progress, text-settings button, contents as a bottom `Sheet`); deep links via `#section-id`.
  - Resume: the reader offers to continue from today's last section (`lib/siddur/position.ts` + `Reader/ResumeChip`).
- **Shared reader (`components/Reader/`):**
  - `ReadingText` is the prayer typography for the siddur and every hub reader. It scales with `--siddur-scale`, caps the measure at `layout.reading`, and gives instructions a gold note style.
  - `useReaderPrefs` holds text size (`orayta_siddur_font`), reading mode (regular/sepia/night via `html[data-reading]`, `orayta_reader_mode`) and keep-awake (`orayta_reader_awake`, `useWakeLock`). `ReaderSettingsSheet` edits them.
  - All Sefaria HTML rendered client-side goes through `sanitizeSiddurHtml`.

### 2g. ספירת העומר — `/omer`
- **Logic** (`src/lib/omer.ts`, pure, tested in `tests/omer.test.ts`): `omerDayOf(hebDate)` lives in `siddur/occasions.ts` (16 Nisan … 5 Sivan → 1–49; `PrayerDay.omerDay`). `omerStatus(now)` uses Jerusalem sunset/dawn: after sunset the count is tonight's (next Hebrew day); by day `today` = last night's count (forgot → count without bracha) and `tonight` = the coming one. `getOmerDay(date)` = tonight's count (push reminders use it). `omerCount(n)` builds the Edot HaMizrach wording + sefira (verified against Sefaria's 49 lines; Sefaria has a nikud typo on day 15).
- **Siddur:** arvit section `omer` (`when: 'omer'`) from Sefaria node `Counting_of_the_Omer`: 2–4 opening + bracha, per day n count = segment 3n+3 and sefira 3n+4 as 49 `only` parts (`when: 'omer-<n>'`), 152–161 הרחמן/למנצח/אנא בכח.
- **UI** (`src/components/OmerView/`): hero ring with the Hebrew numeral, nusach card, 7×7 map (tap a day), "ספרתי" check-off + streak in `orayta_omer` (per Hebrew year), out-of-season countdown to the evening of 15 Nisan. `TodayView/OmerTodayCard` shows only in season.

### 2h. Daily learning reader — `/today/learn/[kind]`
- Kinds (`src/lib/dailyLearning/kinds.ts`): daf, mishnah, halakhah (Shulchan Arukh), rambam, yerushalmi (+ rambam3, tanakh, perek929, tanya behind "עוד לימודים"), matched by exact `title.en` in Sefaria's calendar.
- **API:** `GET /api/learn?date=YYYY-MM-DD` (today's items + parasha) and `GET /api/learn/[kind]?date=&explain=1` (text; `explain` adds Steinsaltz Hebrew for the daf). Clients always pass the Israel date — Sefaria's undated calendar follows its own server timezone. Texts are normalized by `normalize.ts` (pure, tested: spanning refs → blocks with פרק/סימן/עמוד headings, first block may start mid-chapter, footnotes/markers stripped, siddur sanitizer).
- **UI** (`src/components/LearnView/`): header with font size (shared `orayta_siddur_font`), chips between today's cycles, numbered segments, "סיימתי" per cycle with day streak in `orayta_daily_learning`, Sefaria attribution (CC-BY-NC for the William Davidson Talmud). `TodayView/DafYomiCard` lists the cycles with ✓ and links into the reader.

### 2e-0. Feed UI (רגע של תורה, `/feed`)
- **Rail:** one action rail per slide (`FeedRail`): like (hold for 🔥/👏 via `ReactionPicker`; count = all reactions), comments, save, share. Reels use the same rail plus "open in Instagram".
- **Share sheet:** `FeedShareSheet` (ui `Sheet`) gathers every export: send (native share / WhatsApp, text from `lib/feedShare.ts`), copy, IG story image, screenshot.
- **Double-tap** pops a heart where the finger landed (`DoubleTapHeart`).
- **Header:** back, accessibility, settings, saved.
- **Data:** `useFeedDeck` owns the persisted deck, paging, errors and the home hand-off; `FeedStatus` has the loading / error / empty slides.
- **Reels** cover the screen on phones (a rounded 9:16 card on wide screens). They mount one screen ahead for preload, and unmount after being swiped away so playback stops.
- **Living backdrops** (`FeedView/motif/`): each post gets two aurora lights + one of six motifs (daf, rosette, Magen David lattice, candle sparks, ring of letters, Sefer Torah column — `MOTIFS_BY_TYPE`, two per type), placed by a seed from the post key (`motifPaths.ts`, pure, tested). Only HTML layers animate (transform/opacity); loops pause while the slide is off screen (`data-live`). The home teaser cards show the same motif, still.
- **Slide transitions** (`feedMotion.ts`): each slide publishes `view-timeline: --slide`; the content lifts away / rises in and the backdrop moves at half pace (parallax) on that timeline — exact at rest, no JS, absent where unsupported.
- **Reading:** `FeedClampText` writes the text in word by word (accent colour → parchment) each time the slide arrives (`data-v` on `AnimBody`; first ~90 words only). Gematria values count up (`FeedCountUp`). Screenshots (`shareElementImage`) freeze all motion in the html2canvas clone and skip the SVG drawing (`data-html2canvas-ignore`).

### 2e. Feed comments (רגע של תורה)
Public, anonymous comments (text + optional name/nickname) on every feed post — content items and reels (`itemType` = feed type or `'reel'`, `itemId` = the item/reel id). Model `FeedComment`.

- **API:** `GET /api/feed/comments?type=&id=&cursor=` (newest first, 20/page, returns `total`), `POST /api/feed/comments`, `DELETE /api/feed/comments/[id]` (admin, or the author via the signed `x-comment-token` returned on POST and kept in localStorage). Counts ship with `/api/feed` and `/api/instagram/reels` (`comments` field, one `groupBy`).
- **Abuse controls:** rules in `src/lib/feedComments.ts` (pure, tested — length limits, no links, bidi/control chars stripped); DB-backed rate limit per hashed IP (5 / 10 min, 40 / day), duplicate check, honeypot field, target must exist. `ipHash` is never returned.
- **UI:** `src/components/FeedView/comments/` — rail button with count on cards, button in the reel bar, bottom sheet (`CommentsSheet`) with composer; name is remembered per device.
- **Admin stats:** `src/lib/adminCommentStats.ts` computes comment activity straight from `FeedComment` (no counters) — totals, today/week with deltas, unique commenters, by type, most-discussed posts, latest comments — shown in `AdminStatsView/AdminCommentsCard.tsx`.

### 2d. Torah video admin — backfill (`/feed-videos`)
Per-page "השלמת חסרים" button → `POST /api/instagram/pages/[id]/backfill` (streams NDJSON progress). Walks newest→older, imports ≤10 reels, stops at the first reel already in the DB; skips pinned posts, non-videos, reels over `reel_max_seconds` and preview-only embeds. Source: Graph API Business Discovery when `IG_GRAPH_TOKEN` + `IG_GRAPH_USER_ID` are set, otherwise the public profile embed (newest ~6 posts, no pagination). An unfinished gap is resumed via `AppConfig` key `ig_backfill_session:<pageId>`. Logic is in `src/lib/igBackfill.ts` (pure, tested).

### 2i. Push notifications (התראות) + `/hilula`
Web Push (VAPID, `web-push`), one `PushSubscription` row per device: daily reminder at the user's chosen time (default 08:00, 15-min steps, in the device's time zone) — Hebrew date + a rotating call to action (`PUSH_DAILY_LINES`), no content; one combined hilula notification at **Israel nightfall (sunset + 25 min) when the hilula's Hebrew day begins** (candle + Tehillim reminder → `/hilula`); and an omer reminder at the same nightfall in season. `hebrewDayAnchor(now)` (`lib/push/hilula.ts`) maps "now" to the current Hebrew day — after nightfall it is tomorrow's civil date; the dispatcher, `/api/hilula` and the candle counter all use it.

- **iOS:** push exists only for home-screen web apps (iOS/iPadOS 16.4+), so the sheet shows install steps in Safari. Permission is requested only from a tap.
- **Service worker** `public/sw.js`: push / notificationclick / pushsubscriptionchange only — **no fetch handler, no caching** (it must never change how the site loads). Served `no-cache` (next.config.js).
- **API:** `GET /api/push/key`, `POST /api/push/subscribe` (upsert by endpoint, rate-limited per hashed IP), `PATCH/DELETE /api/push/subscription` (ownership = endpoint + the subscription's `auth` secret), `POST /api/push/test` (admin, real push to own device), `POST /api/push/dispatch` (`Authorization: Bearer $CRON_SECRET`).
- **Scheduling:** dispatch is "send if due and not yet sent today" with a 3h late window (`src/lib/push/schedule.ts`, pure, tested); each send first claims its `last*Day` marker with a conditional update, so overlapping runs never double-send. 404/410 → row deleted.
- **Hilula matching** is offline (Intl Hebrew calendar, `src/lib/push/hilula.ts`) on top of `yahrzeit.ts`. `/hilula` shows today's tzadikim, a "light a candle" counter (`GlobalCounter` key `hilula_candles:<day>`) and links into the Tehillim reader (`/content?open=tehillim&chapter=N`).
- **UI:** `src/components/Notifications/` — sheet opened via `openNotifications()` (bell in the header, `PushOptInCard` on home/today, snoozed after dismiss); local mirror in `orayta_push`.
- **Heartbeat:** cron-job.org calls the public, secret-free `GET|POST /api/push/tick` every 5 minutes (site visits ping it too). It decides from Vercel's data cache — no DB — whether anyone is due now (`lib/push/wake.ts`, pure, tested): a subscriber's chosen minute + one backup ping, or the 6 minutes after Israel nightfall on hilula/omer nights. Only then does it touch Neon (claim on `AppConfig` `push_tick_last`, ≤ once a minute, then the idempotent dispatcher in `lib/push/dispatch.ts`). The cache (`lib/push/scheduleCache.ts`: subscribers' times, rabbis' hilula dates) is invalidated by `revalidateTag` on subscribe / prefs / unsubscribe / dead-row removal and on rabbi create/edit/delete, with a daily refresh as safety net. So Neon sleeps between real sends. The GitHub workflow is manual-only (a schedule there would wake Neon every run).
- **Shabbat / Yom Tov:** nothing goes out while either is in force (`lib/push/holy.ts`, pure, tested). Israel zones: from 40 min before Jerusalem sunset on the eve to 50 min after sunset on the day. Other zones (only the zone is known): the whole local rest day + its eve from 14:00, with the diaspora's second festival days. A daily reminder whose time fell inside it is skipped, not sent late; hilula / omer after a rest day go out only after it ends (`eveningDelayMin`); the heartbeat stays idle; admin broadcasts get 409 and skip devices abroad that are inside theirs.
- **Diagnostics:** `sendPush` logs the push service's rejection (`[push] host rejected: status body`) and the admin broadcast / server-test responses include it as `reason`.
- **Admin broadcast:** `POST /api/push/broadcast` (isAdmin) sends one written notification (title ≤50, text ≤180, same-origin link) to every subscription; one send per 2 minutes (cooldown claimed in `AppConfig` `push_broadcast_last` *before* fanning out), dead rows removed. Composer + preview + confirm in `AdminStatsView/AdminBroadcast.tsx`.
- **Self-heal:** the sheet re-registers a browser subscription the server doesn't know (PATCH 404 → POST subscribe), and prefs changed while still off are kept locally only.
- Env: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (optional), `CRON_SECRET`. Rotating the VAPID pair invalidates all subscriptions.

### 2q. חלוקת תהילים — `/tehillim`, `/tehillim/new`, `/tehillim/<slug>`
Shared Tehillim readings (refua, ilui neshama, …), built to beat tehilimyahad on every axis. No accounts: the organizer's key and the reader's device key live in `orayta_tehillim` (only sha256 hashes on the server; `x-tehillim-manage` / `x-tehillim-reader` headers); a manage link carries the key in the URL hash (`#m=`, never sent, stripped on load).
- **Units** (`lib/tehillim/units.ts`, pure, tested): `chapter` = 171 units — 150 chapters with **119 split into its 22 letters** (8 verses each); `day` = the traditional 30 days of the month; `book` = the 5 books. Holds last 20 / 90 / 240 min (`HOLD_MINUTES`).
- **Assignment** (`assign.ts`, pure, tested): the lowest round with a free unit (free = no claim or an expired hold); once all are taken a new round opens in parallel. A unit picked on the map goes to the lowest round where it's free. Writes race safely: new = create guarded by `@@unique([circleId, round, unit])`, expired hold = update guarded by its old `heldAt` (`claims.ts`, retries). One hold per reader (asking again releases it). "Done" needs ≥12 s after taking (`MIN_READ_MS`); completed books are recounted, never incremented.
- **Models** `TehillimCircle` (slug, manageHash, purpose, names[], title, note, mode, goal, endsAt, closed, books, activeAt) + `TehillimClaim`. Idle 180 days → deleted on the next create. Create: 6 / hour per hashed IP (admin exempt; admin readings get ipHash `admin` and are left out of the admin card).
- **API:** `POST /api/tehillim`, `GET|PATCH|DELETE /api/tehillim/<slug>` (state per viewer, `lib/tehillim/server.ts` `viewState`, 1.5 s per-instance cache), `POST …/claim` `{unit?}`, `POST …/claim/<id>` `{action: done|release, name?}`, `GET /api/tehillim/text/<n>` (Sefaria via the data cache, cleaned to booklet text by `text.ts`: no teamim / paseq / {פ}, qere kept, ketiv dropped).
- **UI** (`components/TehillimView/`): night hero with the dedication, progress ring + live numbers and the CTA; share panel (WhatsApp text with `whatsapp://`, native share, copy, QR — highlighted right after creating via sessionStorage `orayta_tehillim_fresh`); chapter map (tap a free unit); activity (24 h / 14 days bars, recent reads, names readers chose); organizer panel. Reading = full-screen `Sheet` (verses with gold numerals, text size, wake lock, hold timer, done / another / not now) → thanks view with "next" in one tap. Polls every 5 s visible / 60 s hidden. The bot FAB and the "what's new" announcement stay off `/tehillim*`.
- **Book moment** (`TehillimView/moment/`): when a whole book closes, letters converge into the name the reading is for (once per completed book, `useBookMoment`; preview with `?moment=1`).
- **Growth offers** (`reading/GrowthOffers.tsx`, on the thanks view): "open a reading of your own" and add-to-home-screen.
- **Entry points:** nav (תפילות group), prayers hub card (with a "חדש" badge until 2027-02-28), hilula page ("open a reading for his neshama" → `/tehillim/new?for=neshama&name=`), OG card per reading (`lib/og/tehillim.ts`). Pages under `/tehillim/<slug>` are `noindex`. The privacy policy describes all of this.

### 2j. חידון קבוצתי (Group quiz) — `/play`
Kahoot-style live game for a shiur / Shabbat table. Anyone can host (no account); everyone answers from their phone.

- **Routes:** `/play` (join: PIN → name + symbol; `?code=` from the QR), `/play/new` (host setup: topics talmud/rabbis/gematria, optional seder/masechet, 5–20 questions, 10–45s), `/play/host/[code]` (host: stage + controls; space/→/Enter advance), `/play/screen/[code]` (read-only projector view), `/play/[code]` (player phone). All full-screen on a fixed night-and-gold stage (`theme.game`); the a11y FAB is hidden under `/play`.
- **Models:** `GameSession` (questions frozen as JSON at creation, `status` lobby → question → reveal → board → … → ended, `version` bumped on every phase change), `GamePlayer`, `GameAnswer` (unique per player+question). Games live 12h; rows older than 3 days are swept on each create.
- **Sync is polling, not websockets** (Vercel): every device polls `GET /api/play/[code]` (~1s, slower when hidden) and gets the state *as that viewer may see it* (`src/lib/play/state.ts` — the correct answer and correctness stay hidden until reveal). The shared snapshot is cached per instance for 600ms and invalidated by writes. Clients keep a server-clock offset (lowest-RTT sample) so timers agree across devices.
- **Server-authoritative timing + transitions:** answers are scored on the server clock (`questionPoints`: 1000 → 500 over the window, + capped streak bonus), accepted until `endsAt + GRACE_MS`. Reveal happens automatically once every active player answered or the buzzer passed — applied lazily by whichever request sees it, guarded by `version` (`updateMany where version`), so two devices can never advance one phase twice.
- **Identity:** random secrets, only their sha256 stored. Host key + player key live in localStorage (`orayta_play_host`, `orayta_play_me`); the "remote control" QR carries the host key in the URL hash (never sent to the server) to move control to another phone. Headers: `x-play-host`, `x-play-id` + `x-play-key`.
- **Abuse controls:** create 10/hour per hashed IP (admin exempt), join 80 / 10 min per IP (a whole beit midrash shares one Wi-Fi), names 1–16 chars with bidi/control chars stripped and no links, max 100 players, host can kick.
- **Questions** (`src/lib/play/build.ts` + `buildTalmud/buildRabbis/buildMisc.ts`, pure, tested): 18 types in `kinds.ts` (`KIND_GROUPS`) — Talmud: masechet, daf (real page range per tractate, `talmudPages.ts`), completion, seder; rabbis: era, century, who first/last (disputed dates skipped), contemporaries, bio (name masked), portrait, yahrzeit, teacher/student, curated facts (the last five reuse the solo `buildKnowledgeQuestion`), author of / book by; gematria: value of a word, which word equals N. The host picks types, Talmud scope, eras and a level (easy/normal/hard = how close the distractors are); types that make no sense under the filters are dropped (e.g. seder when scoped to one seder). Types are dealt in shuffled rounds so a game stays varied; the same row is never asked twice. Setup is remembered in `orayta_play_setup`.
- **Anti-peeking:** each phone shows the answers in its own order and with its own colour + shape (`src/lib/play/scramble.ts`, hashed from player id + question, stable across polls); the phone still sends the original option index. The projector keeps the canonical order.
- **Sound + effects** (`PlayView/sound/`): synthesized with Web Audio (no files) — stage gets a soft freygish loop while answers are open (faster in the last 5s), ticks, buzzer, reveal sting, winner fanfare; phones get last-second ticks, lock-in, right/wrong, final. Per-device mute (`orayta_play_sound`; host on a touch device defaults to muted). Visuals: red pulsing vignette for the last 5s, answer-share bars on reveal, count-up scores, spotlight on the winner.
- **Invites:** the host lobby and the "הזמנה" sheet offer a formatted WhatsApp message (code + one-tap `?code=` link, RLM-prefixed lines), native share, and copy invite / link / code.

---

### 2p. צור קשר — `/contact`
- Rules (`lib/contact.ts`, pure, tested): topic, message ≤2000, optional name / reply-to (email or phone) / rating, bidi chars stripped; `contactWaText` builds the WhatsApp draft. Mail body in `lib/contactMail.ts` (HTML-escaped; a reply-to email becomes the mail's Reply-To).
- `POST /api/contact` saves the row and, for email, **awaits** the Gmail send before answering (a send left running after the response is cut off on Vercel); not configured / failed → 502 `mail`, and the page offers WhatsApp / mailto. Honeypot `website`, 5 / 10 min per IP.
- WhatsApp: `GET /api/contact` returns the number; the button is a real `wa.me` link built on every keystroke — never `window.open` after an `await` (iOS blocks it). The click only logs the message (`keepalive`).

### 2r. דף לבית הכנסת — `/poster`
A designed A4 page for a synagogue notice board: QR codes to `/minyan`, `/siddur`, `/tehillim` + a small one to the home page (`PosterView/`, texts in `lib/texts/poster.ts`).
- `PosterSheet` is drawn entirely in `cqw`, so the on-screen preview and the printed page are one drawing at two scales; fixed paper colours (`theme.game.qr*`), same in both themes.
- Printing: a second copy is portaled under `<body>` (`#poster-print`) and print CSS hides everything else (`@page A4, margin 0`) — one clean page whatever the shell holds. **No viewport units in the print rules** (Safari resolves `vh` against the window, not the sheet — the page printed small with empty sides): the sheet takes the paper's full width at 210/295. The button is `window.print()` (save as PDF from the dialog).
- The optional synagogue name lives in component state only — never stored or sent. Codes point at `SITE_URL`.
- `QrSvg` (`PlayView/QrCode.tsx`) is the bare code that fills its box.

### Install to the home screen
`lib/install.ts` + `common/useInstallMode` + `common/AddToHomeScreen`: Chromium's `beforeinstallprompt` is parked on `window.__bip` and fired from a tap (native dialog); iOS gets the Safari guide. Besides the automatic sheet there is an always-available row in the "עוד" settings and on the Tehillim thanks view.

### Share previews (`og:image`) — `lib/og/`, `GET /api/og`
Every public page declares its own preview image through `shareMeta(title, desc, path, params)` (`lib/og/meta.ts`) — a page that sets `openGraph` must bring its image (Next merges metadata per top-level key). `/api/og?p=<key>` renders one card system (`card.tsx`, 1200×630): night (espresso + gold) for pages, parchment for quoted text; emblem = line icon / portrait / game PIN.
- **Content links preview as themselves:** `/feed?i=<type>.<id>` (feed share text links the post; the feed opens on it via `/api/feed/item`, then removes `i` from the URL), `/ask?q=` (the bot's share link; the question is reopened from local history or asked on arrival), `/play?code=` (invite with the PIN), `/rabbis?q=<exact name>` (portrait), `/hilula` + `/today` (today's date / hilulot; `d=<day>` in the image URL, pages revalidate hourly), siddur services, learn kinds.
- **Satori has no RTL:** `og/text.ts` (pure, tested) wraps first, then reorders each line visually (Hebrew runs reversed with mirrored brackets, numbers/Latin kept), strips nikud. Fonts = Frank Ruhl Libre + Heebo from Google Fonts subset to the drawn text. Portraits are fetched to data: URLs first (a dead link must not fail the render).
- **Keep PNGs under ~300 KB** (WhatsApp drops bigger previews): no blurred shadows/glows; a portrait card is ~270 KB. Texts in `lib/texts/og.ts`. Bump `OG_VERSION` to refresh cached images.

### 2k. תנאי שימוש, פרטיות ונגישות — `/legal`
One page with three documents (anchors `#terms`, `#privacy`, `#accessibility`), linked from `Layout/SiteFooter.tsx` (every page with the app shell) and the "עוד" sheet and from the accessibility widget. Written to Israeli law: Privacy Protection Law incl. Amendment 13 (§11 notice: voluntary, purposes, controller, recipients, §13/§14 rights) and accessibility regulation 35ה (statement + coordinator contact, ת״י 5568 AA).

- **Content** is data in `src/lib/legal/` (`terms.ts`, `privacy.ts` = `privacyCollect.ts` + `privacyShare.ts`, `accessibility.ts`, shared owner/email/date in `meta.ts`); blocks support `**bold**` and `[label](href)` (`LegalView/RichText.tsx`). Section numbers are positional and cross-referenced in the text ("ראו סעיף 7") — renumber references when reordering.
- **Keep it true:** the privacy policy describes what the code actually collects, stores and forwards (IP hashes, push rows, comments, dedications, contact messages, game data, localStorage, location → our server / Hebcal, third-party embeds, Vercel / Neon us-east-1 / Gmail / Gemini / Groq). A feature that changes any of that must update the policy and bump `LEGAL_UPDATED`. Same for the accessibility statement's adjustments and known limitations.
- YouTube embeds use `youtube-nocookie.com` everywhere (the policy says so).

### 2l. רבי־בוט (halacha + Torah Q&A) — floating button, nav item, `/ask`
Answers questions on halacha **and** Torah knowledge (Tanakh, Talmud, who said, where it's written) **only from verified source quotes**. Not a posek — the welcome card (once per device) and a line under the composer say so; sensitive questions get an "ask a rabbi" reply, never an answer.

- **Pipeline** (`src/lib/rabbiBot/pipeline.ts`): plan (kind halacha/torah/sensitive/other, topic, likely Sefaria refs, source-language search phrases, `terms` = the subject's classical name (כחל, not עטין), `quote` when locating a saying, `rewrite` = the question restated as a sefer would title the case ("המסופק אם הטביל כלי…" — a doubt stays a doubt; shown to the user as "הבנתי שהשאלה היא", used for Wikisource and passed to the answer), `parallels` = refs of the rule / parallel case that decides an unwritten case, `principles` = the deciding rule as the sources word it ("ספק דאורייתא לחומרא")) → `retrieve.ts` (lookups in `sources.ts`): planned refs (nonexistent refs simply fail to fetch; for halacha, refs sharing no words with the question are dropped as a wrong siman); **Table of contents** (`toc.ts` + `data/sa-toc.json`, all 1,705 siman titles of the four parts, built by `npx tsx scripts/sa-toc.ts`): the titles matching the question go into the planner's message (`planUser` — with them the planner named the right siman in 11/13 test questions vs 3/13 without), and the titles matching the plan's words are leads. **The Shulchan Arukh core** (`anchors.ts`): whole simanim (`simanRanges`, one request each) from the leads, most precise first — the simanim/seifim the plan names, subject+verb pairs, matching titles, the plan's phrases searched inside the four Shulchan Arukh books (the first phrase is the ruling in the Shulchan Arukh's own wording — `PLAN_SYSTEM`), pairs of the subject term with the word the question implies (`יעלה ויבא מחזירין`, plus its defective spelling, `spellings`) — and `terms`; simanim are ranked by their best seif + the siman's title, at least one of the plan's simanim is kept and a seif it names always goes in; seifim inside a siman are chosen by a ranking local to that siman. **Ranking** (`rank.ts`, pure): rarity-weighted shared words (IDF over the fetched candidates, the user's own words ×1.5), BM25-style length tempering, question words mapped to the sources' vocabulary (`ASKED_AS`: מתי→זמן, כמה→שיעור, לחזור→מחזירין, אשה→נשים), matching (`match.ts`) tolerant of full/defective spelling and construct/plural endings (`skeleton`), of one-letter prefixes on both sides (`keysOf`), and of abbreviations (`abbrev.ts`: ר״ח, יו״ט, ק״ש, בהמ״ז…); up to 26 passages reach the model (Gemini's quota counts requests, not tokens); the same siman in the **Arukh HaShulchan** (`arukhHaShulchanRef`) for the top two simanim; for the best seif of the top two simanim, linked Kaf HaChayim / Ben Ish Hai / Mishnah Berurah / Shach / Peninei Halakhah / Rambam / Gemara via Sefaria links (range refs, ranked by keyword overlap); **the site's own summaries** (`sikumim.ts`, `SikumEntry` keyword match with title words weighted — sibling entries share vocabulary; placed right after the Shulchan Arukh anchors, deep link `/sikumim?book=&entry=`); **poskim whose books aren't online** (`authorities.ts`: the Chazon Ish — removed from Wikisource over copyright — and R' Chaim Naeh; named in the question → every Halakhah segment quoting him by name, ranked by the plan's `terms`, mostly Peninei Halakhah footnotes); **a measure's modern size** when the question asks in liters/cm/grams (`measures.ts`: the measure's name in Halakhah + paired with the unit across the library — Steinsaltz on the Rambam, Peninei Halakhah, Mishnat Eretz Yisrael; `hasModernUnit` keeps only real modern units, so a Rishon's "ב' ליטרים" (litras, a weight), "מטר" (rain) or "גרם" (caused) never pass); Sefaria full-text search (Halakhah for halacha; Tanakh/Mishnah/Talmud/Midrash for torah; exact-field search for a quote; a phrase with no hits is retried as content-word pairs (`fallbackPhrases`), whose hits must share ≥2 plan words); `principles` searched in Halakhah; Hebrew Wikisource. Summaries need a shared word with the plan's own words, not just the user's filler (`STOP` in `text.ts`). A Shulchan Arukh seif reaches the model as two passages — Maran's words and "הגהת הרמ״א" (Sefaria wraps each gloss in `<small>`: `markRema` keeps the bounds through `stripHtml`, `splitRema` / `splitRemaCandidate` separate them; a removed gloss leaves "…", which `findQuote` never crosses), so a gloss is never quoted as Maran. Footnotes are kept (`stripHtml` fences each with "…" gaps, so no quote runs from the text into its note) → answer (JSON: short + points with `view` main/ashkenaz/note, each citing passage ids with verbatim quotes) → **`verify.ts`**: a point survives only if its quote is found in the cited passage (`findQuote`, nikud/punctuation-tolerant, ≥80% of the quote's words consecutive); the quote shown is the source's own span. Nothing verified → `not_found`. Each point has a `basis`: explicit / **derived** (counting, ordering, combining — "the third judge", tag "מסקנה מתוך המקורות") / **rule** (no source discusses the exact case; a cited rule or parallel case decides it — tag "מסקנה מכלל הלכתי"; when every non-note point is one, `byRule` shows an "אין מקור שעוסק במקרה הזה במפורש" notice). For derived and rule points every premise must be cited, and if any premise's quote fails the whole point is dropped. Cache keys carry `ANSWER_VERSION` (`rules.ts`) — bump it when answering changes. **Streaming:** the answer model is called with `streamGenerateContent` (Gemini; Groq answers whole); `partial.ts` (pure) reads the closed points from the JSON so far, each is verified at once and sent as a `partial` event — the panel shows `StreamingAnswer` from the first verified point, `done` replaces it. **Second try** (`retry.ts`, pure): a `not_found` goes once to the next model in the chain only when the miss looks like the model's (quotes failed, or a passage holds ≥75% of the question's own words) and ≥15s of budget remain. **Regression set:** `npx tsx scripts/rabbibot-eval.ts` (10 varied questions, the seif each must retrieve; `--runs 3` since plans vary, `--answer` also answers — uses flash quota, `--only N` lists passages) — **a one-off study tool, never routine**: it spends the site's daily model quota, so it is not part of `npm test`, the pre-push check or any hook, and runs only when the owner explicitly asks. Halacha — **communities** (`views.ts`): the main ruling is עדות המזרח (Maran, Kaf HaChayim, Ben Ish Hai, the site's summaries of R' Ovadia's Kitzur SA and R' David Yosef's Torat HaMoadim); where communities rule differently each gets its own point — `ashkenaz` (Rema, MB, Arukh HaShulchan, Ganzfried's Kitzur on Sefaria…), `teiman` (the Rambam, Baladi) — and the headings name the community (`HE.RB_VIEW`); when all agree it is just "להלכה" (`RB_VIEW_AGREED`). `verify.ts` moves a main point resting only on Ashkenazi books (`isAshkenaziSource`) to `ashkenaz`. Torah answers have no community views (`answer.kind`).
- **Models** (`gemini.ts`, `groq.ts`, `plan.ts`), all free tiers, no billing. Free quota is **per model name**, so each step walks a chain; a model whose provider has no key is skipped.
  - **Gemini** (`GEMINI_API_KEY`, AI Studio): flash ≈ 20 requests/day each, lite far more. Per-day 429 (`classifyFailure`) → `AppConfig` `rabbi_bot_exhausted:<model>` until Pacific midnight; 503 / unparsable output / Groq `json_validate_failed` (Qwen sometimes derails) → one retry (`isMomentary`).
  - **Groq** (`GROQ_API_KEY`, OpenAI-compatible, strict JSON schema via `strictSchema`; models prefixed `groq:`): **200,000 tokens/day per model (TPD, rolling)** — the real ceiling, ~80 plans/day on Qwen, ~48 on gpt-oss — and 7–8k input tokens/minute (≈ 0.5 token per Hebrew char); daily limit read from the 429 message. Gemini models probed Nov 2026: 2.5-* → 404, pro/4-argon/4-carbon → no free quota, 3.7-flash → timeouts; `gemini-3.1-flash-lite-preview` works (in the lite tier).
  - **Plan:** the Groq planners (`RABBI_BOT_PLAN_ENSEMBLE`: Qwen 3.8 27B, then gpt-oss-120b) run **one at a time** — gpt-oss only when Qwen's plan needs a second opinion (`needsSecondPlan`: "other", or no ref at all), then `mergePlans` interleaves them (any "sensitive" wins). Groq's 200k tokens/day per model is the reason. It leaves the flash quota to answers. When a planner failed and the rest said "other", the Gemini plan chain gets a second opinion (a lone gpt-oss turned away "how much is a log in liters"); shiurim count as halacha in `PLAN_SYSTEM`. Fallback: the Gemini plan chain (`RABBI_BOT_PLAN_MODELS`, hedged after 7s) — lite models first, so a Groq outage never spends the flash quota answers need.
  - **Answer** (`RABBI_BOT_ANSWER_MODELS`): flash models → Groq Qwen (gets `compactUser` = the passages that fit in 6,000 chars, `fitPassages`) → lite. Tested and rejected: Gemma 4 on AI Studio (mixes up sources, slow), gpt-oss for answers (gives up too readily).
  - Per-request deadline (52s, `maxDuration` 60) caps every call. **Admin emails** (`quota.ts`, `mailer.ts`, configured models only), at most one each per quota day: all primary (Gemini flash) answer models out → "switched to backup"; all models out → "unavailable until HH:MM".
- **API:** `POST /api/rabbi-bot/ask` (NDJSON `RabbiBotEvent`: steps — `read` carries the count + book names of the passages being checked, for the bookshelf animation (worded "checking", never "found"; a `not_found` answer reports `searched`) — then done/error; honeypot, 4 / 10 min + 25 / day per hashed IP; same question within 10 days served from cache unless reported or rated ≤2), `POST /api/rabbi-bot/feedback` (1–5 stars / error report, owner = signed token), `GET /api/rabbi-bot/stats` (admin).
- **Retention:** model `RabbiBotQuestion`. `question`, `answer`, `qHash`, `ipHash`, `note` are nulled after **10 days** (`purgeOld`, runs on each ask and stats load); counts (status, topic, model, points/verified, books, latency, rating, reported) stay. The privacy policy says so — keep it true.
- **UI** (`src/components/RabbiBot/`): `RabbiBotAvatar` (SVG character — bot head with LED visor, knitted kippah, payot, beard; fixed palette `theme.bot`; moods animate the LEDs), `RabbiBotFab` (bottom-left — the a11y button owns bottom-right; hidden on `/play`, `/ask`, `/login`, `/feed`; a speech-bubble teaser for people who never opened it, ≤4 times, ≥20h apart, `orayta_rabbibot_teaser`), `RabbiBotHost` (sheet, `useBodyScrollLock` — iOS-safe body pinning; also opened via `openRabbiBot()`), `RabbiBotPanel` (shared with `/ask`): welcome → greeting + composer → `ThinkingStage` (avatar, step headline, `Bookshelf` of the real books found, quill while writing, magnifier + checks while verifying) → answer ("הבנתי שהשאלה היא", views, numbered cites jumping to source cards with highlighted quotes + Sefaria / Wikisource / summaries link) → share / copy (`lib/rabbiBot/share.ts`, pure) → stars / report. Local state in `orayta_rabbibot`: the answer on screen + the last 5 answers (`withHistory`), listed under the composer and reopened without a request. Promoted by the floating button, the nav item and a "חדש" badge (`newBadges.ts`).
- **Voice** (`components/RabbiBot/voice/`, `lib/rabbiBot/voice/`): with the box empty its round button is a microphone. `useRecorder` (MediaRecorder; AudioContext created inside the tap for iOS; live level → `VoiceBar` waveform; stops itself 1.8s after speech pauses, cap 60s) → `POST /api/rabbi-bot/transcribe` (raw audio body ≤3 MB, in-memory 12 / 10 min + 80 / day per hashed IP, admin exempt) → Groq Whisper `whisper-large-v3` with a halachic-vocabulary prompt (`WHISPER_PROMPT`), turbo as fallback; `cleanTranscript` drops Whisper's silence hallucinations. The transcript fills the composer for review — sending is still a tap. Audio is never stored (privacy policy says so). **Read aloud:** `answerSpeech` (pure, tested) turns an answer into short sentences with abbreviations spelled out (`speakable`: שו״ע → שולחן ערוך, whole words only); `useSpeech` reads them with the device's Hebrew voice, pause = cancel + resume from the chunk, rate ×0.85/×1/×1.2 in `orayta_tts_rate`; `ListenBar` + the point being read highlighted. A spoken question's answer is read automatically (speech is unlocked inside the mic tap).
- **Admin:** `AdminStatsView/rabbiBot/AdminRabbiBotCard.tsx` — today/week, askers (10d), avg rating + distribution, answered %, verified %, latency, cache %, reports, quota status + answers per model today, topics, statuses, most-cited books, low-rated/reported and recent questions, and **knowledge gaps** (`AdminRabbiBotGaps`: not_found questions in the 10-day window with what was understood and the books searched — `answer.searchedBooks` — and a link to write a summary).

### 3. תרגול (Quiz / Training)
Modes are listed in `QuizView/ModeGrid.tsx` (one config array). Besides the table below: **חזרה חכמה** (flashcards with Leitner spaced repetition, `src/lib/srs.ts`, localStorage `orayta_srs`; the citation modes feed it too), **סדר כרונולוגי** (drag-to-order with Pointer Events, `QuizView/chrono/`), **שאלות ידע** (century, yahrzeit, teacher/student links parsed from bios, same era, and a curated bank in `src/lib/knowledge/bank.ts` — re-check it when bios change), plus the books/gematria/seder/bio/image/who-first modes. A card at the top links to the group quiz (`/play`).

| Mode | Hebrew label | Description |
|------|-------------|-------------|
| Classic | חידון קלאסי | Given a citation, identify masechet + daf + amud |
| Multiple choice | חידון אמריקאי | Pick the correct location from 4 options |
| Completion | השלמת ציטוט | Given the start of a citation, complete the rest |
| Rabbi guess | ניחוש רב | Given a rabbi's name, guess their category |

Each mode has a hint system. After answering, completion mode shows the full citation and its source location (masechet/daf/amud).

**Statistics (StatsPanel)**
- Stored in `localStorage` per device (key: `orayta_stats`)
- Shows accuracy %, total questions, total score, last 5 answers in history
- All stats computed over all-time answers; only history display is capped at 5
- Cleared on logout
- Available to both roles (admin + reader)

---

## Auth System

The site is **public** (read-only for everyone). Login exists only for the admin.

- The admin passcode comes from the `PASSCODE` env var (never hardcode it — this repo is public).
- Login is rate-limited (5 attempts per IP per 15 minutes).

On login, the API sets **two cookies**:
1. `auth=<signed HMAC token>` — httpOnly, verified by API route guards via `isAdmin()` / `isValidAuthToken()` from `src/lib/auth.ts`. The token is signed with `AUTH_SECRET` (falls back to `PASSCODE`) so it cannot be forged.
2. `role=admin` — NOT httpOnly, readable by client-side JS for UI only (never trusted by the server)

`RoleProvider` (in root layout) reads the `role` cookie in `useEffect`. **Critical:** Login uses `window.location.href` (not `router.push`) so `RoleProvider` re-mounts and picks up the new cookie. On logout, `clearStats()` is called before redirecting.

**The admin is never counted.** Every statistic skips an admin request on the server via `isAdmin(req)`: visits, `/api/track`, shares, quiz answers, feed saves and likes, hilula candles, nearby-search rows, and רבי־בוט questions (answered but not logged; feedback is a no-op). The client also sends no tracking pings while the `role=admin` cookie is set (`isAdminBrowser()` in `lib/track.ts`). New counters must follow the same rule.

All mutation API routes must call `isAdmin(req)` from `src/lib/auth.ts` — never compare the cookie to a plain string. Public write endpoints (contact, dedication requests) must be rate-limited and validated.

Required production env vars (set in Vercel): `PASSCODE` (admin passcode), `AUTH_SECRET` (long random string for cookie signing). Login returns 503 in production if `PASSCODE` is missing.

---

## Data Model

### Prisma schema (`prisma/schema.prisma`)

```
Citation
  id          String
  content     String
  locations   CitationLocation[]   ← one citation can have many locations
  createdAt   DateTime
  updatedAt   DateTime

CitationLocation
  id          String
  citationId  String
  masechet    String
  seder       String
  daf         String
  amud        String?              ← nullable, 'א' or 'ב'

Rabbi
  id          String
  name        String               ← display name
  fullName    String?              ← optional longer name
  sortYear    Int                  ← negative = BCE, used for chronological sort
  datePeriod  String               ← human-readable date range (Hebrew)
  isAlive     Boolean
  bio         String
  category    String               ← see RabbiCategory below
  createdAt   DateTime

QuizResult                         ← legacy model, no longer written to (stats moved to localStorage)
  id          String
  citationId  String
  score       Float
  answeredAt  DateTime
```

### Rabbi Categories

12 categories in chronological order (`CATEGORY_ORDER` in `src/lib/rabbisData.ts`):

| key | Hebrew label |
|-----|-------------|
| `torah` | תורה |
| `neviim` | נביאים |
| `ketuvim` | כתובים |
| `zugot` | זוגות |
| `tannaim` | תנאים |
| `amoraim` | אמוראים |
| `geonim` | גאונים |
| `rishonim` | ראשונים |
| `acharonim` | אחרונים |
| `hasidim` | חסידים |
| `abuchatzira` | אבוחצירא |
| `late` | אחרוני אחרונים |

---

## Talmud Data Structure

### Sedarim and Masechtot

| Seder | Masechtot |
|-------|-----------|
| זרעים | ברכות |
| מועד | שבת, עירובין, פסחים, יומא, סוכה, ביצה, ראש השנה, תענית, מגילה, מועד קטן, חגיגה |
| נשים | יבמות, כתובות, נדרים, נזיר, סוטה, גיטין, קידושין |
| נזיקין | בבא קמא, בבא מציעא, בבא בתרא, סנהדרין, מכות, שבועות, עבודה זרה, הוריות |
| קדשים | זבחים, מנחות, חולין, בכורות, ערכין, תמורה, כריתות, מעילה, תמיד |
| טהרות | נידה |

Full lists and lookup functions are in `src/lib/hebrewData.ts` (`MASECHTOT`, `SEDARIM`, `getMasechetSeder`, `sederIndex`, `masechetIndex`, `dafToNumber`).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 13.5.6 (App Router) |
| Language | TypeScript (strict, no `any`) |
| UI | React 18, Styled Components v6 |
| Database | PostgreSQL (Neon, production) |
| ORM | Prisma 5 |
| Hosting | Vercel |

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                  ← root layout: StyledComponentsRegistry, ClientProviders
│   ├── page.tsx                    ← home (HomeView)
│   ├── login/page.tsx
│   ├── study/page.tsx              ← TalmudView (צפייה + הוספה tabs)
│   ├── rabbis/page.tsx             ← RabbisView
│   ├── quiz/page.tsx               ← QuizView
│   ├── about/page.tsx              ← AboutView
│   ├── add/page.tsx                ← legacy, still exists
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      ← sets auth + role cookies
│       │   ├── logout/route.ts     ← clears cookies
│       │   └── me/route.ts         ← returns current role
│       ├── citations/
│       │   ├── route.ts            ← GET (list, filter) + POST (admin)
│       │   └── [id]/route.ts       ← GET + PUT + DELETE (admin)
│       ├── rabbis/
│       │   ├── route.ts            ← GET (all, optional ?category=) + POST (admin)
│       │   └── [id]/route.ts       ← PUT + DELETE (admin)
│       └── quiz/
│           ├── route.ts            ← GET random citation
│           ├── completion/route.ts ← POST evaluate completion answer + return locations
│           ├── options/route.ts    ← GET 4 multiple-choice options
│           ├── reset/route.ts      ← legacy
│           └── stats/route.ts      ← legacy (stats now in localStorage)
│
├── components/
│   ├── Layout/
│   │   ├── AppShell.tsx            ← root shell (mounted once in app/layout.tsx; bare on /feed, /play*, /login)
│   │   ├── ShellChrome.tsx         ← header + tab bar + "עוד" sheet + footer around every page
│   │   └── navItems.ts             ← PRIMARY_NAV (tabs) + NAV_GROUPS ("עוד" / desktop dropdowns)
│   ├── LoginScreen/
│   │   └── LoginScreen.tsx         ← styled login with animations
│   ├── TalmudView/
│   │   └── TalmudView.tsx          ← sub-tab wrapper (צפייה / הוספה)
│   ├── StudyView/
│   │   ├── StudyView.tsx           ← citation list + filters
│   │   └── RandomCitationModal.tsx
│   ├── AddCitation/
│   │   └── AddCitation.tsx
│   ├── CitationCard/
│   │   └── CitationCard.tsx        ← displays one citation with edit/delete (admin)
│   ├── CitationForm/
│   │   └── CitationForm.tsx        ← shared add/edit form
│   ├── RabbisView/
│   │   ├── RabbisView.tsx          ← grouped list + search + admin controls
│   │   ├── RabbiCard.tsx           ← single rabbi display with edit/delete (admin)
│   │   └── RabbiForm.tsx           ← add/edit modal form
│   ├── QuizView/
│   │   ├── QuizView.tsx            ← mode tabs + filter + StatsPanel layout
│   │   ├── MultipleChoiceQuiz.tsx  ← חידון אמריקאי
│   │   ├── CompletionQuiz.tsx      ← השלמת ציטוט
│   │   ├── RabbiQuiz.tsx           ← ניחוש רב
│   │   └── StatsPanel.tsx          ← localStorage stats display
│   ├── AboutView/
│   │   └── AboutView.tsx
│   └── common/
│       ├── ClientProviders.tsx     ← wraps RoleProvider
│       ├── GlobalStyles.tsx
│       ├── Modal.tsx               ← reusable modal wrapper
│       ├── OraytaLogo.tsx          ← SVG logo component
│       ├── RoleContext.tsx         ← RoleProvider + useRole hook
│       └── StyledComponentsRegistry.tsx ← SSR fix for styled-components
│
├── lib/
│   ├── db.ts                       ← Prisma client singleton
│   ├── hebrewData.ts               ← MASECHTOT, SEDARIM, lookup functions (app data, not seed)
│   ├── hebrewTexts.ts              ← HE object: ALL Hebrew strings used in UI
│   ├── rabbisData.ts               ← CATEGORY_LABELS, CATEGORY_ORDER, CATEGORY_COLORS
│   ├── statsStorage.ts             ← localStorage stats: addStat, getStats, clearStats, computeSummary
│   └── theme.ts                    ← design tokens (colors, spacing, radii, fonts, shadows)
│
├── types/
│   └── index.ts                    ← all TypeScript interfaces and types
│
└── middleware.ts                   ← auth guard, redirects unauthenticated users to /login
```

---

## Key Conventions

### Hebrew strings
All Hebrew UI text lives in `src/lib/hebrewTexts.ts` under the `HE` object. **Never write Hebrew strings directly in component files.** Import and use `HE.KEY_NAME`.

### Roles and permissions
Use the `useRole()` hook from `RoleContext`. Guard admin-only UI with `role === 'admin'`. API routes check the `auth` httpOnly cookie directly:
```ts
function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}
```

### RTL
The entire site is RTL (Hebrew). Use `direction: rtl` in styled components where needed. Global RTL is set in `GlobalStyles.tsx`.

### App shell and design system
- **Shell:** `Layout/AppShell` is mounted once in the root layout, so pages never wrap themselves in a layout. Bare routes come from `lib/routes.ts` (`isBareRoute`); `isWideRoute` gives a page the wider desktop canvas.
  - **Compact screens (<1100px):** `AppHeader` (the espresso `chrome` bar, under the status bar) + `BottomTabBar` (בית · רגע של תורה · תפילות · יומי · עוד) + `MoreSheet` (searchable launcher grid + settings).
  - **Desktop:** `DesktopNav` (flat primary links + `NavMenu` dropdowns).
- **iPhone safe areas:** `viewport-fit=cover` + `black-translucent` status bar. Every top-anchored full-screen surface pads with `theme.safe.top`; bottom ones with `theme.safe.bottom`. The tab bar publishes `--tabbar-h` (0 when hidden), and floating buttons and footers clear it with that var.
- **Tokens (`lib/theme.ts`):** `colors.chrome/onChrome/gold/goldSoft/elevated/scrim`, `gilded` (gold CTA + night hero surfaces), `onMedia` (controls over photos/video), `radii.pill`, `motion.outStrong/inOut/drawer`, `z.tabbar/popover/sheet`, `media.compact` + mobile-first `up.*`, `safe.*`, `layout.content/wide/reading/gutter`.
- **Primitives (`components/ui/`)** — use these instead of new one-off styled buttons/cards/sheets:
  - `Sheet`: bottom sheet with finger-following drag-to-dismiss on phones, a dialog on desktop; scroll lock + focus trap.
    - Touches in a text field or a scrolled inner scroller never drag it.
    - `full` = full-screen editor above the iOS keyboard (`useViewportBox`).
    - `guarded` = no dismiss from the backdrop or a body pull. Long-text forms use both, with buttons in `footer` and an auto-growing textarea (`common/useAutoGrow`). Example: `SikumEntryForm`, whose drafts are kept for edits too.
  - `Button` / `ButtonLink`, `IconButton` (≥44px hit area), `Card` / `CardLink` / `CardButton`.
  - `Chip` / `ChipRow`, `Badge`, `Skeleton` / `SkeletonText`, `SegmentedControl`, `SwitchRow` / `RowGroup`, `PageHeader` / `SectionHeader`.
- **Logo:** `common/OraytaLogo` — a gilded medallion with an open Torah scroll and a כתר תורה. `animated` (header, login, about): the scroll unrolls as the rollers part, the crown settles, jewels twinkle, a sheen crosses now and then. Static elsewhere (icons, previews).
- **Theme:** `ThemeContext` has a 3-way mode (light / dark / system); light is the default. It keeps `<meta name="theme-color">` on the chrome colour, and immersive screens override it with `useThemeColor`.
- **Accessibility settings** open from the header button (`openAccessibility()`); bare routes get a floating button instead.

### Styled components
Use Styled Components for all styling. Theme tokens from `src/lib/theme.ts` only — no hardcoded colors or spacing values. The `StyledComponentsRegistry` in the root layout is required for SSR to work correctly.

### Sticky bars
The header publishes its live height as `--header-h`; page sticky bars use `top: var(--header-h)`. A page's tab row goes through `common/StickyTabs.tsx`, which portals it into the header (`Layout/HeaderSlot.tsx`) so header + tabs stick as one element — two stacked sticky elements drift apart while scrolling in the iOS home-screen app.

### File size
Keep all files under 200 lines. Split into smaller components if needed.

### No `any`
TypeScript strict mode. Never use `any`. Define proper interfaces in `src/types/index.ts`.

---

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build (runs type check)
npm run lint         # ESLint
npm test             # unit tests (node:test via tsx, tests/*.test.ts)
npm run db:push      # push Prisma schema changes to DB
```

No seed scripts — all data is already in the production database.

---

## Rules

- TypeScript only, no `any` types
- Functional React components
- Files under 200 lines — split when needed
- Reuse existing components before creating new ones
- Mobile + Web compatibility (responsive)
- Hebrew website — RTL layout throughout
- All Hebrew strings in `src/lib/hebrewTexts.ts`, never inline
- Always build and verify before pushing to git
- Ask before doing something uncertain
