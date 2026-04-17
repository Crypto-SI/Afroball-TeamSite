import { z } from "zod";
import type { SupabaseClient } from "../types";
import { nonEmptyString } from "./shared";

export type FixtureMediaInput = {
  fixtureId: string;
  videoUrl: string;
  title: string;
};

const FixtureMediaInputSchema = z.object({
  fixtureId: nonEmptyString,
  videoUrl: z.string().trim().url(),
  title: z.string(),
});

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
