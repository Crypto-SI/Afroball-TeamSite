import {
  mapFixtureRecord,
  mapPlayerRecord,
  mapStaffRecord,
} from "@/lib/team-site-data";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "./types";

type FixtureRow = Database["public"]["Tables"]["fixtures"]["Row"];
type GoalRow = Database["public"]["Tables"]["goals"]["Row"];
type PlayerRow = Database["public"]["Tables"]["players"]["Row"];
type StaffRow = Database["public"]["Tables"]["staff"]["Row"];
export type PartnershipRow = Database["public"]["Tables"]["partnerships"]["Row"];
export type FixtureMediaRow = Database["public"]["Tables"]["fixture_media"]["Row"];
export type FanPurchaseRow = Database["public"]["Tables"]["fan_purchases"]["Row"];
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type SiteSettingsRow = Database["public"]["Tables"]["site_settings"]["Row"];
type FixtureWithGoals = FixtureRow & { goals: GoalRow[] | null };

const FIXTURE_SELECT =
  "id, opponent, fixture_date, fixture_time, venue, status, mariners_score, opponent_score, created_at, updated_at, goals(id, fixture_id, player_name, minute, team, created_at)";

export async function fetchCoreDashboardData(supabase: SupabaseClient) {
  const [fixturesRes, playersRes, staffRes] = await Promise.all([
    supabase
      .from("fixtures")
      .select(FIXTURE_SELECT)
      .order("fixture_date", { ascending: false }),
    supabase.from("players").select("*").eq("is_active", true).order("name"),
    supabase.from("staff").select("*").eq("is_active", true).order("name"),
  ]);

  const firstError = fixturesRes.error ?? playersRes.error ?? staffRes.error;
  if (firstError) {
    return { data: null, error: firstError };
  }

  const fixtureRows = (fixturesRes.data ?? []) as FixtureWithGoals[];
  const playerRows = (playersRes.data ?? []) as PlayerRow[];
  const staffRows = (staffRes.data ?? []) as StaffRow[];

  return {
    data: {
      fixtures: fixtureRows.map((fixture) => mapFixtureRecord(fixture, fixture.goals ?? [])),
      players: playerRows.map(mapPlayerRecord),
      staff: staffRows.map(mapStaffRecord),
    },
    error: null,
  };
}

export async function fetchCommonDashboardData(supabase: SupabaseClient) {
  const [partnershipsRes, mediaRes, settingsRes] = await Promise.all([
    supabase.from("partnerships").select("*").order("name"),
    supabase.from("fixture_media").select("*").order("created_at", { ascending: false }),
    supabase.from("site_settings").select("*").limit(1).single(),
  ]);

  return {
    partnerships: (partnershipsRes.data ?? []) as PartnershipRow[],
    fixtureMedia: (mediaRes.data ?? []) as FixtureMediaRow[],
    siteSettings: (settingsRes.data ?? null) as SiteSettingsRow | null,
  };
}

export async function fetchAdminDashboardData(supabase: SupabaseClient) {
  const [profilesRes, purchasesRes] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    supabase.from("fan_purchases").select("*").order("created_at", { ascending: false }),
  ]);

  return {
    profiles: (profilesRes.data ?? []) as ProfileRow[],
    fanPurchases: (purchasesRes.data ?? []) as FanPurchaseRow[],
  };
}

export async function fetchFanPurchases(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase
    .from("fan_purchases")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return (data ?? []) as FanPurchaseRow[];
}
