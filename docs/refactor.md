# Refactor Plan

This document tracks the main refactoring work identified during the code review. Tackle the items in order unless a later item becomes a blocker for active feature work.

## 1. Consolidate Admin Dashboard Routing

Status: complete.

- Replace the legacy `/admin` page implementation with a redirect to `/dashboard`.
- Keep one dashboard surface as the source of truth for admin and role-based management.
- Remove duplicated fixture, player, and staff CRUD logic from the old admin page.
- Verify `/admin` and `/admin/*` continue to land users on `/dashboard`.

## 2. Split Dashboard Responsibilities

Status: complete.

- Move dashboard auth/session loading out of `src/app/dashboard/page.tsx`.
- Move Supabase fetch logic into dashboard query helpers or hooks.
- Move mutation logic into resource-specific helpers or hooks.
- Keep `DashboardPage` focused on layout, sidebar selection, and section rendering.

Progress:

- Added `src/app/dashboard/use-dashboard-data.ts` for Supabase setup, session role loading, dashboard data state, refresh logic, and sign-out.
- Simplified `src/app/dashboard/page.tsx` so it mainly handles active section state, layout, sidebar rendering, and section prop wiring.
- Added `src/app/dashboard/dashboard-queries.ts` for Supabase read helpers used by the dashboard data hook.
- Added `src/app/dashboard/dashboard-mutations.ts` for Supabase write helpers used by dashboard sections.
- Split dashboard mutations into resource-specific modules under `src/app/dashboard/dashboard-mutations/`, with `dashboard-mutations.ts` kept as a barrel export for existing callers.

## 3. Normalize Demo Mode Behavior

Status: complete.

- Decide whether demo mode is read-only or locally mutable.
- Update all dashboard sections to follow the same behavior.
- Make status messages match the actual behavior.
- Avoid claiming an item was added/deleted if local state did not change.

Decision:

- Demo mode is locally mutable. Changes update in-memory dashboard state and do not persist after reload.

Progress:

- Fixtures, results, players, staff, partnerships, fixture media, site settings, player profile edits, user role changes, and user creation now update local state in demo mode.

## 4. Unify Public Data Loading

Status: complete.

- Create shared loaders for fixtures, players, staff, and site settings.
- Use the same data source for public pages and dashboard fallback content.
- Replace hardcoded public page arrays where Supabase-backed data already exists.
- Keep mock data only as an explicit fallback.

Progress:

- Added `src/lib/team-data-loaders.ts` for shared fixtures, players, and staff loading with Supabase-first reads and mock-data fallback.
- Updated `/fixtures`, `/players`, and `/staff` to use the shared loaders.
- Added shared site settings loading and wired contact details into `/contact` and footer rendering on the updated public pages.

## 5. Extract Shared Dashboard UI Patterns

Status: in progress.

- Extract repeated CRUD dialog/form patterns from dashboard sections.
- Reuse empty states, delete buttons, save handling, and form field layouts.
- Keep section components small enough to scan without chasing large state blocks.

Progress:

- Added `src/app/dashboard/components/dashboard-section-ui.tsx` with shared section header and empty table row helpers.
- Applied the shared header/empty-state helpers to selected dashboard sections as the first pass.
- Added shared `CrudDialog` and `DeleteIconButton` helpers and applied them across the standard fixtures, players, staff, partnerships, and fixture media dashboard sections.
- Extracted user management dialog/table rendering into `src/app/dashboard/components/user-management-ui.tsx`.
- Extracted fixture result entry dialog rendering into `src/app/dashboard/components/match-result-dialog.tsx`.
- Split fixture section rendering into `src/app/dashboard/components/fixture-management-ui.tsx`.
- Split partnership dialog/table rendering into `src/app/dashboard/components/partnerships-ui.tsx`.
- Split dashboard page chrome and section routing into `dashboard-shell.tsx` and `dashboard-sections.tsx`.

Remaining:

- Continue replacing specialized dialog and table patterns in custom sections where doing so reduces complexity without hiding important workflow differences.

## 6. Clean AI Summary Boundary

Status: complete.

- Stop importing Genkit server flow internals directly into client components.
- Add a server action or API route for match summary generation.
- Let the client component call that boundary and show clear error feedback.
- Address the Genkit/OpenTelemetry build warning if it remains after the boundary is cleaned up.

Progress:

- Added `src/app/api/match-summary/route.ts` as the server boundary for Genkit summary generation.
- Updated `src/components/ai-match-insight.tsx` to call the API route and show user-facing error feedback.
- Added `@opentelemetry/exporter-jaeger` so the Genkit/OpenTelemetry build import resolves cleanly.

## 7. Improve Validation And Error Handling

Status: in progress.

- Use schema validation for API request bodies and dashboard form inputs.
- Wrap async mutations with `try/finally` so saving state always resets.
- Validate scores, minutes, required names, URLs, and role values before sending requests.
- Prefer typed helper functions over repeated casts.

Progress:

- Added Zod validation to the dashboard mutation helper boundary for fixtures, match results, players, staff, partnerships, and fixture media.
- Updated live mutation handlers in dashboard sections to reset saving state in `finally` and report validation errors consistently.
- Added Zod validation to `/api/admin/create-user`.
- Added shared create-user request validation in `src/lib/admin-create-user-schema.ts` and reused it before client-side form submission.

Remaining:

- Extend validation to any future API routes and keep replacing ad hoc request parsing as endpoints are added.

## 8. Restore Non-Interactive Linting

Status: complete.

- Add or migrate to an explicit ESLint configuration compatible with the current Next.js version.
- Change `npm run lint` so it runs without prompting.
- Add linting to the normal verification flow after it is configured.

Progress:

- Added `eslint.config.mjs` using the native Next.js flat ESLint config exports.
- Updated `npm run lint` to run `eslint .` non-interactively.
- Lint now exits successfully with no warnings.

## Verification

After each refactor, run the smallest useful check first:

```bash
npm run lint
npm run typecheck
npm run build
```
