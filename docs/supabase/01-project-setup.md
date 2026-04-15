# 01. Project Setup

This file covers the fastest safe way for a new club team to provision Supabase for this template.

## 1. Create A Supabase Project

1. Create a new Supabase project for the club.
2. Choose a region close to the team’s expected users and admins.
3. Save the database password in your team password manager.
4. Wait for the project to finish provisioning.

## 2. Create The Core Environment Variables

In the Supabase dashboard, copy:
- Project URL
- anon public key
- service role key

Create a local `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR-SERVICE-ROLE-KEY
SUPABASE_JWT_SECRET=YOUR-JWT-SECRET
GOOGLE_API_KEY=YOUR-GEMINI-KEY
```

## 3. Add The Same Variables To Hosting

If the site is deployed to Vercel, Firebase App Hosting, or another platform, add the same values there before testing auth or server-side writes.

## 4. Install The Supabase Packages

Use the current SSR package set instead of the older auth helper package:

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## 5. Create The First Folder Structure

Recommended files:

```text
src/lib/supabase/
  client.ts
  server.ts
  middleware.ts
src/types/
  database.ts
```

## 6. Configure Authentication Providers

Minimum recommended setup:
- Email/password for club staff

Optional additions:
- Google login for internal staff
- Magic links for non-technical editors

Do not enable public sign-up for fan-facing production sites unless the site actually needs supporter accounts.

## 7. Create A Storage Bucket

Create a bucket called `team-media`.

Use it for:
- player images
- staff images
- sponsor logos
- optional homepage or partnership artwork

Recommended bucket visibility:
- public for published media assets
- private only if you have a separate admin upload pipeline that signs URLs

## 8. Name The First Admin Users

Before launch, decide who belongs in the initial editor group:
- club owner
- media officer
- matchday editor
- technical admin

Keep this list small. Most clubs do not need broad write access.

## 9. Use The Architecture Diagram

![Supabase architecture for the team site template](../assets/supabase-team-architecture.svg)

## Setup Notes For Teams

- Use one Supabase project per club site.
- Do not share a project between multiple clubs unless you are intentionally building a multi-tenant product.
- Keep service role keys out of client components.
- Keep all public site reads on the anon key plus RLS policies.
