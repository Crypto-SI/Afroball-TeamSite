import type { createClient } from "@/lib/supabase/client";

/** The Supabase browser client type */
export type SupabaseClient = ReturnType<typeof createClient>;

/** Dashboard mode */
export type DashboardMode = "mock" | "live" | "schema-missing";
