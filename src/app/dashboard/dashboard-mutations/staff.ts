import { z } from "zod";
import type { SupabaseClient } from "../types";
import { nonEmptyString, optionalUrlString } from "./shared";

export type StaffInput = {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
};

const StaffInputSchema = z.object({
  name: nonEmptyString,
  role: nonEmptyString,
  bio: z.string(),
  imageUrl: optionalUrlString,
});

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
