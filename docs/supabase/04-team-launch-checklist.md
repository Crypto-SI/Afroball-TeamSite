# 04. Team Launch Checklist

Use this as the handoff checklist every time a new club adopts the template.

## Supabase

- Create a dedicated Supabase project for the club.
- Add project URL, anon key, service role key, and JWT secret to the environment.
- Run the starter schema SQL.
- Enable RLS on all core tables.
- Create the first editor accounts.
- Create the `team-media` bucket.

## Next.js

- Install `@supabase/supabase-js` and `@supabase/ssr`.
- Add browser and server client helpers.
- Protect `/admin` with middleware.
- Replace mock state in `src/app/admin/page.tsx` with real Supabase reads and writes.
- Generate `src/types/database.ts`.

## Content

- Replace placeholder club name and placeholder scores.
- Upload club crest, player photos, staff photos, and sponsor assets.
- Seed fixtures, players, and staff tables.
- Set club-wide values in `site_settings`.

## Access Control

- Confirm public visitors can only read published content.
- Confirm non-authenticated users cannot access `/admin`.
- Confirm editors can add, edit, and delete content.
- Confirm service role keys never reach the client bundle.

## QA

- Test homepage reads against live Supabase data.
- Test fixture creation and result entry.
- Test player and staff creation with image uploads.
- Test login and logout.
- Test deployment environment variables.

## Suggested Team Roles

- Product owner: owns branding, club content, and publishing sign-off.
- Technical owner: owns Supabase setup, RLS, and deploys.
- Editor: owns fixtures, roster updates, and matchday edits.

## Definition Of Ready

A team site is ready when:
- Supabase is connected
- auth is enforced
- admin writes persist
- public pages read from the database
- storage-backed images render correctly

## Visual Reference

![Admin auth and data flow for the team site template](../assets/supabase-auth-data-flow.svg)
