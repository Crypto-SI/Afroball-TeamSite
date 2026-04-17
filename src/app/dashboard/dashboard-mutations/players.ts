import { z } from "zod";
import type { SupabaseClient } from "../types";
import { nonEmptyString, optionalUrlString } from "./shared";

export type PlayerInput = {
  name: string;
  pos: string;
  secondPos: string;
  height: string;
  imageUrl: string;
};

const PlayerInputSchema = z.object({
  name: nonEmptyString,
  pos: nonEmptyString,
  secondPos: z.string(),
  height: z.string(),
  imageUrl: optionalUrlString,
});

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
