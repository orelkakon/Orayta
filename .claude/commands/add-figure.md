Add one or more new figures to the Rabbi table in the Orayta database.

## How to add

Use the Prisma client directly — create a small inline script or use `prisma.rabbi.create()` via a ts-node one-liner. Do NOT modify any existing seed files (they were deleted). After adding, verify with `npm run build`.

## Rabbi model fields

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Display name (Hebrew) |
| `fullName` | String? | Optional — longer/formal name |
| `sortYear` | Int | **Negative = BCE** (e.g. -760 for 760 BCE). Used for chronological order within category. |
| `datePeriod` | String | **Hebrew only.** Use `~YYYY–YYYY לפנה"ס` for known ranges, `~המאה ה-X לפנה"ס` for century-level dates, `~YYYY לפנה"ס` for a single year. Never write "century" in English. |
| `isAlive` | Boolean | true only for living people |
| `bio` | String | Hebrew, 3–5 sentences from Wikipedia. Factual, no opinions. |
| `category` | String | Must be one of the 12 valid keys below |

## Valid categories (in chronological order)

| Key | Hebrew label | Era |
|-----|-------------|-----|
| `torah` | תורה | Biblical Torah figures |
| `neviim` | נביאים | Prophets & Judges |
| `ketuvim` | כתובים | Writings figures (Job, Daniel, etc.) |
| `zugot` | זוגות | Pairs era (~200 BCE – 10 CE) |
| `tannaim` | תנאים | Tannaitic period (~10–220 CE) |
| `amoraim` | אמוראים | Amoraic period (~220–500 CE) |
| `geonim` | גאונים | Geonic period (~589–1038 CE) |
| `rishonim` | ראשונים | Early medieval (~1038–1563 CE) |
| `acharonim` | אחרונים | Later authorities (~1563–1900 CE) |
| `hasidim` | חסידים | Hasidic masters |
| `abuchatzira` | אבוחצירא | Abuchatzira dynasty |
| `late` | אחרוני אחרונים | Modern era (20th–21st century) |

## datePeriod format examples

- `'~760 לפנה"ס'`
- `'~1562–1452 לפנה"ס'`
- `'~המאה ה-9 לפנה"ס'`
- `'~המאה ה-12–11 לפנה"ס'`
- `'~המאה ה-9 עד ה-4 לפנה"ס'`
- `'~1700–1760'` (CE, no לפנה"ס)
- `'1902–1994'`

## Idempotency rule

Before creating, check if a record with the same `name` already exists and skip if so. This prevents duplicates if run twice.

## After adding

1. Run `npm run build` — must be clean before committing.
2. Commit with a clear message listing what was added.
3. Push to git.
