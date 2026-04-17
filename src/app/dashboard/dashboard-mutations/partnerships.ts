import { z } from "zod";
import type { Database } from "@/types/database";
import type { SupabaseClient } from "../types";
import { nonEmptyString, optionalUrlString } from "./shared";

type PartnershipTier = Database["public"]["Tables"]["partnerships"]["Row"]["tier"];

export type PartnershipInput = {
  name: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  tier: PartnershipTier;
};

const PartnershipInputSchema = z.object({
  name: nonEmptyString,
  description: z.string(),
  logoUrl: optionalUrlString,
  websiteUrl: optionalUrlString,
  tier: z.enum(["platinum", "gold", "silver", "bronze"]).nullable(),
});

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
