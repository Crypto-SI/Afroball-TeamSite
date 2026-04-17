import type { Database } from "@/types/database";
import type { SupabaseClient } from "../types";

type SiteSettingsUpdate = Database["public"]["Tables"]["site_settings"]["Update"];

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
