import { z } from "zod";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "../types";
import { nonEmptyString } from "./shared";

type GoalTeam = Database["public"]["Tables"]["goals"]["Row"]["team"];

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
