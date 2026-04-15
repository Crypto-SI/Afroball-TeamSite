# Toman Mariners FC Site

This repository contains a Next.js club website for **Toman Mariners FC**. It includes a public-facing marketing site, a fixtures and results page, a login flow, and an admin dashboard that can run in either local demo mode or live mode with Supabase.

The project is no longer just a generic football template. It already has concrete routes, shared site chrome, seeded club data, Supabase wiring, and an AI match insight flow.

## What The App Includes

- Public homepage with hero, latest result, next fixture, social placeholders, and fan CTAs
- Dedicated pages for `Fixtures`, `Players`, `Staff`, `Tickets`, `Merch`, `Partnership`, and `Contact`
- Login page for admin access
- Admin dashboard for managing fixtures, results, players, and staff
- Supabase client/server/middleware helpers
- Seeded local data so the site still works before Supabase is configured
- Genkit-based AI match insight flow in `src/ai/flows/automated-match-summaries.ts`

## Tech Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Lucide React
- Supabase
- Genkit with Google GenAI

## Current Routes

- `/` home page
- `/fixtures` fixtures and results
- `/players` squad page
- `/staff` staff page
- `/tickets` ticketing page
- `/merch` merchandise page
- `/partnership` partnerships page
- `/contact` contact page
- `/login` admin login
- `/admin` editor dashboard
- `/docs/supabase` in-app Supabase documentation page

## Admin Dashboard Behavior

The admin area supports two operating modes:

- `mock` mode: used when Supabase env vars are missing. The dashboard loads seeded local data from `src/lib/team-site-data.ts` and changes are only in-memory for the current session.
- `live` mode: used when Supabase is configured and the required schema exists. The dashboard reads and writes real records.

If Supabase is configured but the tables or policies are missing, the dashboard falls back to a schema warning state and points you to the SQL docs in `docs/supabase/`.

## Environment Variables

The app currently expects the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
GOOGLE_API_KEY=
```

Use:

- `.env.example` as the committed template
- `.env` for local development

`NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are the minimum required values for the app to detect a Supabase-enabled setup.

## Local Development

1. Install dependencies:

```bash
npm install
```

2. Populate `.env` with your local values.

3. Start the app:

```bash
npm run dev
```

The dev server runs on port `9002`.

## Useful Commands

```bash
npm run dev
npm run build
npm run start
npm run typecheck
```

`npm run typecheck` currently performs a production Next build first, then runs `tsc --noEmit`.

## Project Structure

```text
src/app                App Router pages
src/components         Shared UI, navbar, footer, and shadcn components
src/lib                Seed data, utilities, and Supabase helpers
src/ai                 Genkit setup and AI flows
src/types              Shared TypeScript types, including database types
docs/supabase          Setup notes, schema SQL, and rollout docs
middleware.ts          Next middleware entrypoint
```

## Supabase Notes

Supabase integration is already wired into the codebase:

- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/middleware.ts`
- `src/lib/supabase/env.ts`

Related schema and rollout docs live in:

- `docs/supabase/01-project-setup.md`
- `docs/supabase/02-schema-and-rls.md`
- `docs/supabase/03-nextjs-integration.md`
- `docs/supabase/04-team-launch-checklist.md`

## Seed Data

Until live data is connected, the site uses seeded records from:

- `src/lib/team-site-data.ts`

That file currently defines the fixture, player, staff, and goal types plus the initial local dataset shown across the site and dashboard.

## Notes

- The club name and branding are still placeholder/demo branding unless you choose to rebrand the project.
- Some social and commerce areas are still content placeholders rather than production integrations.
- AI features depend on `GOOGLE_API_KEY`.
