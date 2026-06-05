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

**Admin controls (passcode 1998)**
- Add, edit, delete any rabbi entry
- RabbiForm modal with all fields

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

Two passcodes:
- `1998` → role `admin` — full access (add/edit/delete citations and rabbis)
- `1111` → role `reader` — read-only + quiz access

On login, the API sets **two cookies**:
1. `auth=admin|reader` — httpOnly, used by middleware and API route guards
2. `role=admin|reader` — NOT httpOnly, readable by client-side JS

`RoleProvider` (in root layout) reads the `role` cookie in `useEffect` — it defaults to `'admin'` on SSR to avoid hydration mismatch, then corrects on client. **Critical:** Login uses `window.location.href` (not `router.push`) so `RoleProvider` re-mounts and picks up the new cookie. On logout, `clearStats()` is called before redirecting.

Middleware in `src/middleware.ts` protects all routes except `/login` and `/api/auth/*`. Unauthenticated users are redirected to `/login`.

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
