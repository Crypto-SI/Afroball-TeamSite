# 02. Schema And RLS

This schema matches the data model already visible in the template’s admin page and public pages.

## Content Model

The current template needs four core database tables:
- `fixtures`
- `goals`
- `players`
- `staff`

It also benefits from:
- `profiles` for editor roles
- `site_settings` for club-wide branding and contact data

## Starter SQL

Run this in the Supabase SQL editor.

```sql
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'fan' check (role in ('admin', 'club', 'creator', 'player', 'fan')),
  created_at timestamptz not null default now()
);

create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  club_name text not null,
  short_name text,
  primary_color text,
  accent_color text,
  stadium_name text,
  contact_email text,
  contact_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  opponent text not null,
  fixture_date date not null,
  fixture_time time not null,
  venue text not null,
  status text not null check (status in ('upcoming', 'completed')),
  mariners_score integer,
  opponent_score integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures(id) on delete cascade,
  player_name text not null,
  minute integer not null check (minute >= 0 and minute <= 130),
  team text not null check (team in ('Mariners', 'Opponent')),
  created_at timestamptz not null default now()
);

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  pos text not null,
  second_pos text,
  height text,
  image_url text,
  squad_number integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.staff (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  bio text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Recommended RLS Model

Public users:
- `select` on published content tables

Authenticated editors:
- `insert`
- `update`
- `delete`

Owners and admins:
- full access

## Helper Function For Roles

```sql
create or replace function public.has_editor_access()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('admin', 'club', 'creator')
  );
$$;
```

## Turn On RLS

```sql
alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.fixtures enable row level security;
alter table public.goals enable row level security;
alter table public.players enable row level security;
alter table public.staff enable row level security;
```

## Policies

```sql
create policy "Public read profiles"
on public.profiles for select
using (true);

create policy "Editors manage profiles"
on public.profiles for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "Public read site settings"
on public.site_settings for select
using (true);

create policy "Editors manage site settings"
on public.site_settings for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "Public read fixtures"
on public.fixtures for select
using (true);

create policy "Editors manage fixtures"
on public.fixtures for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "Public read goals"
on public.goals for select
using (true);

create policy "Editors manage goals"
on public.goals for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "Public read players"
on public.players for select
using (true);

create policy "Editors manage players"
on public.players for all
using (public.has_editor_access())
with check (public.has_editor_access());

create policy "Public read staff"
on public.staff for select
using (true);

create policy "Editors manage staff"
on public.staff for all
using (public.has_editor_access())
with check (public.has_editor_access());
```

## Atomic Match Result Submission

The admin dashboard submits match results (fixture update + goal replacement) as a single atomic RPC call to avoid partial writes.

```sql
create or replace function public.submit_match_result(
  p_fixture_id uuid,
  p_mariners_score int,
  p_opponent_score int,
  p_goals jsonb default '[]'::jsonb
) returns void
language plpgsql
security definer
as $$
begin
  update public.fixtures
  set status       = 'completed',
      mariners_score = p_mariners_score,
      opponent_score = p_opponent_score,
      updated_at   = now()
  where id = p_fixture_id;

  delete from public.goals where fixture_id = p_fixture_id;

  insert into public.goals (fixture_id, player_name, minute, team)
  select p_fixture_id,
         (g ->> 'player_name')::text,
         (g ->> 'minute')::int,
         (g ->> 'team')::text
  from jsonb_array_elements(p_goals) g;
end;
$$;

grant execute on function public.submit_match_result to authenticated;
```

## Storage Guidance

If you use the `team-media` bucket:
- allow public read for published assets
- restrict uploads and deletes to authenticated editors
- store path prefixes such as:
  - `players/`
  - `staff/`
  - `branding/`
  - `sponsors/`

## Diagram

![Admin auth and data flow for the team site template](../assets/supabase-auth-data-flow.svg)

## Notes For Rebranding

The current mock data uses the placeholder team name `Mariners`. When a real club adopts this template, update:
- score column names if desired
- goal `team` labels if desired
- branding rows in `site_settings`

If you want neutral naming from day one, rename `mariners_score` to `home_score` and add a `club_side` field later.
