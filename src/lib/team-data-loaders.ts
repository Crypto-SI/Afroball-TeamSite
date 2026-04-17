import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  INITIAL_FIXTURES,
  INITIAL_PLAYERS,
  INITIAL_STAFF,
  mapFixtureRecord,
  mapPlayerRecord,
  mapStaffRecord,
  type Fixture,
  type Player,
  type StaffMember,
} from "@/lib/team-site-data";
import type { Database } from "@/types/database";

type FixtureRow = Database["public"]["Tables"]["fixtures"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
type FixtureWithGoals = FixtureRow & { goals: GoalRow[] | null };
type PlayerRow = Database["public"]["Tables"]["players"]["Row"];
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];

export const DEFAULT_SITE_SETTINGS: SiteSettingsRow = {
  id: "default-site-settings",
  club_name: "Toman Mariners FC",
  short_name: "Mariners",
  primary_color: "#0f172a",
  accent_color: "#f59e0b",
  stadium_name: "Mariner Dome",
  contact_email: "contact@tomanmariners.com",
  contact_phone: "+1 (555) MARINER",
  registration_open: false,
  registration_password: null,
  created_at: new Date(0).toISOString(),
  updated_at: new Date(0).toISOString(),
};

const FIXTURE_SELECT =
  "id, opponent, fixture_date, fixture_time, venue, status, mariners_score, opponent_score, created_at, updated_at, goals(id, fixture_id, player_name, minute, team, created_at)";

export async function getFixtures(): Promise<Fixture[]> {
  if (!hasSupabaseEnv()) {
    return INITIAL_FIXTURES;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("fixtures")
      .select(FIXTURE_SELECT)
      .order("fixture_date", { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_FIXTURES;
    }

    return (data as FixtureWithGoals[]).map((fixture) =>
      mapFixtureRecord(fixture, fixture.goals ?? [])
    );
  } catch {
    return INITIAL_FIXTURES;
  }
}

export async function getPlayers(): Promise<Player[]> {
  if (!hasSupabaseEnv()) {
    return INITIAL_PLAYERS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error || !data || data.length === 0) {
      return INITIAL_PLAYERS;
    }

    return (data as PlayerRow[]).map(mapPlayerRecord);
  } catch {
    return INITIAL_PLAYERS;
  }
}

export async function getStaff(): Promise<StaffMember[]> {
  if (!hasSupabaseEnv()) {
    return INITIAL_STAFF;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("staff")
      .select("*")
      .eq("is_active", true)
      .order("name");

    if (error || !data || data.length === 0) {
      return INITIAL_STAFF;
    }

    return (data as StaffRow[]).map(mapStaffRecord);
  } catch {
    return INITIAL_STAFF;
  }
}

export async function getSiteSettings(): Promise<SiteSettingsRow> {
  if (!hasSupabaseEnv()) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .limit(1)
      .single();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return data as SiteSettingsRow;
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
