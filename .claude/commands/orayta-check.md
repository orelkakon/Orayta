Run a pre-push quality check on all recent changes to the Orayta project.

Check each item below and report status (✓ pass / ✗ fail / ⚠ warning). Fix any failures before committing.

## 1. Hebrew strings
- No Hebrew text written directly inside component `.tsx` files
- All UI strings go through the `HE` object in `src/lib/hebrewTexts.ts`
- Check: `grep -r "[֐-׿]" src/components src/app --include="*.tsx" -l`

## 2. TypeScript
- No `any` types used anywhere
- Run `npm run build` — zero errors required (build also runs the type check)
- Check: `grep -rn ": any" src/ --include="*.ts" --include="*.tsx"`

## 3. File sizes
- All files must be under 200 lines
- Check: `find src -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -rn | head -20`

## 4. Admin guards on API routes
For every API route that writes data (POST, PUT, DELETE), verify it has the admin check:
```ts
function isAdmin(req: NextRequest) {
  return req.cookies.get('auth')?.value === 'admin';
}
```
And returns 403 if not admin. Routes to check: `/api/citations`, `/api/citations/[id]`, `/api/rabbis`, `/api/rabbis/[id]`.

## 5. Admin guards on UI
Any UI action that creates/edits/deletes must be wrapped with `role === 'admin'` using the `useRole()` hook from `src/components/common/RoleContext.tsx`. The `הוספה` tab in TalmudView and add/edit/delete buttons in CitationCard, RabbiCard must all be admin-only.

## 6. RTL / layout
- New styled components that contain text should have `direction: rtl` if they don't inherit it
- No hardcoded colors or spacing — use `theme.colors.*`, `theme.spacing.*`, `theme.radii.*` from `src/lib/theme.ts`
- No fixed widths that would break on mobile

## 7. New components
- Are they reusing existing components (Modal, theme tokens, HE strings) or duplicating?
- Is any existing component now over 200 lines and needs splitting?

## 8. Git state
- `git status` — are there any untracked files that should be committed or gitignored?
- `git diff` — do the changes match what was intended?

## Report format

List each section with its status. For failures, show exactly which file/line needs fixing. Then either fix the issues found, or confirm everything is clean and ready to push.
