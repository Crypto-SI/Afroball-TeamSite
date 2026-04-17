import type { Database } from "@/types/database";
import type { SupabaseClient } from "../types";

type ProfileRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

export async function updateUserRole(
  supabase: SupabaseClient,
  userId: string,
  role: ProfileRole
) {
  return supabase.from("profiles").update({ role }).eq("id", userId);
}
