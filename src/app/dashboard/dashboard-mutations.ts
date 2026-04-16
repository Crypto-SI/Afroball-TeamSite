import { z } from "zod";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "./types";

type GoalTeam = Database["public"]["Tables"]["goals"]["Row"]["team"];
type PartnershipTier = Database["public"]["Tables"]["partnerships"]["Row"]["tier"];
type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];
type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

export type FixtureInput = {
  opponent: string;
  date: string;
  time: string;
  venue: string;
};

export type MatchResultGoalInput = {
  player: string;
  minute: number;
  team: GoalTeam;
};

export type PlayerInput = {
  name: string;
  pos: string;
  secondPos: string;
  height: string;
  imageUrl: string;
};

export type StaffInput = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

export type PartnershipInput = {
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  tier: PartnershipTier;
};

export type FixtureMediaInput = {
  fixtureId: string;
  videoUrl: string;
  title: string;
};

const nonEmptyString = z.string().trim().min(1);
const optionalUrlString = z.string().trim().url().or(z.literal(""));

const FixtureInputSchema = z.object({
  opponent: nonEmptyString,
  date: nonEmptyString,
  time: nonEmptyString,
  venue: nonEmptyString,
});

const MatchResultGoalInputSchema = z.object({
  player: nonEmptyString,
  minute: z.number().int().min(0).max(130),
  team: z.enum(["Mariners", "Opponent"]),
});

const PlayerInputSchema = z.object({
  name: nonEmptyString,
  pos: nonEmptyString,
  secondPos: z.string(),
  height: z.string(),
  imageUrl: optionalUrlString,
});

const StaffInputSchema = z.object({
  name: nonEmptyString,
  role: nonEmptyString,
  bio: z.string(),
  imageUrl: optionalUrlString,
});

const PartnershipInputSchema = z.object({
  name: nonEmptyString,
  description: z.string(),
  logoUrl: optionalUrlString,
  websiteUrl: optionalUrlString,
  tier: z.enum(["platinum", "gold", "silver", "bronze"]).nullable(),
});

const FixtureMediaInputSchema = z.object({
  fixtureId: nonEmptyString,
  videoUrl: z.string().trim().url(),
  title: z.string(),
});

export function getMutationErrorMessage(error: unknown) {
  if (error instanceof z.ZodError) {
    return error.issues[0]?.message ?? "Invalid form input.";
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export async function createFixture(supabase: SupabaseClient, input: FixtureInput) {
  const validated = FixtureInputSchema.parse(input);

  return supabase.from("fixtures").insert({
    opponent: validated.opponent,
    fixture_date: validated.date,
    fixture_time: validated.time,
    venue: validated.venue,
    status: "upcoming",
  });
}

export async function deleteFixture(supabase: SupabaseClient, id: string) {
  return supabase.from("fixtures").delete().eq("id", id);
}

export async function submitMatchResult(
  supabase: SupabaseClient,
  fixtureId: string,
  marinersScore: number,
  opponentScore: number,
  goals: MatchResultGoalInput[]
) {
  const validatedGoals = z.array(MatchResultGoalInputSchema).parse(goals);

  return supabase.rpc("submit_match_result", {
    p_fixture_id: fixtureId,
    p_mariners_score: marinersScore,
    p_opponent_score: opponentScore,
    p_goals: validatedGoals.map((goal) => ({
      player_name: goal.player,
      minute: Number(goal.minute),
      team: goal.team,
    })),
  });
}

export async function createPlayer(supabase: SupabaseClient, input: PlayerInput) {
  const validated = PlayerInputSchema.parse(input);

  return supabase.from("players").insert({
    name: validated.name,
    pos: validated.pos,
    second_pos: validated.secondPos || null,
    height: validated.height || null,
    image_url: validated.imageUrl || null,
    is_active: true,
  });
}

export async function updatePlayer(
  supabase: SupabaseClient,
  id: string,
  input: PlayerInput
) {
  const validated = PlayerInputSchema.parse(input);

  return supabase
    .from("players")
    .update({
      name: validated.name,
      pos: validated.pos,
      second_pos: validated.secondPos || null,
      height: validated.height || null,
      image_url: validated.imageUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
}

export async function deletePlayer(supabase: SupabaseClient, id: string) {
  return supabase.from("players").delete().eq("id", id);
}

export async function createStaff(supabase: SupabaseClient, input: StaffInput) {
  const validated = StaffInputSchema.parse(input);

  return supabase.from("staff").insert({
    name: validated.name,
    role: validated.role,
    bio: validated.bio || null,
    image_url: validated.imageUrl || null,
    is_active: true,
  });
}

export async function deleteStaff(supabase: SupabaseClient, id: string) {
  return supabase.from("staff").delete().eq("id", id);
}

export async function createPartnership(supabase: SupabaseClient, input: PartnershipInput) {
  const validated = PartnershipInputSchema.parse(input);

  return supabase
    .from("partnerships")
    .insert({
      name: validated.name,
      description: validated.description || null,
      logo_url: validated.logoUrl || null,
      website_url: validated.websiteUrl || null,
      tier: validated.tier,
      is_active: true,
    })
    .select();
}

export async function togglePartnership(
  supabase: SupabaseClient,
  id: string,
  currentActive: boolean
) {
  return supabase
    .from("partnerships")
    .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deletePartnership(supabase: SupabaseClient, id: string) {
  return supabase.from("partnerships").delete().eq("id", id);
}

export async function createFixtureMedia(supabase: SupabaseClient, input: FixtureMediaInput) {
  const validated = FixtureMediaInputSchema.parse(input);

  return supabase
    .from("fixture_media")
    .insert({
      fixture_id: validated.fixtureId,
      video_url: validated.videoUrl,
      title: validated.title || null,
    })
    .select();
}

export async function deleteFixtureMedia(supabase: SupabaseClient, id: string) {
  return supabase.from("fixture_media").delete().eq("id", id);
}

export async function updateSiteSettings(
  supabase: SupabaseClient,
  id: string,
  update: SiteSettingsUpdate
) {
  return supabase
    .from("site_settings")
    .update(update)
    .eq("id", id)
    .select()
    .single();
}

export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: ProfileRole
) {
  return supabase.from("profiles").update({ role }).eq("id", userId);
}
