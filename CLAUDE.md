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

---

### 2b. שידור חי (Live Torah) — `/live`
Live YouTube streams from a followed list of channels (`LiveChannel` model), watched inside the app via an embedded player.

- **Detection is scraping-based, no YouTube API key.** `src/lib/youtubeLive.ts` fetches each channel's public `youtube.com/channel/<id>/live` page. A page counts as live only if it contains `"isLive":true` and NOT `"isUpcoming":true` (waiting rooms/scheduled streams have both a canonical watch URL and `isUpcoming`). Video id comes from the canonical link, falling back to `currentVideoEndpoint` — YouTube serves datacenter IPs (Vercel) a page variant with `canonical="undefined"` and no `videoDetails`, so don't "simplify" back to those markers.
- **Caching:** the sweep result is stored in `AppConfig` under `live_snapshot` with a 60s TTL — refreshed on demand by `/api/live`, never by cron (Vercel Hobby crons are once/day). Admin channel mutations invalidate it.
- **API:** `GET /api/live` (public snapshot), `GET/POST /api/live/channels` + `PATCH/DELETE /api/live/channels/[id]` (admin; add accepts any channel URL/@handle and resolves it by scraping, including the channel avatar). Channels GET lazily backfills missing `avatarUrl` values (null = retry later, `""` = none found).
- **UI:** `src/components/LiveView/` (cards, in-app player overlay, admin card), `HomeView/LiveBannerBlock.tsx` (loud banner with stream thumbnails when live, quiet strip otherwise).
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
- **Map tiles:** `src/lib/mapTiles.ts` (OSM standard tiles, keyless; CARTO now returns "API KEY REQUIRED" images). Override with `NEXT_PUBLIC_MAP_TILE_URL` / `NEXT_PUBLIC_MAP_TILE_ATTRIBUTION`. Leaflet path classes must be passed as the `className` prop, not inside `pathOptions` (setStyle ignores it).
- **"חדש" badges:** `src/lib/newBadges.ts` — date-expiring, no follow-up commit needed.

### 2f. סידור (Siddur) — `/siddur`, `/siddur/[shacharit|mincha|arvit]`
Weekday services in נוסח עדות המזרח, read as one continuous text with section navigation. The "סידור" card in `/content` links here.

- **Definitions** (`src/lib/siddur/`): each service is an ordered list of sections; each section is a list of parts = exact 1-based segment ranges of a Sefaria node under `Siddur_Edot_HaMizrach` (segment 1 of a node is its title and is skipped). `fill()` (`parts.ts`) builds a node's parts from just its special slices — used for the three Amidot and Hallel (`amida.ts`). A part may carry a `mark` (sub-anchor), a `when` condition, `only` (hide instead of fold — e.g. one of eight Chanukah readings) or a `weekday` (שיר של יום); a section may carry `when` (הלל, מוסף, תחנון, קריאת התורה). Ranges were mapped against the live text — re-verify them if Sefaria's version changes.
- **Calendar engine** (`occasions.ts` + `calendar.ts`, pure, tested): per service, the Hebrew day via `Intl` (arvit from midday = tomorrow) → occasions (ראש חודש, חנוכה + day, פורים, תעניות with Shabbat postponement, חול המועד, עשי״ת, מוצ״ש, winter = ותן טל ומטר from 7 Cheshvan to Pesach) and tachanun with its reason (Edot HaMizrach: Nisan, 1–12 Sivan, Erev YK–end of Tishrei, Friday mincha, …). `CONDITIONS` in `calendar.ts` is the single table mapping each `when` to a rule; `EVERYDAY` conditions read inline when they apply, others show a "נאמר היום" box. `today.ts` lists what's special for the banner. Not modelled: Yom HaAtzmaut/Yerushalayim, Shushan Purim in Jerusalem, Chol HaMoed mussaf, fast-day selichot.
- **Text:** `GET /api/siddur/[service]` fetches each distinct node once (Next data cache, 7 days), sanitizes the HTML to presentational tags (`sanitize.ts`), and returns `{ nodes, failed }` with a 1-day CDN cache (no-store when a node failed).
- **Time of day:** Jerusalem sun times (NOAA equation, `calendar.ts`) → `suggestService` drives the "עכשיו" badge on `/siddur`.
- **UI** (`src/components/SiddurView/`): `TodayStrip` (Hebrew date, occasions, tachanun, jumps to today's inserts), sticky `ReaderBar` (service switcher, section chips with scroll-spy, progress, font size remembered in `orayta_siddur_font`, contents sheet), deep links via `#section-id`. Standalone pieces (bedtime Shema, Kaddish, …) are `SIDDUR_EXTRAS` in `lib/siddurContent.ts`.

### 2e. Feed comments (רגע של תורה)
Public, anonymous comments (text + optional name/nickname) on every feed post — content items and reels (`itemType` = feed type or `'reel'`, `itemId` = the item/reel id). Model `FeedComment`.

- **API:** `GET /api/feed/comments?type=&id=&cursor=` (newest first, 20/page, returns `total`), `POST /api/feed/comments`, `DELETE /api/feed/comments/[id]` (admin, or the author via the signed `x-comment-token` returned on POST and kept in localStorage). Counts ship with `/api/feed` and `/api/instagram/reels` (`comments` field, one `groupBy`).
- **Abuse controls:** rules in `src/lib/feedComments.ts` (pure, tested — length limits, no links, bidi/control chars stripped); DB-backed rate limit per hashed IP (5 / 10 min, 40 / day), duplicate check, honeypot field, target must exist. `ipHash` is never returned.
- **UI:** `src/components/FeedView/comments/` — rail button with count on cards, button in the reel bar, bottom sheet (`CommentsSheet`) with composer; name is remembered per device.
- **Admin stats:** `src/lib/adminCommentStats.ts` computes comment activity straight from `FeedComment` (no counters) — totals, today/week with deltas, unique commenters, by type, most-discussed posts, latest comments — shown in `AdminStatsView/AdminCommentsCard.tsx`.

### 2d. Torah video admin — backfill (`/feed-videos`)
Per-page "השלמת חסרים" button → `POST /api/instagram/pages/[id]/backfill` (streams NDJSON progress). Walks newest→older, imports ≤10 reels, stops at the first reel already in the DB; skips pinned posts, non-videos, reels over `reel_max_seconds` and preview-only embeds. Source: Graph API Business Discovery when `IG_GRAPH_TOKEN` + `IG_GRAPH_USER_ID` are set, otherwise the public profile embed (newest ~6 posts, no pagination). An unfinished gap is resumed via `AppConfig` key `ig_backfill_session:<pageId>`. Logic is in `src/lib/igBackfill.ts` (pure, tested).

---

### 3. תרגול (Quiz / Training)
Four quiz modes, all accessible to both roles:

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
│   ├── page.tsx                    ← redirects to /study
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
│   │   └── AppLayout.tsx           ← nav (תלמוד | רבנים | תרגול | אודות | יציאה), logout
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
│       ├── AppLayout.tsx           ← (see Layout/)
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

### Styled components
Use Styled Components for all styling. Theme tokens from `src/lib/theme.ts` only — no hardcoded colors or spacing values. The `StyledComponentsRegistry` in the root layout is required for SSR to work correctly.

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
